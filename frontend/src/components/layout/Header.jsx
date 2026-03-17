import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';

const Header = ({ title, onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="h-16 md:h-24 sticky top-0 z-40 flex items-center justify-between px-4 md:px-10 bg-white/80 backdrop-blur-2xl border-b border-gray-100">
      <div className="flex items-center gap-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all active:scale-95"
        >
          <FiMenu size={24} />
        </button>
        <div className="flex flex-col">
          <h2 className="text-lg md:text-2xl font-black text-gray-900 tracking-tight uppercase leading-none mb-1">
            {title}
          </h2>
          <div className="hidden xs:flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-sky-500 shadow-[0_0_8px_#10b981]"></div>
            <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">System Active</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-4 bg-gray-50 border border-gray-100 pl-2 pr-6 py-2 rounded-[2rem] group hover:bg-white hover:shadow-lg transition-all cursor-default">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sky-500 font-black text-sm shadow-md border border-gray-100 group-hover:scale-110 transition-transform">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-gray-900 tracking-wide uppercase leading-none">{user?.name}</span>
            <span className="text-[8px] font-black text-sky-500 uppercase tracking-widest mt-1">
              Role: {user?.role}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white border border-rose-100 text-rose-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all duration-500 flex items-center justify-center shadow-sm group"
          title="Terminate Session"
        >
          <FiLogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>
    </header>
  );
};

export default Header;
