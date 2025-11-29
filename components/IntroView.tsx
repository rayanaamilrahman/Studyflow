import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Zap, BrainCircuit, GraduationCap, LayoutDashboard, Sparkles } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export const IntroView: React.FC<Props> = ({ onComplete }) => {
  const [scene, setScene] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 0.5;
      });
    }, 80);

    // Scene Sequence
    const sceneDuration = 4500; // ms per scene
    
    const t1 = setTimeout(() => setScene(1), sceneDuration);
    const t2 = setTimeout(() => setScene(2), sceneDuration * 2);
    const t3 = setTimeout(() => setScene(3), sceneDuration * 3);
    const tEnd = setTimeout(onComplete, sceneDuration * 4);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tEnd);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white font-sans flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/30 rounded-full blur-[120px] transition-all duration-[4000ms] ${scene % 2 === 0 ? 'scale-100 translate-y-0' : 'scale-150 translate-x-20'}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/30 rounded-full blur-[120px] transition-all duration-[4000ms] ${scene % 2 === 0 ? 'scale-100' : 'scale-125 -translate-y-20'}`}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl w-full px-6 text-center">
        
        {/* Scene 0: The Problem */}
        {scene === 0 && (
          <div className="animate-fade-in-up space-y-8">
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <BookOpen size={80} className="text-slate-500 opacity-50" />
                    <div className="absolute -right-2 -top-2 text-red-500 animate-bounce">
                        <span className="text-4xl font-bold">?</span>
                    </div>
                </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Drowning in <span className="text-slate-400 decoration-red-500/50 underline decoration-wavy">information</span>?
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Endless lectures, 100-page PDFs, and confusing videos...
            </p>
          </div>
        )}

        {/* Scene 1: The Solution (AI) */}
        {scene === 1 && (
          <div className="animate-fade-in-up space-y-8">
             <div className="flex justify-center mb-6 relative">
                 <div className="absolute inset-0 bg-brand-500/20 blur-xl rounded-full animate-pulse"></div>
                 <BrainCircuit size={80} className="text-brand-400 relative z-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Meet <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-cyan-400">StudyFlow</span>.
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Your intelligent companion that reads, watches, and summarizes for you.
            </p>
          </div>
        )}

        {/* Scene 2: Features */}
        {scene === 2 && (
          <div className="animate-fade-in-up space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm transform transition hover:scale-105">
                    <Zap className="mx-auto mb-4 text-yellow-400" size={40} />
                    <h3 className="text-xl font-bold mb-2">Instant Notes</h3>
                    <p className="text-sm text-slate-400">Condensed & Clear.</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm transform transition hover:scale-105 delay-100">
                    <LayoutDashboard className="mx-auto mb-4 text-brand-400" size={40} />
                    <h3 className="text-xl font-bold mb-2">Flashcards</h3>
                    <p className="text-sm text-slate-400">Active Recall.</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm transform transition hover:scale-105 delay-200">
                    <GraduationCap className="mx-auto mb-4 text-cyan-400" size={40} />
                    <h3 className="text-xl font-bold mb-2">AI Tutors</h3>
                    <p className="text-sm text-slate-400">Personalized Quizzes.</p>
                </div>
            </div>
            <h2 className="text-3xl font-bold">Turn hours into minutes.</h2>
          </div>
        )}

        {/* Scene 3: Ready */}
        {scene === 3 && (
          <div className="animate-fade-in-up space-y-8">
             <div className="flex justify-center mb-8">
                <div className="p-4 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-2xl shadow-2xl shadow-brand-500/50">
                    <Sparkles size={60} className="text-white animate-pulse" />
                </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
              Master Your Studies.
            </h1>
             <button 
                onClick={onComplete}
                className="mt-8 px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-slate-200 transition-all flex items-center mx-auto space-x-2 group"
             >
                 <span>Get Started</span>
                 <ArrowRight className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        )}

      </div>

      {/* Progress Bar / Skip */}
      <div className="absolute bottom-10 left-0 right-0 px-10 flex items-center justify-between z-20">
          <div className="flex-1 max-w-md mx-auto h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-500 transition-all duration-100 ease-linear" 
                style={{ width: `${(progress / 100) * 100}%` }}
              ></div>
          </div>
          <button 
            onClick={onComplete}
            className="absolute right-10 text-sm font-medium text-slate-500 hover:text-white transition-colors"
          >
            SKIP INTRO
          </button>
      </div>

    </div>
  );
};