import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FiFileText, FiClock, FiUser, FiCreditCard, FiTag, FiPlus, FiX, FiSend, FiShoppingBag, FiCalendar, FiDownload, FiPhone, FiSmartphone, FiTool, FiTrash2, FiPlusCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { sendBillOnWhatsApp } from '../components/pdf/whatsapp';
import { generateBillPDF } from '../components/pdf/pdfGenerator';

const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    discount: '0',
    date: new Date().toISOString().split('T')[0]
  });

  const [items, setItems] = useState([{ name: '', price: '' }]);

  useEffect(() => {
    fetchBills();
    fetchSettings();
  }, []);

  const fetchBills = async () => {
    try {
      const { data } = await axios.get('/bills');
      setBills(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      toast.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/settings');
      setSettings(data);
    } catch (err) {
      console.error('Settings fetch failed');
    }
  };

  const addItemRow = () => {
    setItems([...items, { name: '', price: '' }]);
  };

  const removeItemRow = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(formData.discount) || 0;
    return Math.max(0, subtotal - discount);
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    const subtotal = calculateSubtotal();
    const total = calculateTotal();

    if (!formData.customerName || !formData.customerPhone || subtotal <= 0) {
      return toast.error('Please add at least one item with a price');
    }

    setSaving(true);
    try {
      const billData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        items: items.filter(i => i.name && i.price).map(i => ({
          name: i.name,
          qty: 1,
          price: parseFloat(i.price),
          total: parseFloat(i.price)
        })),
        subtotal: subtotal,
        discount: parseFloat(formData.discount) || 0,
        total: total,
        paymentMode: 'Cash',
        createdAt: formData.date
      };

      const { data } = await axios.post('/bills', billData);
      toast.success('Bill Generated successfully!');
      
      sendBillOnWhatsApp(formData.customerPhone, data, settings);

      // Reset
      setFormData({ 
        customerName: '', 
        customerPhone: '', 
        discount: '0',
        date: new Date().toISOString().split('T')[0]
      });
      setItems([{ name: '', price: '' }]);
      setShowModal(false);
      fetchBills();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadBill = (bill) => {
    try {
      generateBillPDF(bill, settings, true);
      toast.success('Downloading Invoice...');
    } catch (err) {
      toast.error('Download failed');
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-slide-up font-outfit relative pb-20">
      {/* Header Actions */}
      <div className="flex justify-between items-center px-2 md:px-0">
        <h2 className="text-lg md:text-2xl font-black text-gray-900 uppercase tracking-tight md:hidden">Records</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-sky-500 hover:bg-sky-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-500/20 active:scale-95 transition-all ml-auto"
        >
          <FiPlus size={18} className="md:w-5 md:h-5" /> <span className="hidden xs:inline">New Bill</span><span className="xs:hidden">Generate</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-6">
           <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 animate-pulse">Retrieving Archives...</p>
        </div>
      ) : bills.length === 0 ? (
        <div className="py-40 text-center relative overflow-hidden bg-white border border-gray-50 rounded-[3rem]">
           <FiFileText size={80} className="mx-auto text-gray-200 mb-8" />
           <p className="text-gray-400 italic text-[12px] font-black uppercase tracking-[0.6em]">Zero Records Found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-gray-100 rounded-[3rem] shadow-xl overflow-hidden relative transition-all duration-700">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] border-b border-gray-50">
                    <th className="px-10 py-8"><div className="flex items-center gap-3"><FiClock className="text-sky-500" /> Date</div></th>
                    <th className="px-10 py-8"><div className="flex items-center gap-3"><FiUser className="text-amber-500" /> Customer</div></th>
                    <th className="px-10 py-8"><div className="flex items-center gap-3"><FiCreditCard className="text-emerald-500" /> Total Amount</div></th>
                    <th className="px-10 py-8"><div className="flex items-center gap-3"><FiTag className="text-rose-500" /> Discount</div></th>
                    <th className="px-10 py-8 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bills.map((b) => (
                    <tr key={b._id} className="hover:bg-sky-50/30 transition-all group duration-300">
                      <td className="px-10 py-10">
                        <div className="flex flex-col">
                           <p className="font-mono text-gray-800 font-black text-sm tracking-tighter">
                             {new Date(b.createdAt).toLocaleDateString()}
                           </p>
                           <p className="text-[10px] text-gray-400 mt-2 uppercase font-black tracking-widest italic opacity-0 group-hover:opacity-100 transition-opacity">
                             #{b.billNo}
                           </p>
                        </div>
                      </td>
                      <td className="px-10 py-10">
                        <p className="font-black text-gray-900 text-sm uppercase tracking-wide">{b.customerName}</p>
                        <p className="text-[10px] text-sky-500/60 font-bold mt-1 font-mono tracking-tighter group-hover:text-sky-500 transition-colors uppercase">
                          {b.customerPhone}
                        </p>
                      </td>
                      <td className="px-10 py-10">
                        <div className="flex items-baseline gap-2">
                           <span className="text-sm font-black text-gray-300 group-hover:text-emerald-500/30 transition-colors">₹</span>
                           <p className="font-black text-xl text-gray-900 tracking-tighter group-hover:scale-105 transition-transform origin-left">{b.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                      </td>
                      <td className="px-10 py-10">
                        <div className={`px-4 py-2 rounded-2xl border text-xs font-black tracking-widest uppercase inline-block ${b.discount > 0 ? 'bg-rose-50 text-rose-500 border-rose-100 animate-pulse' : 'bg-gray-50 text-gray-300 border-gray-100'}`}>
                          {b.discount > 0 ? `- ₹${b.discount.toLocaleString()}` : "No Discount"}
                        </div>
                      </td>
                      <td className="px-10 py-10 text-center">
                        <button 
                          onClick={() => handleDownloadBill(b)}
                          className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 hover:bg-sky-500 hover:text-white flex items-center justify-center mx-auto transition-all shadow-sm active:scale-90"
                          title="Download PDF"
                        >
                          <FiDownload size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Layout View */}
          <div className="md:hidden space-y-4">
            {bills.map((b) => (
              <div key={b._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden active:scale-[0.98] transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2 mb-1">
                      <FiClock className="text-sky-400" /> {new Date(b.createdAt).toDateString().toUpperCase()}
                    </span>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-tight">{b.customerName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <FiPhone className="text-sky-500 w-3 h-3" />
                      <span className="text-[11px] font-mono font-bold text-sky-600 tracking-tighter">{b.customerPhone}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownloadBill(b)}
                    className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center shadow-inner border border-sky-100"
                  >
                    <FiDownload size={20} />
                  </button>
                </div>

                <div className="flex justify-between items-end mt-6 border-t border-gray-50 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Settlement</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-black text-gray-300">₹</span>
                      <span className="text-2xl font-black text-gray-900 tracking-tighter">{b.total.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${b.discount > 0 ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-gray-50 text-gray-300 border border-gray-100'}`}>
                    {b.discount > 0 ? `-${b.discount} OFF` : 'NO DISC'}
                  </div>
                </div>
                
                {/* Decorative Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full -mr-12 -mt-12 blur-2xl pointer-events-none"></div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* New Bill Modal (Dynamic Items) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 backdrop-blur-xl bg-black/40 animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-4xl rounded-t-[3rem] md:rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up p-8 md:p-14 relative max-h-[95vh] overflow-y-auto">
            <div className="md:hidden w-12 h-1 bg-gray-200 rounded-full mx-auto mb-8"></div>
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 md:top-8 right-6 md:right-8 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 flex items-center justify-center transition-all"
            >
              <FiX size={24} />
            </button>

            <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
               <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-sky-50 flex items-center justify-center text-sky-500 text-2xl md:text-3xl shadow-inner border border-sky-100">
                  <FiShoppingBag />
               </div>
               <div>
                  <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase">Generate Bill</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-0.5 md:mt-1">Add items below</p>
               </div>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-8 md:space-y-12">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] ml-2">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="premium-input w-full bg-gray-50 px-6 py-4 text-xs font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] ml-2">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    className="premium-input w-full bg-gray-50 px-6 py-4 text-xs font-bold"
                    placeholder="Full Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] ml-2">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.customerPhone}
                    onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="premium-input w-full bg-gray-50 px-6 py-4 text-xs font-mono font-bold text-sky-600"
                    placeholder="91XXXXXXXXXX"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[10px] font-black text-gray-900 uppercase tracking-[0.4em]">Items Manifest</label>
                  <button 
                    type="button"
                    onClick={addItemRow}
                    className="flex items-center gap-2 text-sky-500 font-black text-[10px] uppercase tracking-widest hover:text-sky-600 transition-colors"
                  >
                    <FiPlusCircle size={16} /> Add Another
                  </button>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-gray-50/50 p-4 rounded-3xl border border-gray-50 transition-all focus-within:border-sky-100 focus-within:bg-white">
                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={e => updateItem(idx, 'name', e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-gray-200"
                          placeholder="Item or Service Description..."
                        />
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-2 flex-1 md:w-32">
                          <span className="text-[10px] font-black text-gray-300">₹</span>
                          <input
                            type="number"
                            required
                            value={item.price}
                            onChange={e => updateItem(idx, 'price', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-black text-gray-900 p-0"
                            placeholder="0.00"
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className={`p-3 rounded-xl transition-all ${items.length > 1 ? 'text-rose-400 hover:bg-rose-50' : 'text-gray-200 opacity-0 pointer-events-none'}`}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary & Totals */}
              <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center text-gray-400 text-[10px] font-black uppercase tracking-[0.4em]">
                      <span>Gross Amount</span>
                      <span className="text-white">₹{calculateSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-sky-400 uppercase tracking-[0.4em]">Discount Adjustment</label>
                      <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-4">
                        <span className="text-gray-500 font-black">₹</span>
                        <input
                          type="number"
                          value={formData.discount}
                          onChange={e => setFormData({ ...formData, discount: e.target.value })}
                          className="w-full bg-transparent border-none focus:ring-0 text-lg font-black text-rose-400 p-0"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center md:text-right">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.6em] block mb-2">Net Settlement</span>
                    <div className="flex items-baseline justify-center md:justify-end gap-2 text-4xl md:text-6xl font-black tracking-tighter">
                      <span className="text-xl md:text-2xl text-white/20">₹</span>
                      <span className="animate-pulse">{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 rounded-[2rem] flex items-center justify-center gap-4 text-xs md:text-sm font-black uppercase tracking-[0.5em] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
              >
                {saving ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FiSend size={24} className="rotate-45" /> Finalize & WhatsApp
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillsPage;
