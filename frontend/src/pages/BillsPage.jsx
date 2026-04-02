import { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import { FiPlus, FiTrash2, FiSend, FiDownload, FiPhone, FiUser, FiClock, FiFileText, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { sendBillOnWhatsApp } from '../components/pdf/whatsapp';
import { generateBillPDF } from '../components/pdf/pdfGenerator';

const BillsPage = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef(null);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    discount: '',
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
    } catch {
      toast.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/settings');
      setSettings(data);
    } catch {
      console.error('Settings fetch failed');
    }
  };

  const addItem = () => setItems([...items, { name: '', price: '' }]);

  const removeItem = (i) => {
    if (items.length > 1) setItems(items.filter((_, idx) => idx !== i));
  };

  const updateItem = (i, field, val) => {
    const updated = [...items];
    updated[i][field] = val;
    setItems(updated);
  };

  const subtotal = items.reduce((s, it) => s + (parseFloat(it.price) || 0), 0);
  const discountAmt = parseFloat(formData.discount) || 0;
  const total = Math.max(0, subtotal - discountAmt);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone) return toast.error('Enter customer details');
    if (subtotal <= 0) return toast.error('Add at least one item with price');

    setSaving(true);
    try {
      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        items: items.filter(i => i.name && i.price).map(i => ({
          name: i.name, qty: 1,
          price: parseFloat(i.price),
          total: parseFloat(i.price)
        })),
        subtotal,
        discount: discountAmt,
        total,
        paymentMode: 'Cash',
        createdAt: formData.date
      };

      const { data } = await axios.post('/bills', payload);
      toast.success('✅ Bill Generated!');
      sendBillOnWhatsApp(formData.customerPhone, data, settings);

      // Reset form
      setFormData({ customerName: '', customerPhone: '', discount: '', date: new Date().toISOString().split('T')[0] });
      setItems([{ name: '', price: '' }]);
      fetchBills();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = (bill) => {
    try {
      generateBillPDF(bill, settings, true);
      toast.success('Downloading...');
    } catch {
      toast.error('Download failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-outfit">
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-base font-black text-sky-600 uppercase tracking-tight leading-none">Pavan Mobile World</h1>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">Bill Generator</p>
        </div>
        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
          {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16 pt-4 md:pt-8 md:px-6">

        {/* ── NEW BILL FORM ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">

          {/* Form Header */}
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <FiFileText className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-white font-black text-base uppercase tracking-tight">New Bill</h2>
              <p className="text-sky-100 text-[10px] font-bold uppercase tracking-widest">Quick Generate</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">

            {/* Date + Customer */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" size={15} />
                  <input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-9 pr-4 py-3 text-sm font-bold font-mono text-sky-600 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
                    placeholder="91XXXXXXXX"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Customer Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-9 pr-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-sky-400 focus:bg-white transition-all"
                  placeholder="Customer full name"
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items / Services</label>
                <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-sky-500 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">
                  <FiPlus size={14} /> Add Item
                </button>
              </div>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-gray-50 rounded-2xl border border-gray-200 px-3 py-2 focus-within:border-sky-300 focus-within:bg-sky-50/30 transition-all">
                    <input
                      type="text"
                      required
                      value={item.name}
                      onChange={e => updateItem(idx, 'name', e.target.value)}
                      placeholder="Item or service..."
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm font-bold text-gray-800 placeholder:text-gray-300"
                    />
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 w-28">
                      <span className="text-[11px] font-black text-gray-300">₹</span>
                      <input
                        type="number"
                        required
                        value={item.price}
                        onChange={e => updateItem(idx, 'price', e.target.value)}
                        placeholder="0"
                        className="w-full bg-transparent border-none focus:outline-none text-sm font-black text-gray-900 p-0"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className={`p-1.5 rounded-xl transition-all ${items.length > 1 ? 'text-rose-400 active:bg-rose-50' : 'text-gray-200 pointer-events-none'}`}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Discount */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Discount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400 font-black text-sm">₹</span>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={e => setFormData({ ...formData, discount: e.target.value })}
                  className="w-full bg-rose-50/50 border border-rose-100 rounded-2xl pl-9 pr-4 py-3 text-sm font-bold text-rose-500 focus:outline-none focus:border-rose-300 transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Live Total */}
            <div className="rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 px-5 py-4 flex justify-between items-center">
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Gross</p>
                <p className="text-sm font-black text-gray-500">₹{subtotal.toLocaleString('en-IN')}</p>
                {discountAmt > 0 && (
                  <p className="text-[10px] font-bold text-rose-500">- ₹{discountAmt.toLocaleString('en-IN')} discount</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Net Total</p>
                <p className="text-3xl font-black text-emerald-600 tracking-tight">₹{total.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-emerald-500 active:bg-emerald-600 text-white py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiSend size={18} className="-rotate-45" />
                  Generate &amp; WhatsApp
                </>
              )}
            </button>

          </form>
        </div>

        {/* ── BILL HISTORY ── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            className="w-full px-5 py-4 flex justify-between items-center active:bg-gray-50 transition-colors"
            onClick={() => {
              setShowHistory(h => !h);
              setTimeout(() => historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center border border-sky-100">
                <FiClock className="text-sky-500" size={16} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Bill History</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{bills.length} records</p>
              </div>
            </div>
            {showHistory ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
          </button>

          {showHistory && (
            <div ref={historyRef} className="border-t border-gray-50">
              {loading ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Loading...</p>
                </div>
              ) : bills.length === 0 ? (
                <div className="py-12 text-center">
                  <FiFileText size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest">No Bills Yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {bills.map(b => (
                    <div key={b._id} className="px-5 py-4 flex items-center justify-between active:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 text-sm uppercase truncate">{b.customerName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <FiPhone className="text-sky-400 flex-shrink-0" size={10} />
                          <span className="text-[10px] font-mono font-bold text-sky-500 truncate">{b.customerPhone}</span>
                          <span className="text-[9px] text-gray-300 font-bold">•</span>
                          <span className="text-[10px] font-bold text-gray-400">{new Date(b.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        {b.discount > 0 && (
                          <span className="inline-block mt-1 text-[9px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                            ₹{b.discount} off
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-right">
                          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Total</p>
                          <p className="text-lg font-black text-gray-900 tracking-tight leading-none">₹{b.total.toLocaleString('en-IN')}</p>
                        </div>
                        <button
                          onClick={() => handleDownload(b)}
                          className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 text-sky-500 flex items-center justify-center active:scale-90 transition-all"
                        >
                          <FiDownload size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BillsPage;
