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
      w-64 h-screen border-r border-white/5 bg-[#040a18] flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#004aaa] to-[#00d4ff] flex items-center justify-center text-white shadow-lg shadow-[#004aaa]/20">
            <FiShoppingBag size={22} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white leading-none">PMW</h1>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Mobile World</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 text-white/40 hover:text-white"
        >
          <FiX size={24} />
        </button>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-widest font-black text-white/30 px-3 py-2">Main Menu</p>
        
        {links.map((link) => {
          if (link.admin && !isAdmin()) return null;
          
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20' 
                  : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'}
              `}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{link.icon}</span>
              <span className="text-sm font-bold">{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121d30] to-[#040911] border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#00d4ff]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-xs text-white/50 relative z-10">Pavan Mobile World</p>
          <p className="text-[10px] text-white/30 mt-1 relative z-10 font-mono italic">v1.2.0 • Active</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
