import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';

const Header = ({ title, onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="h-16 border-b border-white/5 bg-[#0a1220]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-white/60 hover:text-white transition-colors"
        >
          <FiMenu size={24} />
        </button>
        <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-white to-[#00d4ff] bg-clip-text text-transparent truncate">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <FiUser className="text-[#00d4ff]" />
          <span className="text-sm font-semibold text-white/80">{user?.name}</span>
          <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-[#00d4ff]/10 text-[#00d4ff]">
            {user?.role}
          </span>
        </div>

        <button
          onClick={logout}
          className="p-2.5 rounded-full bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-white/60 hover:text-red-500 transition-all duration-300"
          title="Logout"
        >
          <FiLogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
