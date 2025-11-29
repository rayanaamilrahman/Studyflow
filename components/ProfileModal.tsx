import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { X, Camera, LogOut } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updatedUser: User) => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<Props> = ({ isOpen, onClose, user, onSave, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setAvatar(user.avatar || '');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large. Please select an image under 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
        alert("Name cannot be empty");
        return;
    }
    onSave({ ...user, name, avatar });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative">
        
        {/* Header Background */}
        <div className="h-24 bg-gradient-to-r from-brand-600 to-cyan-600"></div>
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition backdrop-blur-sm">
            <X size={20} />
        </button>

        <div className="px-6 pb-6 -mt-12 flex flex-col items-center">
            {/* Avatar */}
            <div className="relative group cursor-pointer mb-4">
                <div 
                    className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                    <span className="text-brand-500 font-bold text-4xl">{name.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <div 
                    className="absolute bottom-0 right-0 p-2 bg-brand-500 rounded-full text-white shadow-lg cursor-pointer hover:bg-brand-600 transition"
                     onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                    <Camera size={16} />
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Edit Profile</h2>

            <div className="w-full space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Display Name</label>
                    <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-800 dark:text-white bg-slate-50 dark:bg-black/40 font-medium"
                    placeholder="Your Name"
                    />
                </div>
                
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Connected Accounts</label>
                    {user.provider === 'google' ? (
                        <div className="flex items-center space-x-3 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 p-4 rounded-xl border border-green-200 dark:border-green-500/20">
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            <span>Google Account Linked</span>
                        </div>
                    ) : (
                        <button 
                            onClick={() => alert("Redirecting to Google Link flow...")}
                            className="w-full flex items-center justify-center space-x-2 p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl transition text-sm font-bold"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            <span>Link Google Account</span>
                        </button>
                    )}
                </div>
            </div>
            
            <div className="flex w-full mt-8 gap-4">
                 <button 
                    onClick={onLogout} 
                    className="flex-1 flex items-center justify-center space-x-2 text-red-600 dark:text-red-400 font-bold px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                    <LogOut size={18} />
                    <span>Log Out</span>
                </button>
                <button onClick={handleSave} className="flex-[2] bg-slate-900 dark:bg-white text-white dark:text-black font-bold px-4 py-3 rounded-xl hover:opacity-90 transition shadow-lg">
                    Save Changes
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};