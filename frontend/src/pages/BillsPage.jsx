import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  FiSearch, FiFilter, FiDownload, FiNavigation, FiEye, FiDownloadCloud, FiFileText 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { generateBillPDF } from '../components/pdf/pdfGenerator';
import { sendBillOnWhatsApp } from '../components/pdf/whatsapp';

const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [settings, setSettings] = useState(null);
  const [showDetail, setShowDetail] = useState(null);

  useEffect(() => {
    fetchBills();
    fetchSettings();
  }, [search, paymentFilter, dateFrom, dateTo]);

  const fetchBills = async () => {
    try {
      const { data } = await axios.get(`/bills?search=${search}&payment=${paymentFilter}&from=${dateFrom}&to=${dateTo}`);
      setBills(data);
    } catch (err) {
      toast.error('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    const { data } = await axios.get('/settings');
    setSettings(data);
  };

  const handleExportCSV = async () => {
    try {
      const response = await axios.get('/bills/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'PavanMobileWorld_Bills.csv');
      document.body.appendChild(link);
      link.click();
      toast.success('CSV Exported');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-[#121d30] border border-white/5 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-sm w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
              placeholder="Search bill no, name, phone..."
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50 text-sm flex-1 md:flex-none"
            >
              <option value="All">All Payments</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Pending">Pending</option>
            </select>
            <button 
              onClick={handleExportCSV}
              className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-[#00d4ff] border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-2 transition-all font-bold text-sm"
            >
              <FiDownloadCloud /> EXPORT CSV
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center pl-1 border-t border-white/5 pt-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Filter by Date:</span>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-xs text-white/60 focus:outline-none focus:border-[#00d4ff]/30"
            />
            <span className="text-white/20 text-xs">to</span>
            <input 
              type="date" 
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-xs text-white/60 focus:outline-none focus:border-[#00d4ff]/30"
            />
            {(dateFrom || dateTo) && (
              <button 
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="text-[10px] font-black text-red-500/50 hover:text-red-500 uppercase ml-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#121d30] border border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Bill Details</th>
                <th className="px-8 py-5">Customer Info</th>
                <th className="px-8 py-5">Total Amount</th>
                <th className="px-8 py-5">Payment</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {bills.map((b) => (
                <tr key={b._id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-mono text-[#00d4ff] font-bold text-sm">{b.billNo}</p>
                    <p className="text-[10px] text-white/20 mt-1 uppercase font-bold tracking-tighter">
                      {new Date(b.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-white/80">{b.customerName}</p>
                    <p className="text-xs text-white/30">{b.customerPhone}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-black text-2xl text-white">₹{b.total.toFixed(2)}</p>
                    <p className="text-[10px] text-white/20 uppercase font-black">{b.items.length} Items Purchased</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`
                      text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider
                      ${b.paymentMode === 'Pending' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#00e676]/10 text-[#00e676] border border-[#00e676]/20'}
                    `}>
                      {b.paymentMode}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setShowDetail(b)}
                        className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-transparent"
                        title="View Details"
                      >
                        <FiEye size={18} />
                      </button>
                      <button 
                        onClick={() => generateBillPDF(b, settings)}
                        className="p-3 rounded-2xl bg-[#00d4ff]/5 text-[#00d4ff]/60 hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all border border-transparent"
                        title="Download PDF"
                      >
                        <FiDownload size={18} />
                      </button>
                      <button 
                        onClick={() => sendBillOnWhatsApp(b.customerPhone, b, settings)}
                        className="p-3 rounded-2xl bg-[#00e676]/5 text-[#00e676]/60 hover:text-[#00e676] hover:bg-[#00e676]/10 transition-all border border-transparent"
                        title="Resend WhatsApp"
                      >
                        <FiNavigation className="rotate-45" size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && bills.length === 0 && (
            <div className="py-20 text-center text-white/10 italic text-sm font-medium uppercase tracking-widest">No matching bills discovered in history</div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className="bg-[#121d30] border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#00d4ff]/10 flex items-center justify-center text-[#00d4ff]">
                  <FiFileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Bill Details</h3>
                  <p className="text-xs font-mono text-white/30 uppercase">{showDetail.billNo}</p>
                </div>
              </div>
              <button onClick={() => setShowDetail(null)} className="w-10 h-10 rounded-full bg-white/5 text-white/40 hover:text-white flex items-center justify-center transition-colors">×</button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Customer Info</p>
                    <div>
                      <h4 className="text-lg font-black text-white/90">{showDetail.customerName}</h4>
                      <p className="text-sm font-bold text-[#00d4ff]">{showDetail.customerPhone}</p>
                      {showDetail.customerEmail && <p className="text-xs text-white/40 mt-1">{showDetail.customerEmail}</p>}
                    </div>
                  </div>
                  <div className="space-y-4 text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Payment & Timing</p>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${showDetail.paymentMode === 'Pending' ? 'text-red-500 bg-red-500/10' : 'text-[#00e676] bg-[#00e676]/10'}`}>{showDetail.paymentMode}</span>
                      <p className="text-xs text-white/40 mt-1">{new Date(showDetail.createdAt).toLocaleString()}</p>
                      <p className="text-[10px] text-white/20 font-bold uppercase mt-1 italic">Generated by {showDetail.createdBy?.name || 'System'}</p>
                    </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Itemized List</p>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 pb-2 text-white/30 text-[10px] uppercase font-black italic">
                        <th className="py-2">Description</th>
                        <th className="py-2 text-center">Qty</th>
                        <th className="py-2 text-right">Price</th>
                        <th className="py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {showDetail.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-4 font-bold text-white/70">{item.name}</td>
                          <td className="py-4 text-center font-black">{item.qty}</td>
                          <td className="py-4 text-right text-white/40 font-mono">₹{item.price.toFixed(2)}</td>
                          <td className="py-4 text-right font-black text-[#00d4ff]">₹{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>

               <div className="pt-6 border-t border-white/5 flex justify-end">
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between text-xs text-white/40 uppercase font-bold">
                      <span>Subtotal</span>
                      <span>₹{showDetail.subtotal.toFixed(2)}</span>
                    </div>
                    {showDetail.discount > 0 && (
                      <div className="flex justify-between text-xs text-[#ff5f2e] uppercase font-bold">
                        <span>Discount</span>
                        <span>-₹{showDetail.discount.toFixed(2)}</span>
                      </div>
                    )}
                    {showDetail.gstAmount > 0 && (
                      <div className="flex justify-between text-xs text-[#00e676] uppercase font-bold">
                        <span>GST ({showDetail.gstPercent}%)</span>
                        <span>+₹{showDetail.gstAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 border-t border-white/10">
                      <span className="text-sm font-black text-white uppercase tracking-widest">Grand Total</span>
                      <span className="text-xl font-extrabold text-[#00d4ff]">₹{showDetail.total.toFixed(2)}</span>
                    </div>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-black/30 border-t border-white/5 grid grid-cols-2 gap-4">
               <button 
                 onClick={() => generateBillPDF(showDetail, settings)}
                 className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
               >
                 <FiDownload /> RE-DOWNLOAD PDF
               </button>
               <button 
                 onClick={() => sendBillOnWhatsApp(showDetail.customerPhone, showDetail, settings)}
                 className="flex-1 bg-[#00e676]/10 hover:bg-[#00e676]/20 text-[#00e676] font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
               >
                 <FiNavigation className="rotate-45" /> RESEND ON WHATSAPP
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillsPage;
