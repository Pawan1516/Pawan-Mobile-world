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
    <div className="min-h-screen bg-[#040911] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#00d4ff]/5 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-md bg-[#121d30] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative z-10 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mx-auto mb-6">
          <FiCheckCircle size={40} />
        </div>
        
        <h1 className="text-2xl font-black text-white mb-2">Invoice Ready</h1>
        <p className="text-white/40 text-sm mb-8">
          Bill #<span className="text-white font-bold">{bill.billNo}</span> for <span className="text-white font-bold">{bill.customerName}</span>
        </p>
        
        <div className="bg-black/20 rounded-3xl p-6 mb-8 border border-white/5">
          <div className="flex justify-between text-xs text-white/40 uppercase font-black mb-2">
            <span>Amount Paid</span>
            <span>Date</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-3xl font-black text-[#00d4ff]">₹{bill.total.toFixed(2)}</span>
            <span className="text-white/80 font-bold">{new Date(bill.date || bill.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <button 
          onClick={handleDownload}
          className="w-full bg-gradient-to-r from-[#004aaa] to-[#00d4ff] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-[#00d4ff]/20 active:scale-95 transition-all"
        >
          <FiDownload size={20} /> DOWNLOAD PDF BILL
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-white/20">
          <FiSmartphone />
          <span className="text-[10px] font-black uppercase tracking-widest">Pavan Mobile World</span>
        </div>
      </div>
    </div>
  );
};

export default ViewBillPage;
