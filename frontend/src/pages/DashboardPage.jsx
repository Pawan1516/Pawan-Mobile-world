import { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
  FiShoppingBag, FiTrendingUp, FiBox, FiAlertCircle, 
  FiClock, FiDollarSign, FiBarChart2, FiPieChart, FiFileText
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { AuthContext } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [categoryStock, setCategoryStock] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, stockRes, billsRes] = await Promise.all([
        axios.get('/dashboard/stats'),
        axios.get('/dashboard/category-stock'),
        axios.get('/dashboard/recent-bills')
      ]);
      setStats(statsRes.data);
      setCategoryStock(stockRes.data || []);
      setRecentBills(billsRes.data || []);
    } catch (err) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <div className="w-16 h-16 border-4 border-sky-500/10 border-t-sky-500 rounded-full animate-spin shadow-2xl shadow-sky-500/20"></div>
        <p className="text-slate-600 font-black uppercase tracking-[0.4em] animate-pulse text-[10px]">Initializing Architecture...</p>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/billing" replace />;
  }

  const statsCards = [
    { label: 'Cumulative Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <FiDollarSign />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Archived Manifests', value: stats?.totalBills || 0, icon: <FiFileText />, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: "Temporal Velocity", value: stats?.todayBills || 0, icon: <FiTrendingUp />, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Mean Asset Value', value: `₹${Math.round(stats?.avgBillValue || 0).toLocaleString()}`, icon: <FiBarChart2 />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Active Inventory', value: stats?.activeProducts || 0, icon: <FiBox />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Dormant Assets', value: stats?.inactiveProducts || 0, icon: <FiBox />, color: 'text-slate-500', bg: 'bg-slate-500/10' },
    { label: 'Critical Threshold', value: stats?.lowStockProducts || 0, icon: <FiAlertCircle />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Stock Exhaustion', value: stats?.outOfStockProducts || 0, icon: <FiAlertCircle />, color: 'text-rose-500', bg: 'bg-rose-500/20' },
  ];

  const pieData = [
    { name: 'Healthy Assets', value: Math.max(0, (stats?.activeProducts || 0) - (stats?.lowStockProducts || 0) - (stats?.outOfStockProducts || 0)) },
    { name: 'Critical Latency', value: stats?.lowStockProducts || 0 },
    { name: 'Depleted', value: stats?.outOfStockProducts || 0 },
    { name: 'Legacy/Dormant', value: stats?.inactiveProducts || 0 }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-10 animate-slide-up font-outfit">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {statsCards.map((card, i) => (
          <div key={i} className="glass-panel p-8 rounded-[3rem] relative overflow-hidden group border-white/[0.03] transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center text-2xl shadow-inner border border-white/5`}>
                {card.icon}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Real-time Status</span>
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shadow-[0_0_10px_rgba(14,165,233,1)] animate-pulse"></div>
              </div>
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{card.label}</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">{card.value}</h3>
            
            <div className="absolute -right-6 -bottom-6 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none transform rotate-12 group-hover:rotate-0">
               <div className="text-[10rem]">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {(stats?.lowStockProducts > 0 || stats?.outOfStockProducts > 0) && (
        <div className="glass-panel border-rose-500/20 p-8 rounded-[2.5rem] flex items-center justify-between text-rose-500 animate-in fade-in slide-in-from-top-4 duration-700 shadow-[0_30px_60px_-15px_rgba(244,63,94,0.15)] relative overflow-hidden">
          <div className="absolute inset-0 bg-rose-500/[0.02] animate-pulse"></div>
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-rose-500/10 flex items-center justify-center text-3xl border border-rose-500/20 shadow-inner">
              <FiAlertCircle className="animate-bounce" />
            </div>
            <div>
              <p className="font-black uppercase tracking-[0.4em] text-xs">Aesthetic Anomaly Detected</p>
              <p className="text-[10px] font-black text-rose-500/60 mt-2 uppercase tracking-[0.2em] leading-relaxed">
                Critical depletion in asset repository. {stats?.lowStockProducts} nodes below threshold and {stats?.outOfStockProducts} absolute failures.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
        {/* Charts Section */}
        <div className="xl:col-span-3 glass-panel p-10 lg:p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group border-white/[0.03]">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none duration-700">
            <FiBarChart2 size={200} />
          </div>
          <h3 className="text-2xl font-black text-white mb-12 flex items-center gap-6 relative z-10 uppercase tracking-tight">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 shadow-inner border border-sky-500/10">
               <FiBarChart2 size={28} />
            </div>
            Operational Saturation
          </h3>
          <div className="h-[420px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStock} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                <XAxis type="number" stroke="#ffffff20" hide />
                <YAxis dataKey="category" type="category" stroke="#ffffff30" fontSize={9} width={130} fontWeight="900" textAnchor="end" tick={{fill: '#475569'}} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: 'rgba(3, 7, 18, 0.9)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', backdropFilter: 'blur(20px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#38bdf8', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                <Bar dataKey="stock" fill="url(#colorBar)" radius={[0, 15, 15, 0]} barSize={32}>
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Status (Pie Chart) */}
        <div className="xl:col-span-2 glass-panel p-10 lg:p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group border-white/[0.03]">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none duration-700">
            <FiPieChart size={200} />
          </div>
          <h3 className="text-2xl font-black text-white mb-12 flex items-center gap-6 relative z-10 uppercase tracking-tight">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500 shadow-inner border border-violet-500/10">
               <FiPieChart size={28} />
            </div>
            Resource Integrity Matrix
          </h3>
          <div className="h-[420px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : [{name: 'No Assets', value: 1}]}
                  innerRadius={110}
                  outerRadius={150}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#f59e0b', '#f43f5e', '#1e293b'][index % 4]} />
                  ))}
                  {pieData.length === 0 && <Cell fill="#1e293b" />}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(3, 7, 18, 0.9)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', backdropFilter: 'blur(20px)' }}
                  itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                />
                <Legend 
                   iconType="circle" 
                   wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', paddingTop: '40px' }} 
                   formatter={(value) => <span className="text-slate-600 font-black">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Bills Table */}
      <div className="glass-panel border-white/[0.03] rounded-[4rem] shadow-2xl overflow-hidden relative group bg-white/[0.01]">
        <div className="p-10 lg:p-12 border-b border-white/[0.03] flex items-center justify-between bg-white/[0.01]">
          <h3 className="text-2xl font-black text-white flex items-center gap-6 uppercase tracking-tight">
            <div className="w-16 h-16 rounded-[2rem] bg-amber-500/10 flex items-center justify-center text-amber-500 text-3xl shadow-inner border border-amber-500/10">
              <FiClock />
            </div>
            Recent Operational Manifests
          </h3>
          <button className="text-[10px] font-black text-sky-400 uppercase tracking-[0.4em] px-10 py-5 rounded-[2rem] bg-sky-500/5 hover:bg-sky-500/10 transition-all border border-sky-500/10 active:scale-95 shadow-xl shadow-sky-500/5 relative overflow-hidden group/btn">
             <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:animate-shimmer"></div>
             Full Archive Repository
          </button>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] text-[10px] text-slate-500 font-black uppercase tracking-[0.5em]">
                <th className="px-12 py-10">Manifest Signature</th>
                <th className="px-12 py-10">Subject Identity</th>
                <th className="px-12 py-10">Temporal Stamp</th>
                <th className="px-12 py-10">Valuation</th>
                <th className="px-12 py-10 text-center">Settlement Status</th>
                <th className="px-12 py-10 text-right">Action Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {recentBills.map((bill) => (
                <tr key={bill._id} className="hover:bg-white/[0.02] transition-all group/row">
                  <td className="px-12 py-8">
                    <span className="font-mono text-sky-500 font-black tracking-tighter text-base bg-sky-500/5 px-4 py-2 rounded-xl border border-sky-500/10">#{bill.billNo}</span>
                  </td>
                  <td className="px-12 py-8">
                    <p className="font-black text-slate-200 text-sm tracking-wide uppercase">{bill.customerName}</p>
                  </td>
                  <td className="px-12 py-8">
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">{new Date(bill.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </td>
                  <td className="px-12 py-8">
                    <p className="font-black text-white text-xl tracking-tight">₹{bill.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </td>
                  <td className="px-12 py-8 text-center">
                    <span className={`
                      text-[9px] font-black px-6 py-2.5 rounded-[1.5rem] uppercase tracking-[0.3em] border transition-all duration-500
                      ${bill.paymentMode === 'Pending' ? 'bg-rose-500/5 text-rose-500 border-rose-500/10' : 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10'}
                    `}>
                      {bill.paymentMode === 'Pending' ? 'Unresolved' : bill.paymentMode}
                    </span>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.03] text-slate-600 hover:text-sky-500 hover:bg-sky-500/10 transition-all border border-transparent hover:border-sky-500/10 group-hover/row:scale-110">
                      <FiFileText size={22} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentBills.length === 0 && (
            <div className="py-40 text-center relative overflow-hidden">
               <FiArchive size={80} className="mx-auto text-slate-800 mb-8 opacity-20" />
               <p className="text-slate-700 italic text-[11px] font-black uppercase tracking-[0.6em] animate-pulse">Zero Recorded Transitions Discovered in Real-time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FiArchive = ({ size = 24, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
);

export default DashboardPage;
