import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import { generateBillPDF } from '../components/pdf/pdfGenerator';
import { FiDownload, FiSmartphone, FiCheckCircle } from 'react-icons/fi';

const ViewBillPage = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billRes, settingsRes] = await Promise.all([
          axios.get(`/bills/${id}`),
          axios.get('/settings')
        ]);
        setBill(billRes.data);
        setSettings(settingsRes.data);
      } catch (err) {
        console.error('Failed to fetch bill details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDownload = () => {
    if (bill && settings) {
      generateBillPDF(bill, settings, true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040911] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00d4ff]/20 border-t-[#00d4ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-[#040911] flex flex-col items-center justify-center text-white p-6">
        <h1 className="text-2xl font-black mb-4">Bill Not Found</h1>
        <p className="text-white/40">The link might be expired or incorrect.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-outfit">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-sky-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-500/10 blur-[120px] rounded-full animate-pulse-slow delay-1000"></div>
      </div>

      <div className="w-full max-w-lg relative z-10 animate-slide-up">
        {/* Main Receipt Module */}
        <div className="glass-panel p-12 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.4)] relative border-white/[0.03] text-center overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-500 via-sky-400 to-sky-600"></div>
          
          <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-10 shadow-inner border border-emerald-500/10 relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <FiCheckCircle size={48} className="relative z-10 animate-bounce-subtle" />
          </div>
          
          <h1 className="text-3xl font-black text-white mb-3 tracking-tight">TRANSACTION VERIFIED</h1>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-12 opacity-60">Digital Settlement Record</p>
          
          <div className="space-y-8 mb-12">
            <div className="grid grid-cols-2 gap-8 text-left">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Protocol ID</p>
                <p className="text-white font-black tracking-tighter text-lg">#{bill.billNo}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Temporal Stamp</p>
                <p className="text-white font-bold text-sm uppercase">{new Date(bill.date || bill.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="space-y-1 text-left border-t border-white/[0.03] pt-8">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Authenticated Subject</p>
              <p className="text-white text-xl font-black tracking-tight">{bill.customerName}</p>
            </div>

            <div className="bg-slate-950/40 rounded-[2.5rem] p-10 border border-white/[0.03] shadow-inner mt-10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">CONSOLIDATED SETTLEMENT</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-black text-slate-600">₹</span>
                <span className="text-5xl font-black text-sky-400 tracking-tighter shadow-sky-500/20">{bill.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleDownload}
            className="w-full bg-sky-500 hover:bg-sky-400 text-white font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-5 shadow-[0_20px_50px_-10px_rgba(14,165,233,0.4)] active:scale-95 transition-all uppercase tracking-[0.2em] text-xs group/btn relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:animate-shimmer"></div>
            <FiDownload size={24} className="group-hover/btn:translate-y-1 transition-transform" /> 
            Acquire PDF Document
          </button>

          <div className="mt-12 flex flex-col items-center gap-3 opacity-40">
            <div className="w-1 h-1 rounded-full bg-sky-500 shadow-[0_0_10px_#0ea5e9]"></div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em]">PAVAN MOBILE WORLD ENTERPRISE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBillPage;
