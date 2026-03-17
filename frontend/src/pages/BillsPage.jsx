import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  FiSearch, FiFilter, FiDownload, FiNavigation, FiEye, FiDownloadCloud, FiFileText, FiCalendar, FiCreditCard, FiActivity, FiArchive, FiShare2, FiExternalLink
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { generateBillPDF } from '../components/pdf/pdfGenerator';
import { sendBillOnWhatsApp, shareBill } from '../components/pdf/whatsapp';

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
      link.setAttribute('download', `PavanMobileWorld_Archive_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      toast.success('Bills Exported');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-10 animate-slide-up font-outfit">
      {/* Bill Search & Filters */}
      <div className="bg-white p-10 lg:p-12 rounded-[4rem] shadow-xl relative overflow-hidden group border border-gray-100 hover:bg-gray-50/50 transition-all duration-1000">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700">
           <FiArchive size={180} />
        </div>
        
        <div className="flex flex-col xl:flex-row gap-10 items-center justify-between relative z-10">
          <div className="relative flex-1 max-w-2xl w-full group/search">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-sky-500 transition-colors duration-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="premium-input w-full pl-16 py-5 bg-gray-50 border-gray-100 focus:bg-white text-gray-800 text-sm font-bold tracking-wide"
              placeholder="Search Bills (ID / Name / Phone)..."
            />
          </div>
          
          <div className="flex flex-wrap gap-6 w-full xl:w-auto">
            <div className="relative group/filter">
              <FiFilter className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/filter:text-sky-500 transition-colors" />
              <select
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
                className="premium-input bg-gray-50 border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] pl-16 pr-10 py-5 cursor-pointer hover:bg-white transition-all text-gray-600"
              >
                <option value="All">All Payments</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay</option>
                <option value="Card">Card</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            
            <button 
              onClick={handleExportCSV}
              className="bg-gray-50 border border-gray-100 text-gray-400 hover:text-gray-900 px-10 py-5 rounded-[2rem] flex items-center justify-center gap-4 transition-all font-black text-[10px] uppercase tracking-[0.3em] flex-1 xl:flex-none active:scale-95 group/export shadow-sm"
            >
              <FiDownloadCloud className="text-sky-500 group-hover:-translate-y-1 transition-transform" size={22} /> 
              Download CSV
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center border-t border-gray-50 mt-10 pt-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500">
              <FiCalendar size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Filter by Date:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative">
              <input 
                type="date" 
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="premium-input bg-gray-50 border-gray-100 px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-black text-gray-600"
              />
              <span className="absolute -top-3 left-6 text-[8px] font-black text-gray-400 uppercase tracking-widest bg-white px-2">Origin</span>
            </div>
            <div className="w-4 h-[1px] bg-gray-200"></div>
            <div className="relative">
              <input 
                type="date" 
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="premium-input bg-gray-50 border-gray-100 px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-black text-gray-600"
              />
              <span className="absolute -top-3 left-6 text-[8px] font-black text-gray-400 uppercase tracking-widest bg-white px-2">End</span>
            </div>
            
            {(dateFrom || dateTo) && (
              <button 
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-[0.4em] ml-4 transition-all hover:scale-105"
              >
                Reset Dates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Manifest Repository Table */}
      <div className="bg-white border border-gray-100 rounded-[4rem] shadow-xl overflow-hidden relative group transition-all duration-700">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[9px] text-gray-400 font-black uppercase tracking-[0.4em]">
                <th className="px-6 md:px-12 py-6">Bill ID</th>
                <th className="px-6 md:px-12 py-6">Customer</th>
                <th className="hidden lg:table-cell px-12 py-10">Total Amount</th>
                <th className="hidden sm:table-cell px-12 py-10 text-center">Payment</th>
                <th className="px-6 md:px-12 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bills.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50 transition-all group/row">
                  <td className="px-6 md:px-12 py-6">
                    <div className="flex items-center gap-4 md:gap-6">
                       <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[2rem] bg-gray-50 border border-gray-100 flex items-center justify-center text-sky-500 shadow-inner shadow-gray-200 group-hover/row:scale-110 transition-transform duration-500">
                          <FiFileText size={20} />
                       </div>
                       <div>
                          <p className="font-mono text-sky-600 font-black text-sm md:text-base tracking-tighter">#{b.billNo}</p>
                          <p className="text-[8px] md:text-[9px] text-gray-400 mt-1 md:mt-2 uppercase font-black tracking-[0.2em] flex items-center gap-2">
                            <FiActivity size={8} className="text-gray-300" />
                            {new Date(b.createdAt).toLocaleDateString()}
                          </p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 md:px-12 py-6">
                    <p className="font-black text-gray-800 text-xs md:text-base tracking-wide uppercase truncate max-w-[100px] md:max-w-none">{b.customerName}</p>
                    <p className="text-[8px] md:text-[10px] text-gray-400 font-bold mt-1 md:mt-2 uppercase tracking-[0.2em] font-mono">{b.customerPhone}</p>
                  </td>
                  <td className="hidden lg:table-cell px-12 py-8">
                    <div className="flex items-baseline gap-2">
                       <span className="text-sm font-black text-gray-400">₹</span>
                       <p className="font-black text-2xl text-gray-900 tracking-tighter">{b.total.toLocaleString()}</p>
                    </div>
                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-[0.3em] mt-2">{b.items.length} Items</p>
                  </td>
                  <td className="hidden sm:table-cell px-12 py-8 text-center">
                    <span className={`
                      text-[9px] font-black px-6 py-2.5 rounded-[1.5rem] uppercase tracking-[0.3em] border transition-all duration-500
                      ${b.paymentMode === 'Pending' 
                        ? 'bg-rose-50 text-rose-500 border-rose-100' 
                        : 'bg-emerald-50 text-emerald-500 border-emerald-100'}
                    `}>
                      {b.paymentMode === 'Pending' ? 'Unresolved' : b.paymentMode}
                    </span>
                  </td>
                  <td className="px-6 md:px-12 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 flex-wrap">
                      <button 
                        onClick={() => setShowDetail(b)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-all border border-transparent shadow-sm"
                        title="View Details"
                      >
                        <FiEye size={18} />
                      </button>
                      <button 
                        onClick={() => generateBillPDF(b, settings)}
                        className="px-4 h-10 flex items-center justify-center gap-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-all border border-transparent shadow-sm text-[10px] font-black uppercase tracking-widest"
                      >
                        <FiDownload size={14} /> Download
                      </button>
                      <button 
                        onClick={() => sendBillOnWhatsApp(b.customerPhone, b, settings)}
                        className="px-4 h-10 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all border border-transparent shadow-sm text-[10px] font-black uppercase tracking-widest"
                      >
                        <FiNavigation className="rotate-45" size={14} /> WhatsApp
                      </button>
                      <button 
                        onClick={() => window.open(`/view-bill/${b._id}`, '_blank')}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-violet-50 text-violet-500 hover:text-violet-600 hover:bg-violet-100 transition-all border border-transparent shadow-sm"
                        title="View Online"
                      >
                        <FiExternalLink size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && bills.length === 0 && (
            <div className="py-40 text-center relative overflow-hidden bg-gray-50">
               <FiArchive size={80} className="mx-auto text-gray-200 mb-8" />
               <p className="text-gray-400 italic text-[12px] font-black uppercase tracking-[0.6em]">No bills found in records</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal - Enhanced UI */}
      {showDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-white/30 animate-in fade-in duration-500">
          <div className="bg-white border border-gray-100 w-full max-w-5xl rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden animate-slide-up relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-600 via-sky-400 to-sky-600"></div>
            
            <div className="flex flex-col xl:flex-row h-full">
               {/* Left Sidebar Info */}
               <div className="w-full xl:w-96 bg-gray-50/20 border-r border-gray-50 p-12 space-y-12">
                  <div className="flex items-center gap-6 xl:flex-col xl:items-start">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-sky-50 flex items-center justify-center text-sky-500 shadow-inner border border-sky-100">
                      <FiFileText size={36} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Bill Details</h3>
                      <p className="text-xs font-mono text-gray-400 uppercase tracking-[0.4em] mt-2 font-black">Bill No: #{showDetail.billNo}</p>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Customer Name</p>
                      <p className="text-lg font-black text-gray-800 tracking-wide uppercase">{showDetail.customerName}</p>
                      <p className="text-xs font-bold text-sky-600 bg-sky-50 px-4 py-2 rounded-xl border border-sky-100 inline-block font-mono">{showDetail.customerPhone}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Bill Date & Time</p>
                      <div className="flex items-center gap-3 text-gray-600">
                        <FiCalendar className="text-sky-500" />
                        <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed">
                          {new Date(showDetail.createdAt).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-10 border-t border-gray-100">
                       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Payment Mode</p>
                       <div className="flex items-center gap-4">
                         <div className={`w-3 h-3 rounded-full ${showDetail.paymentMode === 'Pending' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}></div>
                         <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${showDetail.paymentMode === 'Pending' ? 'text-rose-500' : 'text-emerald-500'}`}>
                           {showDetail.paymentMode === 'Pending' ? 'Unresolved' : showDetail.paymentMode}
                         </span>
                       </div>
                    </div>
                  </div>

                   <div className="pt-12 space-y-4">
                      <button 
                        onClick={() => generateBillPDF(showDetail, settings)}
                        className="w-full bg-sky-500 text-white py-5 rounded-[2rem] flex items-center justify-center gap-4 transition-all text-[11px] font-black uppercase tracking-[0.3em] shadow-lg active:scale-95 group/pdf"
                      >
                        <FiDownload size={18} /> Download Bill (PDF)
                      </button>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => sendBillOnWhatsApp(showDetail.customerPhone, showDetail, settings)}
                          className="bg-emerald-500 text-white py-5 rounded-[2rem] flex items-center justify-center gap-4 transition-all text-[11px] font-black uppercase tracking-[0.3em] shadow-lg active:scale-95 group/wa"
                        >
                          <FiNavigation className="rotate-45" size={18} /> WhatsApp
                        </button>
                        <button 
                          onClick={() => shareBill(showDetail, settings)}
                          className="bg-indigo-500 text-white py-5 rounded-[2rem] flex items-center justify-center gap-4 transition-all text-[11px] font-black uppercase tracking-[0.3em] shadow-lg active:scale-95 group/share"
                        >
                          <FiShare2 size={18} /> Share
                        </button>
                      </div>
                      <button 
                        onClick={() => window.open(`/view-bill/${showDetail._id}`, '_blank')}
                        className="w-full bg-gray-50 text-gray-400 hover:text-gray-900 py-5 rounded-[2rem] flex items-center justify-center gap-4 transition-all text-[11px] font-black uppercase tracking-[0.3em] border border-gray-100"
                      >
                        <FiExternalLink size={18} /> View Public Bill
                      </button>
                   </div>
               </div>

               {/* Right main detailed list */}
               <div className="flex-1 p-12 bg-gray-50/50 relative overflow-y-auto custom-scrollbar max-h-[85vh]">
                  <button 
                    onClick={() => setShowDetail(null)} 
                    className="absolute top-10 right-10 w-16 h-16 rounded-[2rem] bg-gray-100 text-gray-400 hover:text-gray-900 flex items-center justify-center transition-all hover:rotate-90 text-4xl"
                  >
                    &times;
                  </button>

                  <div className="mb-14">
                    <div className="flex items-center gap-5 mb-10">
                       <div className="w-1.5 h-12 bg-sky-500 rounded-full"></div>
                       <h4 className="text-[12px] font-black uppercase tracking-[0.6em] text-gray-400">Product List</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                       {showDetail.items.map((item, idx) => (
                         <div key={idx} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between group/item hover:ring-2 ring-sky-500/10 transition-all shadow-sm">
                            <div className="flex items-center gap-8 mb-6 md:mb-0">
                               <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-xs font-black text-sky-500 border border-gray-100 shadow-inner font-mono">
                                 {String(idx + 1).padStart(2, '0')}
                               </div>
                               <div>
                                 <p className="font-black text-gray-800 text-lg uppercase tracking-wide">{item.name}</p>
                                 <div className="flex flex-wrap items-center gap-4 mt-2">
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Volume: <span className="text-gray-600">{item.qty} units</span></p>
                                    <span className="w-1 h-3 border-l border-gray-100"></span>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Wty: <span className="text-sky-600/60">{item.warranty || 'None'}</span></p>
                                    {item.imei && (
                                       <>
                                          <span className="w-1 h-3 border-l border-gray-100"></span>
                                          <p className="text-[10px] text-sky-600 uppercase font-black tracking-widest bg-sky-50 px-2 py-0.5 rounded border border-sky-100 font-mono">ID: {item.imei}</p>
                                       </>
                                    )}
                                  </div>
                               </div>
                            </div>
                            <div className="text-right flex flex-col items-center md:items-end">
                               <p className="font-black text-gray-900 text-2xl tracking-tighter">₹{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                               <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-1.5 italic">Unit Basis: ₹{item.price.toFixed(2)}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="pt-12 border-t border-gray-100 space-y-6">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                      <span className="px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-gray-500">Subtotal</span>
                      <span className="text-gray-600 text-base">₹{showDetail.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    {showDetail.discount > 0 && (
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">
                        <span className="px-4 py-1.5 bg-rose-50 border border-rose-100 rounded-full">Discount Amount</span>
                        <span className="font-black text-base">-₹{showDetail.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    
                    {showDetail.gstAmount > 0 && (
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">
                        <span className="px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">Fiscal Component ({showDetail.gstPercent}%)</span>
                        <span className="font-black text-base">+₹{showDetail.gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-gray-100 gap-6">
                      <div className="flex items-center gap-4">
                         <FiCreditCard className="text-sky-500" size={24} />
                         <span className="text-[12px] font-black text-gray-900 uppercase tracking-[0.6em]">Consolidated Settlement</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-baseline gap-3">
                           <span className="text-2xl font-black text-gray-300">₹</span>
                           <span className="text-6xl font-black text-sky-500 drop-shadow-md tracking-tighter">
                             {showDetail.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                           </span>
                        </div>
                        <div className="w-full h-1 bg-sky-100 rounded-full mt-4 relative overflow-hidden">
                           <div className="absolute inset-0 bg-sky-500 animate-shimmer -translate-x-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillsPage;
