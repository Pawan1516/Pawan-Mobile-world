import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  FiSearch, FiFilter, FiDownload, FiNavigation, FiEye, FiDownloadCloud, FiFileText, FiCalendar, FiCreditCard, FiActivity, FiArchive
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
      link.setAttribute('download', `PavanMobileWorld_Archive_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      toast.success('Archive Repository Exported');
    } catch (err) {
      toast.error('Export protocol failed');
    }
  };

  return (
    <div className="space-y-10 animate-slide-up font-outfit">
      {/* Archive Query Hub */}
      <div className="glass-panel p-10 lg:p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group border-white/[0.03]">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700">
           <FiArchive size={180} />
        </div>
        
        <div className="flex flex-col xl:flex-row gap-10 items-center justify-between relative z-10">
          <div className="relative flex-1 max-w-2xl w-full group/search">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-sky-400 transition-colors duration-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="premium-input w-full pl-16 py-5 bg-slate-950/40 border-slate-800 focus:bg-slate-950/60 text-sm font-bold tracking-wide"
              placeholder="Query Manifest Archives (ID/Identity/Relay)..."
            />
          </div>
          
          <div className="flex flex-wrap gap-6 w-full xl:w-auto">
            <div className="relative group/filter">
              <FiFilter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/filter:text-sky-400 transition-colors" />
              <select
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
                className="premium-input bg-slate-950/40 border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] pl-16 pr-10 py-5 cursor-pointer hover:bg-slate-950/60 transition-all"
              >
                <option value="All">All Settlement Protocols</option>
                <option value="Cash">Physical Relay (Cash)</option>
                <option value="UPI">Digital Stream (UPI)</option>
                <option value="Card">Bank Module (Card)</option>
                <option value="Pending">Unresolved (Pending)</option>
              </select>
            </div>
            
            <button 
              onClick={handleExportCSV}
              className="bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/10 px-10 py-5 rounded-[2rem] flex items-center justify-center gap-4 transition-all font-black text-[10px] uppercase tracking-[0.3em] flex-1 xl:flex-none active:scale-95 group/export"
            >
              <FiDownloadCloud className="text-sky-500 group-hover:-translate-y-1 transition-transform" size={22} /> 
              Export Repository
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center border-t border-white/[0.03] mt-10 pt-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500">
              <FiCalendar size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">Temporal Filter Node:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative">
              <input 
                type="date" 
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="premium-input bg-slate-950/40 border-slate-800/50 px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-black text-slate-300"
              />
              <span className="absolute -top-3 left-6 text-[8px] font-black text-slate-700 uppercase tracking-widest bg-[#030712] px-2">Origin</span>
            </div>
            <div className="w-4 h-[1px] bg-slate-800"></div>
            <div className="relative">
              <input 
                type="date" 
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="premium-input bg-slate-950/40 border-slate-800/50 px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-black text-slate-300"
              />
              <span className="absolute -top-3 left-6 text-[8px] font-black text-slate-700 uppercase tracking-widest bg-[#030712] px-2">Terminal</span>
            </div>
            
            {(dateFrom || dateTo) && (
              <button 
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="text-[9px] font-black text-rose-500/40 hover:text-rose-500 uppercase tracking-[0.4em] ml-4 transition-all hover:scale-105"
              >
                Reset Temporal Alignment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Manifest Repository Table */}
      <div className="glass-panel border-white/[0.03] rounded-[4rem] shadow-2xl overflow-hidden relative group bg-white/[0.01]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] text-[10px] text-slate-500 font-black uppercase tracking-[0.5em]">
                <th className="px-12 py-10">Manifest Signature</th>
                <th className="px-12 py-10">Authenticated Subject</th>
                <th className="px-12 py-10">Accumulated Total</th>
                <th className="px-12 py-10 text-center">Settlement Status</th>
                <th className="px-12 py-10 text-right">Operations Hub</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {bills.map((b) => (
                <tr key={b._id} className="hover:bg-white/[0.02] transition-all group/row">
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-[2rem] bg-slate-900/60 border border-white/[0.03] flex items-center justify-center text-sky-500 shadow-inner group-hover/row:scale-110 transition-transform duration-500">
                          <FiFileText size={24} />
                       </div>
                       <div>
                          <p className="font-mono text-sky-400 font-black text-base tracking-tighter">#{b.billNo}</p>
                          <p className="text-[9px] text-slate-600 mt-2 uppercase font-black tracking-[0.2em] flex items-center gap-2">
                            <FiActivity size={10} className="text-slate-800" />
                            {new Date(b.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                       </div>
                    </div>
                  </td>
                  <td className="px-12 py-8">
                    <p className="font-black text-slate-200 text-base tracking-wide uppercase">{b.customerName}</p>
                    <p className="text-[10px] text-slate-600 font-bold mt-2 uppercase tracking-[0.3em] font-mono">{b.customerPhone}</p>
                  </td>
                  <td className="px-12 py-8">
                    <div className="flex items-baseline gap-2">
                       <span className="text-sm font-black text-slate-600">₹</span>
                       <p className="font-black text-2xl text-white tracking-tighter">{b.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    <p className="text-[9px] text-slate-700 uppercase font-black tracking-[0.3em] mt-2">{b.items.length} Registered Components</p>
                  </td>
                  <td className="px-12 py-8 text-center">
                    <span className={`
                      text-[9px] font-black px-6 py-2.5 rounded-[1.5rem] uppercase tracking-[0.3em] border transition-all duration-500
                      ${b.paymentMode === 'Pending' 
                        ? 'bg-rose-500/5 text-rose-500/60 border-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.05)] group-hover/row:text-rose-500 group-hover/row:border-rose-500/30' 
                        : 'bg-emerald-500/5 text-emerald-500/60 border-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.05)] group-hover/row:text-emerald-500 group-hover/row:border-emerald-500/30'}
                    `}>
                      {b.paymentMode === 'Pending' ? 'Unresolved' : b.paymentMode}
                    </span>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <div className="flex items-center justify-end gap-4 opacity-0 group-hover/row:opacity-100 transition-all transform translate-x-4 group-hover/row:translate-x-0">
                      <button 
                        onClick={() => setShowDetail(b)}
                        className="w-12 h-12 flex items-center justify-center rounded-[1.5rem] bg-white/[0.03] text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-transparent shadow-sm"
                        title="Analyze Manifest"
                      >
                        <FiEye size={22} />
                      </button>
                      <button 
                        onClick={() => generateBillPDF(b, settings)}
                        className="w-12 h-12 flex items-center justify-center rounded-[1.5rem] bg-sky-500/5 text-sky-500/60 hover:text-sky-400 hover:bg-sky-500/10 transition-all border border-transparent"
                        title="Acquire Digital Core"
                      >
                        <FiDownload size={22} />
                      </button>
                      <button 
                        onClick={() => sendBillOnWhatsApp(b.customerPhone, b, settings)}
                        className="w-12 h-12 flex items-center justify-center rounded-[1.5rem] bg-emerald-500/5 text-emerald-500/60 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all border border-transparent"
                        title="Wireless Relay"
                      >
                        <FiNavigation className="rotate-45" size={22} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && bills.length === 0 && (
            <div className="py-40 text-center relative overflow-hidden">
               <FiArchive size={80} className="mx-auto text-slate-800 mb-8 opacity-20" />
               <p className="text-slate-700 italic text-[12px] font-black uppercase tracking-[0.6em]">Zero Manifests Recovered from Archives</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal - Enhanced UI */}
      {showDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-slate-950/70 animate-in fade-in duration-500">
          <div className="glass-panel border-white/10 w-full max-w-5xl rounded-[4rem] shadow-[0_0_150px_rgba(0,0,0,0.8)] overflow-hidden animate-slide-up relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-600 via-sky-400 to-sky-600"></div>
            
            <div className="flex flex-col xl:flex-row h-full">
               {/* Left Sidebar Info */}
               <div className="w-full xl:w-96 bg-white/[0.01] border-r border-white/[0.03] p-12 space-y-12">
                  <div className="flex items-center gap-6 xl:flex-col xl:items-start">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-sky-500/10 flex items-center justify-center text-sky-500 shadow-[inset_0_0_20px_rgba(14,165,233,0.1)] border border-sky-500/10">
                      <FiFileText size={36} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white tracking-tight uppercase">Manifest</h3>
                      <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.4em] mt-2 font-black">Ref: #{showDetail.billNo}</p>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">Authenticated Subject</p>
                      <p className="text-lg font-black text-slate-200 tracking-wide uppercase">{showDetail.customerName}</p>
                      <p className="text-xs font-bold text-sky-500 bg-sky-500/5 px-4 py-2 rounded-xl border border-sky-500/10 inline-block font-mono">{showDetail.customerPhone}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">Temporal Alignment</p>
                      <div className="flex items-center gap-3 text-slate-400">
                        <FiCalendar className="text-sky-500" />
                        <p className="text-[11px] font-black uppercase tracking-widest leading-relaxed">
                          {new Date(showDetail.createdAt).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-10 border-t border-white/[0.03]">
                       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">Settlement Protocol</p>
                       <div className="flex items-center gap-4">
                         <div className={`w-3 h-3 rounded-full ${showDetail.paymentMode === 'Pending' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}></div>
                         <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${showDetail.paymentMode === 'Pending' ? 'text-rose-500' : 'text-emerald-500'}`}>
                           {showDetail.paymentMode === 'Pending' ? 'Unresolved' : showDetail.paymentMode}
                         </span>
                       </div>
                    </div>
                  </div>

                  <div className="pt-12 space-y-6">
                     <button 
                       onClick={() => generateBillPDF(showDetail, settings)}
                       className="w-full bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white py-5 rounded-[2rem] flex items-center justify-center gap-4 transition-all text-[11px] font-black uppercase tracking-[0.3em] border border-white/10 group/pdf"
                     >
                       <FiDownload className="group-hover:-translate-y-1 transition-transform" /> Acquire Digital Core
                     </button>
                     <button 
                       onClick={() => sendBillOnWhatsApp(showDetail.customerPhone, showDetail, settings)}
                       className="w-full bg-emerald-500 text-white py-5 rounded-[2rem] flex items-center justify-center gap-4 transition-all text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] active:scale-95 group/wa"
                     >
                       <FiNavigation className="rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> WhatsApp Relay
                     </button>
                  </div>
               </div>

               {/* Right main detailed list */}
               <div className="flex-1 p-12 bg-slate-900/10 relative overflow-y-auto custom-scrollbar max-h-[85vh]">
                  <button 
                    onClick={() => setShowDetail(null)} 
                    className="absolute top-10 right-10 w-16 h-16 rounded-[2rem] bg-white/[0.03] text-slate-600 hover:text-white flex items-center justify-center transition-all hover:rotate-90 text-4xl"
                  >
                    &times;
                  </button>

                  <div className="mb-14">
                    <div className="flex items-center gap-5 mb-10">
                       <div className="w-1.5 h-12 bg-sky-500 rounded-full"></div>
                       <h4 className="text-[12px] font-black uppercase tracking-[0.6em] text-slate-300">Composition Matrix</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                       {showDetail.items.map((item, idx) => (
                         <div key={idx} className="p-8 glass-card rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between group/item hover:ring-2 ring-sky-500/20 transition-all border-transparent bg-white/[0.01]">
                            <div className="flex items-center gap-8 mb-6 md:mb-0">
                               <div className="w-16 h-16 rounded-[1.5rem] bg-slate-950/60 flex items-center justify-center text-xs font-black text-sky-500 border border-white/[0.03] shadow-inner font-mono">
                                 {String(idx + 1).padStart(2, '0')}
                               </div>
                               <div>
                                 <p className="font-black text-slate-200 text-lg uppercase tracking-wide">{item.name}</p>
                                 <div className="flex flex-wrap items-center gap-4 mt-2">
                                    <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">Volume: <span className="text-slate-400">{item.qty} units</span></p>
                                    <span className="w-1 h-3 border-l border-slate-800"></span>
                                    <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">Wty: <span className="text-sky-500/60">{item.warranty || 'None'}</span></p>
                                    {item.imei && (
                                       <>
                                          <span className="w-1 h-3 border-l border-slate-800"></span>
                                          <p className="text-[10px] text-sky-500 uppercase font-black tracking-widest bg-sky-500/5 px-2 py-0.5 rounded border border-sky-500/10 font-mono">ID: {item.imei}</p>
                                       </>
                                    )}
                                  </div>
                               </div>
                            </div>
                            <div className="text-right flex flex-col items-center md:items-end">
                               <p className="font-black text-white text-2xl tracking-tighter">₹{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                               <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.3em] mt-1.5 italic">Unit Basis: ₹{item.price.toFixed(2)}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="pt-12 border-t border-white/[0.05] space-y-6">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
                      <span className="px-4 py-1.5 bg-white/[0.02] border border-white/[0.03] rounded-full text-slate-500">Gross Accumulation</span>
                      <span className="text-slate-400 text-base">₹{showDetail.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    {showDetail.discount > 0 && (
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-rose-500/60">
                        <span className="px-4 py-1.5 bg-rose-500/5 border border-rose-500/10 rounded-full">Legacy Rebate</span>
                        <span className="font-black text-base">-₹{showDetail.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    
                    {showDetail.gstAmount > 0 && (
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60">
                        <span className="px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full">Fiscal Component ({showDetail.gstPercent}%)</span>
                        <span className="font-black text-base">+₹{showDetail.gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/[0.08] gap-6">
                      <div className="flex items-center gap-4">
                         <FiCreditCard className="text-sky-500" size={24} />
                         <span className="text-[12px] font-black text-white uppercase tracking-[0.6em]">Consolidated Settlement</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-baseline gap-3">
                           <span className="text-2xl font-black text-slate-700">₹</span>
                           <span className="text-6xl font-black text-sky-400 drop-shadow-[0_0_30px_rgba(56,189,248,0.3)] tracking-tighter">
                             {showDetail.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                           </span>
                        </div>
                        <div className="w-full h-1 bg-sky-500/20 rounded-full mt-4 relative overflow-hidden">
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
