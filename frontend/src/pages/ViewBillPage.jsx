import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import { generateBillPDF } from '../components/pdf/pdfGenerator';
import { sendBillOnWhatsApp, shareBill } from '../components/pdf/whatsapp';
import { FiDownload, FiSmartphone, FiCheckCircle, FiShare2, FiNavigation } from 'react-icons/fi';

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-900 p-6">
        <h1 className="text-2xl font-black mb-4">Bill Not Found</h1>
        <p className="text-gray-400">The link might be expired or incorrect.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden font-outfit">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-sky-100/20 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-100/20 blur-[120px] rounded-full animate-pulse-slow delay-1000"></div>
      </div>

      <div className="w-full max-w-lg relative z-10 animate-slide-up">
        {/* Main Receipt Module */}
        <div className="bg-white p-12 rounded-[4rem] shadow-xl relative border border-gray-100 text-center overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-600 via-sky-400 to-sky-500"></div>
          
          <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto mb-10 shadow-inner border border-emerald-100 relative">
            <div className="absolute inset-0 bg-emerald-100/50 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <FiCheckCircle size={48} className="relative z-10 animate-bounce-subtle" />
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">BILL VERIFIED</h1>
          <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] mb-12">Official Bill Record</p>
          
          <div className="space-y-8 mb-12">
            <div className="grid grid-cols-2 gap-8 text-left">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bill No</p>
                <p className="text-gray-900 font-black tracking-tighter text-lg">#{bill.billNo}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bill Date</p>
                <p className="text-gray-700 font-bold text-sm uppercase">{new Date(bill.date || bill.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-1 text-left border-t border-gray-50 pt-8">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Name</p>
              <p className="text-gray-900 text-xl font-black tracking-tight">{bill.customerName}</p>
            </div>

            <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 shadow-inner mt-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">TOTAL BILL AMOUNT</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-black text-gray-300">₹</span>
                <span className="text-5xl font-black text-sky-500 tracking-tighter">{bill.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleDownload}
              className="w-full bg-sky-500 hover:bg-sky-400 text-white font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-5 shadow-[0_20px_50px_rgba(14,165,233,0.3)] active:scale-95 transition-all uppercase tracking-[0.2em] text-xs group/btn relative overflow-hidden"
            >
              <FiDownload size={20} /> 
              Download Bill (PDF)
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => sendBillOnWhatsApp(bill.customerPhone, bill, settings)}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all uppercase tracking-widest text-[10px]"
              >
                <FiNavigation className="rotate-45" size={18} /> WhatsApp
              </button>
              <button 
                onClick={() => shareBill(bill, settings)}
                className="bg-blue-500 hover:bg-blue-400 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all uppercase tracking-widest text-[10px]"
              >
                <FiShare2 size={18} /> Share
              </button>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-3 opacity-60">
            <div className="w-1 h-1 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.5em]">PAVAN MOBILE WORLD ENTERPRISE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBillPage;
