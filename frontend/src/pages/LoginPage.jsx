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
    <div className="min-h-screen bg-[#040911] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00d4ff]/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ff5f2e]/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md relative z-10 transition-all duration-500">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#004aaa] to-[#00d4ff] mx-auto flex items-center justify-center text-white shadow-2xl shadow-[#00d4ff]/20 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500 group">
            <FiSmartphone size={36} className="group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Pavan Mobile World</h1>
          <p className="text-white/40 mt-2 font-medium tracking-wide text-sm uppercase">Inventory Management</p>
        </div>

        <div className="bg-[#121d30]/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] shadow-2xl relative">
          {/* Tabs */}
          <div className="flex bg-black/20 p-1 rounded-2xl mb-8 border border-white/5">
            <button
              onClick={() => { setRoleMode('admin'); }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${roleMode === 'admin' ? 'bg-gradient-to-r from-[#00d4ff] to-[#004aaa] text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
            >
              Admin
            </button>
            <button
              onClick={() => { setRoleMode('staff'); }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${roleMode === 'staff' ? 'bg-gradient-to-r from-[#00d4ff] to-[#004aaa] text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
            >
              Staff
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[#00d4ff] ml-1">Username</label>
              <div className="relative group">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#00d4ff] transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00d4ff]/50 focus:bg-black/50 transition-all placeholder:text-white/10"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[#00d4ff] ml-1">Password</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#00d4ff] transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00d4ff]/50 focus:bg-black/50 transition-all placeholder:text-white/10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#004aaa] to-[#00d4ff] hover:opacity-90 text-white font-black py-4 rounded-2xl shadow-xl shadow-[#00d4ff]/20 transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'SIGN IN'
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-12 text-white/20 text-xs font-medium uppercase tracking-[0.2em]">
          Powered by <span className="text-white/40 font-bold italic">PAWAN MOBILE WORLD</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
