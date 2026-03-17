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
import { generateBillPDF } from '../components/pdf/pdfGenerator';
import { sendBillOnWhatsApp, shareBill } from '../components/pdf/whatsapp';
import { FiSearch, FiFilter, FiDownload, FiNavigation, FiEye, FiDownloadCloud, FiCalendar, FiCreditCard, FiActivity, FiArchive, FiShare2, FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [categoryStock, setCategoryStock] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, stockRes, billsRes, settingsRes] = await Promise.all([
        axios.get('/dashboard/stats'),
        axios.get('/dashboard/category-stock'),
        axios.get('/dashboard/recent-bills'),
        axios.get('/settings')
      ]);
      setStats(statsRes.data);
      setCategoryStock(stockRes.data || []);
      setRecentBills(billsRes.data || []);
      setSettings(settingsRes.data);
    } catch (err) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <div className="w-16 h-16 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
        <p className="text-gray-400 font-black uppercase tracking-[0.4em] animate-pulse text-[10px]">Initializing Architecture...</p>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/billing" replace />;
  }

  const statsCards = [
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <FiDollarSign />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total Bills', value: stats?.totalBills || 0, icon: <FiFileText />, color: 'text-sky-500', bg: 'bg-sky-50' },
    { label: "Today's Bills", value: stats?.todayBills || 0, icon: <FiTrendingUp />, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Avg Bill Value', value: `₹${Math.round(stats?.avgBillValue || 0).toLocaleString()}`, icon: <FiBarChart2 />, color: 'text-violet-500', bg: 'bg-violet-50' },
    { label: 'Active Products', value: stats?.activeProducts || 0, icon: <FiBox />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Inactive Products', value: stats?.inactiveProducts || 0, icon: <FiBox />, color: 'text-gray-400', bg: 'bg-gray-50' },
    { label: 'Low Stock', value: stats?.lowStockProducts || 0, icon: <FiAlertCircle />, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Out of Stock', value: stats?.outOfStockProducts || 0, icon: <FiAlertCircle />, color: 'text-rose-600', bg: 'bg-rose-100' },
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
          <div key={i} className="bg-white p-8 rounded-[3rem] relative overflow-hidden group border border-gray-100 transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/50 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center text-2xl shadow-inner border border-gray-100`}>
                {card.icon}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">Real-time Status</span>
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shadow-[0_0_10px_rgba(14,165,233,1)] animate-pulse"></div>
              </div>
            </div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{card.label}</p>
            <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{card.value}</h3>
            
            <div className="absolute -right-6 -bottom-6 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none transform rotate-12 group-hover:rotate-0">
               <div className="text-[10rem]">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {(stats?.lowStockProducts > 0 || stats?.outOfStockProducts > 0) && (
        <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem] flex items-center justify-between text-rose-500 animate-in fade-in slide-in-from-top-4 duration-700 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-white/50 animate-pulse"></div>
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-white flex items-center justify-center text-3xl border border-rose-100 shadow-inner">
              <FiAlertCircle className="animate-bounce" />
            </div>
            <div>
              <p className="font-black uppercase tracking-[0.4em] text-xs">Attention: Low Stock Alert</p>
              <p className="text-[10px] font-black text-rose-400 mt-2 uppercase tracking-[0.2em] leading-relaxed">
                Critical items found: {stats?.lowStockProducts} low stock and {stats?.outOfStockProducts} out of stock.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
        {/* Charts Section */}
        <div className="xl:col-span-3 bg-white p-10 lg:p-12 rounded-[4rem] shadow-xl relative overflow-hidden group border border-gray-100">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none duration-700">
            <FiBarChart2 size={200} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-12 flex items-center gap-6 relative z-10 uppercase tracking-tight">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500 shadow-inner border border-sky-100">
               <FiBarChart2 size={28} />
            </div>
            Operational Saturation
          </h3>
          <div className="h-[420px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStock} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000005" horizontal={false} />
                <XAxis type="number" stroke="#00000010" hide />
                <YAxis dataKey="category" type="category" stroke="#00000020" fontSize={9} width={130} fontWeight="900" textAnchor="end" tick={{fill: '#6b7280'}} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#0ea5e9', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                <Bar dataKey="stock" fill="url(#colorBar)" radius={[0, 15, 15, 0]} barSize={32}>
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.6}/>
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Status (Pie Chart) */}
        <div className="xl:col-span-2 bg-white p-10 lg:p-12 rounded-[4rem] shadow-xl relative overflow-hidden group border border-gray-100">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none duration-700">
            <FiPieChart size={200} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-12 flex items-center gap-6 relative z-10 uppercase tracking-tight">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-500 shadow-inner border border-violet-100">
               <FiPieChart size={28} />
            </div>
            Inventory Status
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
                    <Cell key={`cell-${index}`} fill={['#10b981', '#f59e0b', '#f43f5e', '#e2e8f0'][index % 4]} />
                  ))}
                  {pieData.length === 0 && <Cell fill="#e2e8f0" />}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#1f2937', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                />
                <Legend 
                   iconType="circle" 
                   wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', paddingTop: '40px' }} 
                   formatter={(value) => <span className="text-gray-500 font-black">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Bills Table */}
      <div className="bg-white border border-gray-100 rounded-[4rem] shadow-xl overflow-hidden relative group">
        <div className="p-6 md:p-12 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gray-50/50">
          <h3 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-4 md:gap-6 uppercase tracking-tight">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] md:rounded-[2rem] bg-amber-100 flex items-center justify-center text-amber-600 text-2xl md:text-3xl shadow-inner border border-amber-200">
              <FiClock />
            </div>
            Recent Bills
          </h3>
          <Link to="/bills" className="w-full sm:w-auto text-[9px] font-black text-sky-500 uppercase tracking-[0.4em] px-8 py-4 rounded-[1.5rem] bg-sky-50 hover:bg-sky-100 transition-all border border-sky-100 active:scale-95 shadow-sm relative overflow-hidden group/btn text-center">
             <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:animate-shimmer"></div>
             View All Bills
          </Link>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[9px] text-gray-500 font-black uppercase tracking-[0.4em]">
                <th className="px-6 md:px-12 py-6 border-b border-gray-100">Signature</th>
                <th className="px-6 md:px-12 py-6 border-b border-gray-100">Subject</th>
                <th className="hidden md:table-cell px-12 py-10 border-b border-gray-100">Stamp</th>
                <th className="px-6 md:px-12 py-6 border-b border-gray-100">Valuation</th>
                <th className="hidden sm:table-cell px-12 py-10 text-center border-b border-gray-100">Status</th>
                <th className="px-6 md:px-12 py-6 text-right border-b border-gray-100">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentBills.map((bill) => (
                <tr key={bill._id} className="hover:bg-gray-50 transition-all group/row">
                  <td className="px-6 md:px-12 py-6">
                    <span className="font-mono text-sky-600 font-black tracking-tighter text-xs md:text-base bg-sky-50 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-sky-100">#{bill.billNo}</span>
                  </td>
                  <td className="px-6 md:px-12 py-6">
                    <p className="font-black text-gray-700 text-xs md:text-sm tracking-wide uppercase truncate max-w-[100px] md:max-w-none">{bill.customerName}</p>
                  </td>
                  <td className="hidden md:table-cell px-12 py-8">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{new Date(bill.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 md:px-12 py-6">
                    <p className="font-black text-gray-900 text-base md:text-xl tracking-tight">₹{bill.total.toLocaleString()}</p>
                  </td>
                  <td className="hidden sm:table-cell px-12 py-8 text-center">
                    <span className={`
                      text-[9px] font-black px-6 py-2.5 rounded-[1.5rem] uppercase tracking-[0.3em] border transition-all duration-500
                      ${bill.paymentMode === 'Pending' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}
                    `}>
                      {bill.paymentMode === 'Pending' ? 'Unresolved' : bill.paymentMode}
                    </span>
                  </td>
                  <td className="px-6 md:px-12 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 flex-wrap">
                      <button 
                         onClick={() => generateBillPDF(bill, settings)}
                         className="px-4 h-10 flex items-center justify-center gap-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-all border border-transparent shadow-sm text-[10px] font-black uppercase tracking-widest"
                      >
                         <FiDownload size={14} /> Download
                      </button>
                      <button 
                         onClick={() => sendBillOnWhatsApp(bill.customerPhone, bill, settings)}
                         className="px-4 h-10 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all border border-transparent shadow-sm text-[10px] font-black uppercase tracking-widest"
                      >
                         <FiNavigation className="rotate-45" size={14} /> Send
                      </button>
                      <button 
                         onClick={() => shareBill(bill, settings)}
                         className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition-all shadow-sm"
                         title="Share"
                      >
                         <FiShare2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentBills.length === 0 && (
            <div className="py-40 text-center relative overflow-hidden">
               <FiArchive size={80} className="mx-auto text-gray-200 mb-8" />
               <p className="text-gray-400 italic text-[11px] font-black uppercase tracking-[0.6em] animate-pulse">Zero Recorded Transitions Discovered in Real-time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
