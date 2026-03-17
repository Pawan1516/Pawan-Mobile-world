import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  FiGrid, FiFileText, FiPackage, FiClipboard, FiSettings, FiShoppingBag, FiX
} from 'react-icons/fi';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { isAdmin } = useContext(AuthContext);

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: <FiGrid />, admin: true },
    { name: 'Billing', path: '/billing', icon: <FiShoppingBag />, admin: false },
    { name: 'Products', path: '/products', icon: <FiPackage />, admin: true },
    { name: 'Bills History', path: '/bills', icon: <FiClipboard />, admin: true },
    { name: 'Settings', path: '/settings', icon: <FiSettings />, admin: true },
  ];

  return (
    <aside className={`
      w-64 h-screen glass-panel flex flex-col fixed left-0 top-0 z-50 transition-all duration-500
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-8 flex items-center justify-between border-b border-white/[0.03]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-xl shadow-sky-500/20 border border-white/10 group overflow-hidden relative">
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md"></div>
            <FiShoppingBag size={24} className="relative z-10" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-tight tracking-tight">PMW</h1>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">World Systems</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors"
        >
          <FiX size={24} />
        </button>
      </div>

      <nav className="flex-1 p-6 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-600 px-4 py-4">Administration</p>
        
        {links.map((link) => {
          if (link.admin && !isAdmin()) return null;
          
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden
                ${isActive 
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]' 
                  : 'text-slate-500 hover:bg-white/[0.03] hover:text-slate-200 border border-transparent'}
              `}
            >
              {({ isActive }) => (
                <>
                  <span className={`text-xl transition-all duration-500 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'group-hover:scale-110'}`}>
                    {link.icon}
                  </span>
                  <span className="text-sm font-bold tracking-wide">{link.name}</span>
                  
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sky-500 rounded-l-full shadow-[0_0_10px_rgba(14,165,233,0.8)]"></div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/[0.03] bg-white/[0.01]">
        <div className="glass-card p-5 rounded-3xl relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="flex items-center gap-3 relative z-10">
             <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 text-xs font-black">
                CS
             </div>
             <div>
                <p className="text-[11px] font-black text-slate-400 tracking-wide">Core Service</p>
                <p className="text-[9px] text-slate-600 mt-0.5 font-mono italic">v1.2.4-stable</p>
             </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
