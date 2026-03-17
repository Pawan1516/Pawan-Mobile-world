import { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiUser, FiLock, FiSmartphone } from 'react-icons/fi';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleMode, setRoleMode] = useState('admin'); // 'admin' or 'staff'

  const { login, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  if (user) {
    return <Navigate to={user.role === 'admin' ? "/dashboard" : "/billing"} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    // User context will automatically trigger the Navigate on the next render
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#020617] font-outfit">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="w-full max-w-lg relative z-10 animate-slide-up">
        {/* Brand Identity */}
        <div className="text-center mb-12">
          <div className="w-28 h-28 rounded-[3rem] bg-slate-900 border border-white/5 mx-auto flex items-center justify-center text-white shadow-[0_0_50px_rgba(0,0,0,0.5)] mb-8 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
              <FiSmartphone size={36} />
            </div>
            {/* Spinning ring */}
            <div className="absolute inset-2 border border-sky-500/20 rounded-[2.5rem] animate-spin-slow"></div>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">
            PAVAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-200">MOBILE</span>
          </h1>
          <p className="text-slate-500 mt-4 font-black tracking-[0.4em] text-[10px] uppercase opacity-60">Nexus Enterprise Architecture v4.0</p>
        </div>

        {/* Login Central Module */}
        <div className="glass-panel p-12 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.4)] relative border-white/[0.03]">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-slate-900 border border-white/5 shadow-xl">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400">Security Gateway</span>
          </div>

          {/* Persona Switcher */}
          <div className="flex bg-slate-950/60 p-1.5 rounded-3xl mb-12 border border-white/[0.03]">
            <button
              onClick={() => setRoleMode('admin')}
              className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${roleMode === 'admin' ? 'bg-sky-500 text-white shadow-[0_10px_25px_-5px_rgba(14,165,233,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Principal
            </button>
            <button
              onClick={() => setRoleMode('staff')}
              className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${roleMode === 'staff' ? 'bg-sky-500 text-white shadow-[0_10px_25px_-5px_rgba(14,165,233,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Associate
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 ml-4">Identity Signature</label>
              <div className="relative group">
                <FiUser className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-400 transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="premium-input w-full pl-16 py-5 bg-slate-900/40 border-slate-800 focus:bg-slate-900/60 text-sm font-bold tracking-wide"
                  placeholder="Enter alias"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 ml-4">Access Protocol</label>
              <div className="relative group">
                <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-sky-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="premium-input w-full pl-16 py-5 bg-slate-900/40 border-slate-800 focus:bg-slate-900/60 text-sm font-bold"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="premium-btn w-full bg-sky-500 text-white font-black text-xs uppercase tracking-[0.3em] py-6 rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(14,165,233,0.3)] active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-4 transition-all overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Establish Connection
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_100px_#fff] animate-pulse"></div>
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
             <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">Integrated Security Management</p>
          </div>
        </div>

        {/* System Footer Elements */}
        <div className="flex items-center justify-center gap-10 mt-16 opacity-30">
           <div className="flex flex-col items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-sky-500"></div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Bio-Sync</p>
           </div>
           <div className="flex flex-col items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">AES-256</p>
           </div>
           <div className="flex flex-col items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-violet-500"></div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Encrypted</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
