import { Outlet } from 'react-router-dom';

const Layout = ({ title }) => {
  return (
    <div className="flex bg-gray-50 min-h-screen text-gray-900 font-outfit">
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="p-4 md:p-10 flex-1 max-w-7xl mx-auto w-full relative">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-black text-sky-600 uppercase tracking-tighter">{title}</h1>
            <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{new Date().toDateString()}</div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
