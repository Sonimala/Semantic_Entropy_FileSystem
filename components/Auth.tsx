
import React, { useState, useEffect } from 'react';

interface AuthProps {
  onAuthSuccess: (user: { name: string; email: string }) => void;
}

interface UserRecord {
  name: string;
  email: string;
  password: string;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStoredUsers = (): UserRecord[] => {
    const users = localStorage.getItem('sefs_users');
    return users ? JSON.parse(users) : [];
  };

  const saveUser = (user: UserRecord) => {
    const users = getStoredUsers();
    users.push(user);
    localStorage.setItem('sefs_users', JSON.stringify(users));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const users = getStoredUsers();
      const normalizedEmail = formData.email.toLowerCase().trim();
      
      if (isLogin) {
        const existingUser = users.find(u => u.email.toLowerCase() === normalizedEmail);
        
        if (!existingUser) {
          setError("Invalid user. Please sign up to create an account.");
          setLoading(false);
          return;
        }

        if (existingUser.password !== formData.password) {
          setError("Invalid password. Please check your credentials.");
          setLoading(false);
          return;
        }

        onAuthSuccess({
          name: existingUser.name,
          email: existingUser.email
        });
      } else {
        const userExists = users.some(u => u.email.toLowerCase() === normalizedEmail);
        
        if (userExists) {
          setError("An account with this email already exists. Try signing in.");
          setLoading(false);
          return;
        }

        const newUser: UserRecord = {
          name: formData.name || formData.email.split('@')[0],
          email: formData.email,
          password: formData.password
        };

        saveUser(newUser);
        onAuthSuccess({
          name: newUser.name,
          email: newUser.email
        });
      }
      setLoading(false);
    }, 1200);
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      onAuthSuccess({
        name: 'Google User',
        email: 'user@google.com'
      });
      setLoading(false);
    }, 1000);
  };

  const handleGithubSignIn = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      onAuthSuccess({
        name: 'Github User',
        email: 'user@github.com'
      });
      setLoading(false);
    }, 1000);
  };

  const FeatureCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
    <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm flex items-start gap-4 transition-all duration-300">
      <div className="w-10 h-10 rounded-xl bg-blue-50/80 flex items-center justify-center flex-shrink-0">
        <i className={`fas ${icon} text-[#3b82f6] text-sm`}></i>
      </div>
      <div>
        <h4 className="text-[13px] font-bold text-slate-900 mb-0.5">{title}</h4>
        <p className="text-[11px] leading-tight text-slate-500 font-medium">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex bg-[#f5f7fb] overflow-hidden relative font-['Inter']">
      <div className="absolute top-[4%] left-[37%] w-2 h-2 bg-[#f8a5a5] rounded-full opacity-60"></div>
      <div className="absolute top-[0%] left-[53%] w-2 h-2 bg-[#fccb8d] rounded-full opacity-60"></div>
      <div className="absolute bottom-[2%] left-[82%] w-2 h-2 bg-[#a78bfa] rounded-full opacity-60"></div>
      <div className="absolute bottom-[10%] left-[21%] w-3 h-3 bg-[#9de5cf] rounded-full opacity-80"></div>
      <div className="absolute top-[75%] left-[4%] w-3 h-3 bg-[#a78bfa] rounded-full opacity-80"></div>

      <div className="flex-1 flex flex-col px-16 py-12 lg:px-28 lg:py-16 relative z-10">
        <div className="flex items-center gap-4 mb-20">
          <div className="w-12 h-12 rounded-xl bg-[#dbeafe] flex items-center justify-center border border-[#bfdbfe]/50 shadow-sm">
            <i className="fas fa-sparkles text-[#3b82f6] text-xl"></i>
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">SEFS</h1>
            <p className="text-[11px] font-medium text-slate-400 mt-1">Semantic Entropy File System</p>
          </div>
        </div>

        <div className="max-w-2xl mb-12">
          <h2 className="text-[52px] font-bold text-slate-900 leading-[1.1] tracking-tight mb-8">
            Your Files,<br />
            <span className="text-[#3b82f6]">Intelligently Organized.</span>
          </h2>
          <p className="text-slate-500 text-[16px] leading-relaxed font-medium max-w-xl">
            Upload any document — notes, PDFs, code files — and watch AI automatically cluster them into semantic categories on an interactive spatial map.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[620px] mb-12">
          <FeatureCard icon="fa-brain" title="AI-Powered Clustering" desc="Files auto-organize by semantic meaning" />
          <FeatureCard icon="fa-folder-tree" title="Smart Root Folder" desc="8 student categories under one tree" />
          <FeatureCard icon="fa-diagram-project" title="Graph & Spatial Maps" desc="Interactive 2D node visualization" />
          <FeatureCard icon="fa-fingerprint" title="Similarity Detection" desc="AI computes pairwise content similarity" />
          <FeatureCard icon="fa-book-open" title="Student Notes Ready" desc="Pre-loaded ML, DSA, OS, DBMS notes" />
          <FeatureCard icon="fa-shield-halved" title="Secure & Private" desc="Your files stay encrypted and private" />
        </div>

        <div className="mt-auto flex gap-16 items-start">
          <div className="flex flex-col items-center lg:items-start">
            <span className="text-[28px] font-bold text-[#3b82f6]">8</span>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mt-1">Smart Categories</span>
          </div>
          <div className="flex flex-col items-center lg:items-start">
            <span className="text-[28px] font-bold text-[#3b82f6]">16+</span>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mt-1">Sample Notes</span>
          </div>
          <div className="flex flex-col items-center lg:items-start">
            <div className="flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-[#3b82f6]">AI</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mt-1">Powered Analysis</span>
          </div>
        </div>
      </div>

      <div className="w-[640px] flex items-center justify-center pr-12 lg:pr-24 py-12 relative z-20">
        <div className="w-full max-w-[480px] bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-10 border border-slate-100">
          <div className="bg-[#e2e8f0]/50 p-1.5 rounded-2xl flex mb-12">
            <button 
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition-all duration-200 ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-3.5 rounded-xl text-xs font-bold transition-all duration-200 ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Sign Up
            </button>
          </div>

          <div className="mb-10">
            <h3 className="text-[24px] font-bold text-slate-900 mb-2">{isLogin ? 'Welcome Back' : 'Get Started'}</h3>
            <p className="text-[13px] text-slate-500 font-medium leading-tight">
              {isLogin ? 'Sign in to access your semantic workspace' : 'Create an account to begin organizing'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <i className="fas fa-exclamation-circle text-red-500 text-sm"></i>
              <p className="text-[12px] font-bold text-red-600">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 mb-10">
            <button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 px-4 border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-bold text-slate-700 text-[13px] disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
              Continue with Google
            </button>
            
            <button 
              onClick={handleGithubSignIn}
              disabled={loading}
              className="w-full py-4 px-4 border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-bold text-slate-700 text-[13px] disabled:opacity-50"
            >
              <i className="fab fa-github text-xl"></i>
              Continue with GitHub
            </button>
          </div>

          <div className="relative mb-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="bg-white px-4">Or use email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
               <div className="relative">
                <i className="far fa-user absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" required placeholder="Full Name"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-14 pl-14 pr-6 bg-[#f1f5f9]/70 rounded-2xl border-none focus:ring-2 focus:ring-[#3b82f6]/20 outline-none text-[13px] font-medium placeholder:text-slate-400"
                />
              </div>
            )}
            <div className="relative">
              <i className="far fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="email" required placeholder="Email address"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full h-14 pl-14 pr-6 bg-[#f1f5f9]/70 rounded-2xl border-none focus:ring-2 focus:ring-[#3b82f6]/20 outline-none text-[13px] font-medium placeholder:text-slate-400"
              />
            </div>
            <div className="relative">
              <i className="fas fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <i className="far fa-eye absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"></i>
              <input 
                type="password" required placeholder="Password"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full h-14 pl-14 pr-14 bg-[#f1f5f9]/70 rounded-2xl border-none focus:ring-2 focus:ring-[#3b82f6]/20 outline-none text-[13px] font-medium placeholder:text-slate-400"
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full h-16 bg-[#3b82f6] text-white rounded-[20px] font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#2563eb] transition-all shadow-xl shadow-[#3b82f6]/20 disabled:opacity-50 mt-6 active:scale-[0.98]"
            >
              {loading ? <i className="fas fa-spinner fa-spin text-lg"></i> : (
                <>{isLogin ? 'Sign In' : 'Sign Up'} <i className="fas fa-arrow-right ml-1"></i></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
