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
      setCategoryStock(stockRes.data);
      setRecentBills(billsRes.data);
    } catch (err) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#00d4ff]/20 border-t-[#00d4ff] rounded-full animate-spin"></div>
        <p className="text-white/20 font-black uppercase tracking-widest animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/billing" replace />;
  }

  const COLORS = ['#00d4ff', '#ff5f2e', '#ffd600', '#00e676', '#b47cff', '#ff6eb4'];

  const statsCards = [
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue.toLocaleString() || 0}`, icon: <FiDollarSign />, color: 'text-[#00e676]', bg: 'bg-[#00e676]/10' },
    { label: 'Total Bills', value: stats?.totalBills || 0, icon: <FiFileText />, color: 'text-[#00d4ff]', bg: 'bg-[#00d4ff]/10' },
    { label: "Today's Bills", value: stats?.todayBills || 0, icon: <FiTrendingUp />, color: 'text-[#ff5f2e]', bg: 'bg-[#ff5f2e]/10' },
    { label: 'Avg Bill Value', value: `₹${Math.round(stats?.avgBillValue || 0)}`, icon: <FiBarChart2 />, color: 'text-[#b47cff]', bg: 'bg-[#b47cff]/10' },
    { label: 'Active Products', value: stats?.activeProducts || 0, icon: <FiBox />, color: 'text-[#00e676]', bg: 'bg-[#00e676]/10' },
    { label: 'Inactive Items', value: stats?.inactiveProducts || 0, icon: <FiBox />, color: 'text-white/30', bg: 'bg-white/5' },
    { label: 'Low Stock', value: stats?.lowStockProducts || 0, icon: <FiAlertCircle />, color: 'text-[#ffd600]', bg: 'bg-[#ffd600]/10' },
    { label: 'Out of Stock', value: stats?.outOfStockProducts || 0, icon: <FiAlertCircle />, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, i) => (
          <div key={i} className="bg-[#121d30] border border-white/5 p-6 rounded-[2rem] shadow-xl group hover:border-[#00d4ff]/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Live Status</span>
            </div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-wide">{card.label}</p>
            <h3 className="text-2xl font-black text-white mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      {stats?.lowStockProducts > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between text-red-500">
          <div className="flex items-center gap-3">
            <FiAlertCircle size={24} className="animate-pulse" />
            <div>
              <p className="font-bold">Low Stock Alert!</p>
              <p className="text-sm opacity-80">You have {stats.lowStockProducts} products running low on stock and {stats.outOfStockProducts} out of stock. Please manage inventory.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Charts Section */}
        <div className="bg-[#121d30] border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
          <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3">
            <FiBarChart2 className="text-[#00d4ff]" /> Stock by Category
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStock} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                <XAxis type="number" stroke="#ffffff20" hide />
                <YAxis dataKey="category" type="category" stroke="#ffffff60" fontSize={11} width={120} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#121d30', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Bar dataKey="stock" fill="#00d4ff" radius={[0, 10, 10, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Status (Pie Chart) */}
        <div className="bg-[#121d30] border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
          <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3">
            <FiPieChart className="text-[#ff5f2e]" /> Product Distribution
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Healthy Stock', value: stats.activeProducts - stats.lowStockProducts - stats.outOfStockProducts },
                    { name: 'Low Stock', value: stats.lowStockProducts },
                    { name: 'Out of Stock', value: stats.outOfStockProducts },
                    { name: 'Inactive', value: stats.inactiveProducts }
                  ]}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  <Cell fill="#00e676" />
                  <Cell fill="#ffd600" />
                  <Cell fill="#ff4455" />
                  <Cell fill="#ffffff10" />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121d30', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Bills Table */}
      <div className="bg-[#121d30] border border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-black text-white flex items-center gap-3">
            <FiClock className="text-[#ffd600]" /> Recent Transactions
          </h3>
          <button className="text-xs font-black text-[#00d4ff] uppercase tracking-widest hover:underline">View All History</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Bill No</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Payment</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {recentBills.map((bill) => (
                <tr key={bill._id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-5">
                    <span className="font-mono text-[#00d4ff] font-bold">{bill.billNo}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-white/80">{bill.customerName}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs text-white/40">{new Date(bill.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-black text-white">₹{bill.total.toFixed(2)}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`
                      text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wide
                      ${bill.paymentMode === 'Pending' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/20'}
                    `}>
                      {bill.paymentMode}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 border border-transparent hover:border-[#00d4ff]/20 transition-all">
                      <FiFileText size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentBills.length === 0 && (
            <div className="py-20 text-center text-white/10 italic text-sm">No transactions found yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
