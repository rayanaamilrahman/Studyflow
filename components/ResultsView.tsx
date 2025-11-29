import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { GeneratedContent, OutputFormat, Flashcard, QuizQuestion } from '../types';
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle, XCircle, Download, LayoutDashboard, BrainCircuit, Loader2, Play, Sparkles, Video } from 'lucide-react';
import { ChatWidget } from './ChatWidget';

interface Props {
  content: GeneratedContent;
  onRefine?: (format: OutputFormat, count?: number) => void;
  isRefining?: boolean;
}

export const ResultsView: React.FC<Props> = ({ content, onRefine, isRefining }) => {
  const [tutorContext, setTutorContext] = useState(content.summary || '');

  return (
    <div className="relative">
      {/* Content Rendering */}
      {content.type === OutputFormat.NOTES && <NotesView text={content.summary} onRefine={onRefine} isRefining={isRefining} />}
      {content.type === OutputFormat.FLASHCARDS && <FlashcardsView cards={content.flashcards || []} />}
      {content.type === OutputFormat.QUIZ && <QuizView questions={content.quiz || []} />}
      {content.type === OutputFormat.VIDEO && <VideoView uri={content.videoUri || ''} title={content.title} />}
      
      {/* AI Tutor Widget - Always Available */}
      <ChatWidget context={content.summary || content.originalInput} />
    </div>
  );
};

const NotesView: React.FC<{ text: string; onRefine?: (format: OutputFormat, count?: number) => void; isRefining?: boolean }> = ({ text, onRefine, isRefining }) => {
  const [showCount, setShowCount] = useState<OutputFormat | null>(null);

  const handleRefineClick = (format: OutputFormat) => {
    setShowCount(format);
  };

  const confirmRefine = (count: number) => {
      if (showCount && onRefine) {
          onRefine(showCount, count);
          setShowCount(null);
      }
  };

  return (
    <div className="space-y-6">
      {onRefine && (
          <div className="p-4 bg-white/50 dark:bg-brand-900/10 backdrop-blur-md rounded-2xl border border-white/20 dark:border-brand-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 relative shadow-sm">
              <div className="flex items-center space-x-3">
                 <div className="p-2.5 bg-brand-100 dark:bg-brand-500/20 rounded-xl text-brand-600 dark:text-brand-300">
                     <BrainCircuit size={20} />
                 </div>
                 <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white">Deepen Understanding</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Generate active recall materials from these notes.</p>
                 </div>
              </div>
              <div className="flex space-x-3 relative">
                  <button 
                    onClick={() => handleRefineClick(OutputFormat.FLASHCARDS)}
                    disabled={isRefining}
                    className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-brand-300 dark:hover:border-brand-500/50 transition disabled:opacity-50"
                  >
                     {isRefining ? <Loader2 className="animate-spin" size={16} /> : <LayoutDashboard size={16} className="text-brand-500" />}
                     <span>Flashcards</span>
                  </button>
                  <button 
                    onClick={() => handleRefineClick(OutputFormat.QUIZ)}
                    disabled={isRefining}
                    className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-brand-300 dark:hover:border-brand-500/50 transition disabled:opacity-50"
                  >
                     {isRefining ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} className="text-cyan-500" />}
                     <span>Quiz</span>
                  </button>
              </div>

              {/* Quantity Popup */}
              {showCount && (
                  <div className="absolute top-full right-0 mt-3 bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 p-5 z-50 w-72 animate-in fade-in zoom-in-95">
                      <h5 className="font-semibold text-slate-800 dark:text-white mb-4 text-center">How many {showCount === OutputFormat.FLASHCARDS ? 'cards' : 'questions'}?</h5>
                      <div className="grid grid-cols-4 gap-3">
                          {[5, 10, 15, 20].map(num => (
                              <button
                                key={num}
                                onClick={() => confirmRefine(num)}
                                className="p-2.5 bg-slate-50 dark:bg-white/5 hover:bg-brand-50 dark:hover:bg-brand-500/20 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-300 rounded-xl border border-slate-200 dark:border-white/10 hover:border-brand-200 dark:hover:border-brand-500/50 text-sm font-bold transition"
                              >
                                  {num}
                              </button>
                          ))}
                      </div>
                      <button 
                        onClick={() => setShowCount(null)}
                        className="w-full mt-4 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 py-1"
                      >
                          Cancel
                      </button>
                  </div>
              )}
          </div>
      )}

      <div className="prose prose-slate dark:prose-invert max-w-none p-8 md:p-12 bg-white dark:bg-black/40 backdrop-blur-sm shadow-sm rounded-3xl border border-slate-100 dark:border-white/10">
        <ReactMarkdown
          components={{
              h1: ({node, ...props}) => <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-8 border-b border-slate-100 dark:border-white/10 pb-4" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-10 mb-4 flex items-center gap-2" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-brand-600 dark:text-brand-400 mt-8 mb-3" {...props} />,
              ul: ({node, ...props}) => <ul className="list-none space-y-3 mb-6" {...props} />,
              li: ({node, ...props}) => <li className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:h-2 before:w-2 before:bg-brand-400 before:rounded-full text-slate-600 dark:text-slate-300 leading-relaxed" {...props} />,
              p: ({node, ...props}) => <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed text-lg" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-white bg-brand-100/50 dark:bg-brand-500/10 px-1 rounded" {...props} />,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
};

const FlashcardsView: React.FC<{ cards: Flashcard[] }> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 300);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length), 300);
  };

  if (cards.length === 0) return <div className="text-center p-10 text-slate-500">No cards generated.</div>;

  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px]">
      <div className="w-full max-w-2xl perspective-1000 h-96 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10 text-center relative overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-cyan-500"></div>
            <span className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-6">Question {currentIndex + 1}</span>
            <p className="text-3xl font-bold text-slate-800 dark:text-white leading-tight">{currentCard.front}</p>
            <div className="absolute bottom-6 flex items-center text-xs text-brand-500 font-medium opacity-60">
                <RotateCw size={12} className="mr-1" /> Click to reveal
            </div>
          </div>
          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-brand-900 to-slate-900 border border-brand-500/30 rounded-3xl shadow-2xl shadow-brand-900/40 flex flex-col items-center justify-center p-10 text-center rotate-y-180 relative overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
             {/* Abstract blob background */}
             <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-500/20 rounded-full blur-3xl"></div>
             <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"></div>
             
            <span className="text-xs font-bold tracking-[0.2em] text-brand-300 uppercase mb-6 relative z-10">Answer</span>
            <p className="text-2xl text-white leading-relaxed relative z-10 font-medium">{currentCard.back}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-10 mt-12">
        <button onClick={handlePrev} className="p-4 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-brand-500/30 transition shadow-sm group">
          <ChevronLeft size={24} className="text-slate-600 dark:text-slate-400 group-hover:text-brand-500" />
        </button>
        <div className="px-6 py-2 bg-white/50 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
            <span className="font-mono text-sm font-bold text-slate-600 dark:text-slate-300">{currentIndex + 1} / {cards.length}</span>
        </div>
        <button onClick={handleNext} className="p-4 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-brand-500/30 transition shadow-sm group">
          <ChevronRight size={24} className="text-slate-600 dark:text-slate-400 group-hover:text-brand-500" />
        </button>
      </div>
    </div>
  );
};

const QuizView: React.FC<{ questions: QuizQuestion[] }> = ({ questions }) => {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (questionId: string, option: string) => {
    if (showResults) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.answer) score++;
    });
    return score;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      {showResults && (
        <div className="bg-gradient-to-r from-brand-900/40 to-cyan-900/40 border border-brand-500/30 p-8 rounded-3xl flex items-center justify-between backdrop-blur-md animate-fade-in-up">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Quiz Results</h3>
            <p className="text-brand-200">You scored <span className="text-white font-bold text-xl">{calculateScore()}</span> out of {questions.length}</p>
          </div>
          <button onClick={() => { setShowResults(false); setUserAnswers({}); }} className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold text-white transition">
            <RotateCw size={18} /> <span>Retry Quiz</span>
          </button>
        </div>
      )}

      {questions.map((q, idx) => {
        const isCorrect = userAnswers[q.id] === q.answer;
        const hasAnswered = !!userAnswers[q.id];
        
        return (
          <div key={q.id} className="bg-white dark:bg-white/5 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/10 transition hover:border-brand-500/20">
            <div className="flex items-start justify-between mb-6">
               <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                   <span className="text-brand-500/50 mr-3 text-2xl font-bold">0{idx + 1}</span>
                   {q.question}
               </h3>
               {showResults && (
                 isCorrect 
                  ? <CheckCircle className="text-green-500 shrink-0" size={28} /> 
                  : <XCircle className="text-red-500 shrink-0" size={28} />
               )}
            </div>
            
            <div className="space-y-3">
              {q.options.map((option) => {
                let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium ";
                
                if (showResults) {
                  if (option === q.answer) btnClass += "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400 ";
                  else if (userAnswers[q.id] === option) btnClass += "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 ";
                  else btnClass += "bg-transparent border-transparent text-slate-400 opacity-50 ";
                } else {
                  if (userAnswers[q.id] === option) btnClass += "bg-brand-50 dark:bg-brand-600 text-brand-700 dark:text-white border-brand-500 shadow-md shadow-brand-500/20 ";
                  else btnClass += "bg-slate-50 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-brand-200 dark:hover:border-white/20 ";
                }

                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(q.id, option)}
                    className={btnClass}
                    disabled={showResults}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            
            {showResults && !isCorrect && (
              <div className="mt-6 p-5 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-xl text-sm">
                <span className="font-bold block mb-1 text-brand-800 dark:text-brand-300 flex items-center gap-2"><Sparkles size={14}/> Explanation</span>
                <p className="text-brand-700 dark:text-brand-100 opacity-90">{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}

      {!showResults && questions.length > 0 && (
        <div className="flex justify-end pt-4">
          <button 
            onClick={() => setShowResults(true)}
            disabled={Object.keys(userAnswers).length !== questions.length}
            className="bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1"
          >
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
};

const VideoView: React.FC<{ uri: string, title: string }> = ({ uri, title }) => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group">
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10"></div>
         <video 
            src={uri} 
            controls 
            className="w-full aspect-video" 
            poster="https://placehold.co/1280x720/000000/333333?text=AI+Lesson+Generating..."
            autoPlay
         >
           Your browser does not support the video tag.
         </video>
      </div>
      <div className="mt-8 p-8 bg-white dark:bg-white/5 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-brand-500/10 rounded-xl text-brand-500">
                <Video size={24} />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">{title}</h2>
                <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                    This video was AI-generated based on your study notes. It visualizes key concepts and events, including historical re-enactments if applicable.
                </p>
            </div>
          </div>
      </div>
    </div>
  );
};