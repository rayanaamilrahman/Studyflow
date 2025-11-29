import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export const OnboardingView: React.FC<Props> = ({ onComplete }) => {
  const [source, setSource] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  
  const sources = [
    "YouTube / Social Media",
    "Friend / Classmate",
    "Teacher / Professor",
    "Search Engine",
    "Other"
  ];

  const features = [
    "Instant Note Taking",
    "Flashcards & Memorization",
    "Practice Quizzes",
    "Summarizing Videos",
    "Exam Prep"
  ];

  const toggleInterest = (feature: string) => {
    if (interests.includes(feature)) {
      setInterests(interests.filter(i => i !== feature));
    } else {
      setInterests([...interests, feature]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (source && interests.length > 0) {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-brand-800/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-cyan-800/20 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-2xl bg-white/10 dark:bg-black/60 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative z-10 animate-fade-in-up">
        
        <div className="bg-gradient-to-r from-brand-600 to-cyan-600 p-10 text-white text-center">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 backdrop-blur-md shadow-inner border border-white/20">
                <Sparkles size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Welcome to StudyFlow</h1>
            <p className="text-brand-100 font-medium">Let's customize your AI study partner.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
            
            {/* Question 1 */}
            <div className="space-y-5">
                <label className="block text-xl font-bold text-white">
                    1. Where did you hear about StudyFlow?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sources.map((opt) => (
                        <button
                            type="button"
                            key={opt}
                            onClick={() => setSource(opt)}
                            className={`p-4 rounded-xl border text-left transition-all duration-300 flex items-center justify-between group ${
                                source === opt 
                                ? 'border-brand-500 bg-brand-500/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                                : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                            }`}
                        >
                            <span className="font-medium">{opt}</span>
                            {source === opt && <Check size={20} className="text-brand-400" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Question 2 */}
            <div className="space-y-5">
                <label className="block text-xl font-bold text-white">
                    2. What features are you most excited about? <span className="text-sm font-normal text-slate-500 ml-2">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {features.map((feature) => {
                        const isSelected = interests.includes(feature);
                        return (
                            <button
                                type="button"
                                key={feature}
                                onClick={() => toggleInterest(feature)}
                                className={`p-4 rounded-xl border text-left transition-all duration-300 flex items-center justify-between ${
                                    isSelected
                                    ? 'border-cyan-500 bg-cyan-500/20 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                                }`}
                            >
                                <span className="font-medium">{feature}</span>
                                {isSelected && <Check size={20} className="text-cyan-400" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-end">
                <button
                    type="submit"
                    disabled={!source || interests.length === 0}
                    className="px-10 py-4 bg-white text-black hover:bg-slate-200 text-lg font-bold rounded-xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                    <span>Get Started</span>
                    <ArrowRight size={20} />
                </button>
            </div>

        </form>
      </div>
    </div>
  );
};