import React, { useState } from 'react';
import { Mail, Lock, Loader2, GraduationCap, ArrowRight, Zap } from 'lucide-react';
import { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
          name: email.split('@')[0] || "Student",
          email: email,
          provider: 'email'
      });
    }, 1500);
  };

  const handleGoogleLogin = () => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLogin({
            name: "Alex Student",
            email: "alex.student@gmail.com",
            provider: 'google',
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" 
        });
      }, 1500);
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Abstract Background Mesh */}
      <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-brand-900/30 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-cyan-900/30 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Glass Card */}
        <div className="bg-white/10 dark:bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 md:p-10">
          
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-brand-500 to-cyan-500 p-3.5 rounded-2xl shadow-lg shadow-brand-500/40 mb-5 transform hover:scale-110 transition-transform duration-300">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight text-center">StudyFlow</h1>
            <p className="text-slate-400 text-center mt-2 text-sm">Unlock your potential with AI-driven learning.</p>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 bg-white dark:bg-white/10 border border-transparent hover:border-white/20 hover:bg-white/10 text-slate-800 dark:text-white font-medium py-3.5 rounded-xl transition-all duration-300 mb-6 group"
          >
             {isLoading ? <Loader2 className="animate-spin text-white" size={20}/> : (
                <>
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Continue with Google</span>
                </>
             )}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="px-3 bg-black/40 text-slate-500 rounded-full backdrop-blur-sm">or</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 ml-1 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                    </div>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 bg-black/40 focus:bg-black/60 transition-all outline-none text-white placeholder:text-slate-600"
                        placeholder="student@example.com"
                    />
                </div>
            </div>
            
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 ml-1 uppercase tracking-wider">Password</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                    </div>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 bg-black/40 focus:bg-black/60 transition-all outline-none text-white placeholder:text-slate-600"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-slate-400 cursor-pointer select-none hover:text-slate-300 transition-colors">
                    <input type="checkbox" className="mr-2 rounded border-white/20 text-brand-600 focus:ring-brand-500 bg-white/5" />
                    Remember me
                </label>
                <a href="#" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Forgot password?</a>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-600/20 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
                {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : (
                    <>
                        <span>Sign In</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
                Don't have an account? <a href="#" className="text-white font-semibold hover:underline decoration-brand-500">Create one now</a>
            </p>
        </div>
      </div>
    </div>
  );
};