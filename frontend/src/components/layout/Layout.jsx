import { Outlet, Navigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ title }) => {
  const { user, loading } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#030712]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-sky-500/10 border-t-sky-500 rounded-full animate-spin shadow-2xl shadow-sky-500/20"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 animate-pulse">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex bg-[#030712] min-h-screen text-[#f8fafc] font-outfit selection:bg-sky-500/30 selection:text-white">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen transition-all duration-500">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6 md:p-10 flex-1 max-w-[100vw] overflow-x-hidden relative">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
