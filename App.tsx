import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Link as LinkIcon, Upload, Sparkles, Loader2, Library, GraduationCap, LayoutDashboard, BrainCircuit, X, LogOut, User as UserIcon, Settings, Edit2, Save, Video, Trash2, AlertCircle, Moon, Sun, Search, Zap, Plus, Menu } from 'lucide-react';
import { ContentType, StudyStyle, OutputFormat, GeneratedContent, User } from './types';
import { generateNotes, generateFlashcards, generateQuiz, summarizeUrl, generateEducationalVideo } from './services/geminiService';
import { parseFile } from './services/fileParser';
import { ResultsView } from './components/ResultsView';
import { LoginView } from './components/LoginView';
import { OnboardingView } from './components/OnboardingView';
import { ProfileModal } from './components/ProfileModal';
import { IntroView } from './components/IntroView';

const App: React.FC = () => {
  // --- Theme State ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('studyflow_theme');
        if (saved === 'dark' || saved === 'light') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'dark'; // Default to dark for futuristic look
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('studyflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- Persisted State Initialization ---
  
  // 1. Initialize User from LocalStorage
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('studyflow_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse user", e);
      return null;
    }
  });

  // 2. Initialize Onboarding Status
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const completed = localStorage.getItem('studyflow_onboarding_complete');
    return !completed;
  });

  // 3. Initialize History based on the User
  const [history, setHistory] = useState<GeneratedContent[]>(() => {
    if (!user) return [];
    try {
      const key = `studyflow_history_${user.email}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse history", e);
      return [];
    }
  });

  // Derived State
  const isLoggedIn = !!user;

  // App State
  const [showIntro, setShowIntro] = useState(false);
  const [activeTab, setActiveTab] = useState<ContentType>(ContentType.TEXT);
  const [inputText, setInputText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [style, setStyle] = useState<StudyStyle>(StudyStyle.SIMPLE);
  const [format, setFormat] = useState<OutputFormat>(OutputFormat.NOTES);
  
  const [loading, setLoading] = useState(false);
  const [currentContent, setCurrentContent] = useState<GeneratedContent | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile

  // --- Persistence Effects ---

  // Save User Session
  useEffect(() => {
    if (user) {
      localStorage.setItem('studyflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('studyflow_user');
    }
  }, [user]);

  // Save History (Debounced)
  useEffect(() => {
    if (user) {
      setIsSaving(true);
      const key = `studyflow_history_${user.email}`;
      localStorage.setItem(key, JSON.stringify(history));
      const timer = setTimeout(() => setIsSaving(false), 800);
      return () => clearTimeout(timer);
    }
  }, [history, user]);

  // --- Handlers ---

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    
    // Check if onboarding is needed
    const hasCompletedOnboarding = localStorage.getItem(`studyflow_onboarding_complete_${userData.email}`);
    
    setShowIntro(true); // Show intro on fresh login for effect
    setShowOnboarding(!hasCompletedOnboarding);

    const key = `studyflow_history_${userData.email}`;
    const savedHistory = localStorage.getItem(key);
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    } else {
      setHistory([]);
    }
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentContent(null);
    setHistory([]); 
    setShowIntro(false);
    setShowProfileModal(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (user) {
        localStorage.setItem(`studyflow_onboarding_complete_${user.email}`, 'true');
        localStorage.setItem('studyflow_onboarding_complete', 'true');
    }
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this study session?")) {
        setHistory(prev => prev.filter(item => item.id !== id));
        if (currentContent?.id === id) {
            setCurrentContent(null);
        }
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (format === OutputFormat.VIDEO) {
          const aistudio = (window as any).aistudio;
          if (aistudio) {
              const hasKey = await aistudio.hasSelectedApiKey();
              if (!hasKey) {
                  const success = await aistudio.openSelectKey();
                  if (!success) {
                      setLoading(false);
                      return; 
                  }
              }
          }
      }

      let rawContent = '';
      let inputLabel = '';

      if (activeTab === ContentType.TEXT) {
        if (!inputText.trim()) throw new Error("Please enter some text.");
        rawContent = inputText;
        inputLabel = inputText.slice(0, 30) + '...';
      } else if (activeTab === ContentType.URL) {
        if (!urlInput.trim()) throw new Error("Please enter a URL.");
        inputLabel = urlInput;
        rawContent = await summarizeUrl(urlInput);
      } else if (activeTab === ContentType.FILE) {
        if (!selectedFile) throw new Error("Please upload a file.");
        inputLabel = selectedFile.name;
        rawContent = await parseFile(selectedFile);
      }

      const timestamp = Date.now();
      const id = `gen-${timestamp}`;
      let newContent: GeneratedContent = {
        id,
        timestamp,
        title: 'Generating...',
        originalInput: inputLabel,
        summary: '',
        type: format,
        style: style,
      };

      if (format === OutputFormat.NOTES) {
        const res = await generateNotes(rawContent, style);
        newContent.title = res.title;
        newContent.summary = res.markdown;
      } else if (format === OutputFormat.FLASHCARDS) {
        const res = await generateFlashcards(rawContent, style);
        newContent.title = res.title;
        newContent.flashcards = res.cards;
      } else if (format === OutputFormat.QUIZ) {
        const res = await generateQuiz(rawContent, style);
        newContent.title = res.title;
        newContent.quiz = res.questions;
      } else if (format === OutputFormat.VIDEO) {
        const res = await generateEducationalVideo(rawContent, style);
        newContent.title = res.title;
        newContent.videoUri = res.videoUri;
      }

      setCurrentContent(newContent);
      setHistory(prev => [newContent, ...prev]);

    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async (targetFormat: OutputFormat, count: number = 10) => {
    if (!currentContent || currentContent.type !== OutputFormat.NOTES) return;
    setLoading(true);

    try {
        const sourceText = currentContent.summary; 
        const timestamp = Date.now();
        const id = `gen-${timestamp}`;
        let newContent: GeneratedContent = {
            id,
            timestamp,
            title: `${currentContent.title} (${targetFormat === OutputFormat.FLASHCARDS ? 'Cards' : 'Quiz'})`,
            originalInput: currentContent.originalInput, 
            summary: '',
            type: targetFormat,
            style: currentContent.style
        };

        if (targetFormat === OutputFormat.FLASHCARDS) {
            const res = await generateFlashcards(sourceText, currentContent.style, count);
            newContent.flashcards = res.cards;
        } else if (targetFormat === OutputFormat.QUIZ) {
            const res = await generateQuiz(sourceText, currentContent.style, count);
            newContent.quiz = res.questions;
        }

        setCurrentContent(newContent);
        setHistory(prev => [newContent, ...prev]);
    } catch (error: any) {
        alert(`Error generating refinement: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };

  const loadFromHistory = (item: GeneratedContent) => {
    setCurrentContent(item);
    setSidebarOpen(false); // Close sidebar on mobile on select
  };

  const createNewSession = () => {
    setCurrentContent(null);
    setInputText('');
    setUrlInput('');
    setSelectedFile(null);
    setSidebarOpen(false);
  };

  if (!isLoggedIn) {
    return <LoginView onLogin={handleLoginSuccess} />;
  }

  // Show Intro before Onboarding or Main App
  if (showIntro) {
    return <IntroView onComplete={handleIntroComplete} />;
  }

  if (showOnboarding) {
    return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-black font-sans overflow-hidden transition-colors duration-500 relative">
        
        {/* Background Gradients for Futuristic Feel */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-500/10 rounded-full blur-[120px] dark:bg-brand-900/20"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[100px] dark:bg-cyan-900/20"></div>
        </div>

        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
            <div className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 w-80 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 z-40 transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
            {/* Sidebar Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-brand-500 to-cyan-500 p-2 rounded-lg shadow-lg shadow-brand-500/30">
                        <GraduationCap size={20} className="text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">StudyFlow</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500">
                    <X size={24} />
                </button>
            </div>

            {/* New Session Button */}
            <div className="p-4">
                <button 
                    onClick={createNewSession}
                    className="w-full flex items-center justify-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-black py-3 rounded-xl hover:opacity-90 transition font-bold shadow-lg shadow-brand-500/10"
                >
                    <Plus size={18} />
                    <span>New Session</span>
                </button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto px-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-4 mb-2 px-2">History</div>
                {history.length === 0 && (
                    <div className="text-center py-10 text-slate-400 dark:text-slate-600">
                        <Library size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No history yet.</p>
                    </div>
                )}
                {history.map((item) => (
                    <div 
                        key={item.id} 
                        onClick={() => loadFromHistory(item)}
                        className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${
                            currentContent?.id === item.id 
                            ? 'bg-white dark:bg-white/10 shadow-md border-slate-100 dark:border-white/5 text-brand-600 dark:text-white' 
                            : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate pr-6">{item.title}</h4>
                                <p className="text-xs opacity-60 truncate mt-0.5">{new Date(item.timestamp).toLocaleDateString()} • {item.type}</p>
                            </div>
                            {/* Format Icon */}
                            <div className="opacity-50">
                                {item.type === OutputFormat.NOTES && <FileText size={14} />}
                                {item.type === OutputFormat.FLASHCARDS && <BrainCircuit size={14} />}
                                {item.type === OutputFormat.QUIZ && <Zap size={14} />}
                                {item.type === OutputFormat.VIDEO && <Video size={14} />}
                            </div>
                        </div>

                        {/* Delete Button (Hover) */}
                        <button 
                            onClick={(e) => handleDeleteSession(item.id, e)}
                            className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 dark:hover:bg-red-900/50"
                            title="Delete Session"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                <div 
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center p-2 rounded-xl hover:bg-white dark:hover:bg-white/5 cursor-pointer transition border border-transparent hover:border-slate-200 dark:hover:border-white/5"
                >
                    <img 
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                    />
                    <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                    {user?.provider !== 'google' && (
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-2" title="Account not linked"></div>
                    )}
                    <Settings size={16} className="text-slate-400 ml-2" />
                </div>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full relative z-10 md:ml-80 transition-all duration-300">
            
            {/* Header */}
            <header className="h-20 px-6 flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg">
                        <Menu size={24} />
                    </button>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white hidden md:block">
                        {currentContent ? (
                            <span className="flex items-center gap-2">
                                <span className="opacity-50">Session /</span> 
                                {currentContent.title}
                            </span>
                        ) : 'New Study Session'}
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button 
                        className="md:hidden"
                        onClick={() => setShowProfileModal(true)}
                    >
                         <img 
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10"
                        />
                    </button>
                </div>
            </header>

            {/* Content Body */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 relative scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10">
                
                {/* Input View */}
                {!currentContent && (
                    <div className="max-w-4xl mx-auto animate-fade-in-up">
                        <div className="text-center mb-10">
                             <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                                What are we <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-cyan-500">mastering</span> today?
                             </h1>
                             <p className="text-slate-500 dark:text-slate-400 text-lg">Upload files, paste text, or share links. AI handles the rest.</p>
                        </div>

                        <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 md:p-8">
                            
                            {/* Tabs */}
                            <div className="flex p-1 bg-slate-100 dark:bg-black/40 rounded-xl mb-8">
                                {[
                                    { id: ContentType.TEXT, icon: FileText, label: 'Text' },
                                    { id: ContentType.URL, icon: LinkIcon, label: 'Website / YouTube' },
                                    { id: ContentType.FILE, icon: Upload, label: 'File Upload' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                                            activeTab === tab.id 
                                            ? 'bg-white dark:bg-brand-500 text-slate-900 dark:text-white shadow-md' 
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                                        }`}
                                    >
                                        <tab.icon size={16} />
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Inputs */}
                            <div className="min-h-[200px] mb-8">
                                {activeTab === ContentType.TEXT && (
                                    <textarea
                                        className="w-full h-48 p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition"
                                        placeholder="Paste your notes, essay, or lecture transcript here..."
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                    />
                                )}
                                {activeTab === ContentType.URL && (
                                    <div className="flex flex-col space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input
                                                type="url"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition"
                                                placeholder="https://youtube.com/watch?v=..."
                                                value={urlInput}
                                                onChange={(e) => setUrlInput(e.target.value)}
                                            />
                                        </div>
                                        <div className="p-4 bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-500/10 rounded-xl flex items-start space-x-3">
                                            <AlertCircle size={20} className="text-brand-500 shrink-0 mt-0.5" />
                                            <p className="text-sm text-brand-700 dark:text-brand-300">
                                                Supports YouTube videos, news articles, and educational blogs. The AI will browse and summarize the content.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {activeTab === ContentType.FILE && (
                                    <div className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl h-48 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-white/5 transition group cursor-pointer relative">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept=".pdf,.docx,.txt,.md"
                                        />
                                        <div className="p-4 bg-white dark:bg-white/10 rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform">
                                            <Upload size={24} className="text-brand-500" />
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 font-medium">{selectedFile ? selectedFile.name : "Click or Drag to Upload File"}</p>
                                        <p className="text-xs text-slate-400 mt-2">PDF, DOCX, TXT (Max 10MB)</p>
                                    </div>
                                )}
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Learning Style</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.values(StudyStyle).map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setStyle(s)}
                                                className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                                                    style === s 
                                                    ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/25' 
                                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-brand-300 dark:hover:border-white/30'
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Output Format</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { type: OutputFormat.NOTES, icon: FileText },
                                            { type: OutputFormat.FLASHCARDS, icon: LayoutDashboard },
                                            { type: OutputFormat.QUIZ, icon: Zap },
                                            { type: OutputFormat.VIDEO, icon: Video }
                                        ].map((f) => (
                                            <button
                                                key={f.type}
                                                onClick={() => setFormat(f.type)}
                                                className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center space-x-2 transition ${
                                                    format === f.type 
                                                    ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-500/25' 
                                                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-cyan-300 dark:hover:border-white/30'
                                                }`}
                                            >
                                                <f.icon size={14} />
                                                <span>{f.type}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Action */}
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white text-lg font-bold py-4 rounded-2xl shadow-xl shadow-brand-500/30 transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-3 group"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        <span>Analyzing Content...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
                                        <span>Generate Study Material</span>
                                    </>
                                )}
                            </button>

                        </div>
                    </div>
                )}

                {/* Results View */}
                {currentContent && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <button 
                                onClick={() => setCurrentContent(null)}
                                className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"
                            >
                                <X size={20} />
                                <span className="font-medium">Close Session</span>
                            </button>
                            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                                {isSaving ? 'Saving...' : 'Saved to History'}
                            </span>
                        </div>
                        <ResultsView 
                            content={currentContent} 
                            onRefine={handleRefine}
                            isRefining={loading && currentContent.type === OutputFormat.NOTES}
                        />
                    </div>
                )}
            </main>
        </div>

        {/* Profile Modal */}
        <ProfileModal 
            isOpen={showProfileModal} 
            onClose={() => setShowProfileModal(false)}
            user={user}
            onSave={handleUpdateProfile}
            onLogout={handleLogout}
        />

    </div>
  );
};

export default App;
