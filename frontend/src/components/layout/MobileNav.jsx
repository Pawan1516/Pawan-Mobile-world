import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  FiGrid, FiPackage, FiShoppingBag, FiClipboard, FiSettings
} from 'react-icons/fi';

const MobileNav = () => {
  const { isAdmin } = useContext(AuthContext);

  const navItems = [
    { icon: <FiGrid />, path: '/dashboard', label: 'Dash', admin: true },
    { icon: <FiShoppingBag />, path: '/billing', label: 'Bill', admin: false },
    { icon: <FiPackage />, path: '/products', label: 'Stock', admin: true },
    { icon: <FiClipboard />, path: '/bills', label: 'Hist', admin: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden font-outfit">
      <div className="mx-6 mb-6 bg-white/80 backdrop-blur-2xl border border-gray-100 rounded-[2.5rem] p-2 shadow-xl flex items-center justify-around relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-0.5 bg-sky-500/20 blur-sm"></div>
        
        {navItems.map((item) => {
          if (item.admin && !isAdmin()) return null;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={(navData) => `
                flex flex-col items-center justify-center p-3 rounded-[1.5rem] transition-all duration-500 flex-1
                ${navData.isActive ? 'text-sky-500 scale-110' : 'text-gray-400'}
              `}
            >
              {(navData) => (
                <>
                  <span className={`text-xl mb-1 ${navData.isActive ? 'drop-shadow-[0_0_8px_rgba(14,165,233,0.3)]' : ''}`}>{item.icon}</span>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${navData.isActive ? 'opacity-100' : 'opacity-60'}`}>
                    {item.label}
                  </span>
                  {navData.isActive && (
                    <div className="w-1 h-1 rounded-full bg-sky-500 mt-1 shadow-[0_0_10px_rgba(14,165,233,0.8)]"></div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
