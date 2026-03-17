import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';

const Header = ({ title, onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="h-24 sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 bg-[#030712]/40 backdrop-blur-2xl border-b border-white/[0.03]">
      <div className="flex items-center gap-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95"
        >
          <FiMenu size={24} />
        </button>
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-none mb-1">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-sky-500 shadow-[0_0_8px_#0ea5e9]"></div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">System Node Active</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] pl-2 pr-6 py-2 rounded-[2rem] group hover:bg-white/[0.04] transition-all cursor-default">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white font-black text-sm shadow-xl shadow-sky-500/20">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-200 tracking-wide uppercase leading-none">{user?.name}</span>
            <span className="text-[8px] font-black text-sky-500 uppercase tracking-widest mt-1">
              Role: {user?.role}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-12 h-12 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-500 flex items-center justify-center shadow-inner group"
          title="Terminate Session"
        >
          <FiLogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>
    </header>
  );
};

export default Header;
