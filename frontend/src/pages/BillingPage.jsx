import { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import { BillingContext } from '../context/BillingContext';
import { AuthContext } from '../context/AuthContext';
import { 
  FiSearch, FiPlus, FiMinus, FiTrash2, FiFileText, 
  FiDownload, FiNavigation, FiPlusCircle, FiCheck, FiShoppingBag, FiUser, FiBox
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { generateBillPDF } from '../components/pdf/pdfGenerator';
import { sendBillOnWhatsApp } from '../components/pdf/whatsapp';

const BillingPage = () => {
  const { 
    customer, setCustomer,
    selectedItems, addItem, removeItem, updateItemWarranty,
    customItems, setCustomItems,
    discount, setDiscount,
    totals, setManualTotal,
    clearBill
  } = useContext(BillingContext);

  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchServices();
    fetchSettings();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/products?status=active');
      setProducts(data);
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/settings');
      setSettings(data);
    } catch (err) {
      toast.error('Failed to fetch settings');
    }
  };

  const fetchServices = async () => {
    try {
      const { data } = await axios.get('/services');
      setServices(data);
    } catch (err) {
      toast.error('Failed to fetch services');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleAddCustomItem = (service = null) => {
    if (service) {
      setCustomItems([...customItems, { 
        name: service.name, 
        qty: 1, 
        price: service.price, 
        total: service.price, 
        warranty: service.warranty || 'No Warranty' 
      }]);
    } else {
      setCustomItems([...customItems, { name: '', qty: 1, price: 0, total: 0, warranty: 'No Warranty' }]);
    }
  };

  const updateCustomItem = (index, field, value) => {
    const updated = [...customItems];
    updated[index][field] = value;
    if (field === 'qty' || field === 'price') {
      updated[index].total = updated[index].qty * updated[index].price;
    }
    setCustomItems(updated);
  };

  const removeCustomItem = (index) => {
    setCustomItems(customItems.filter((_, i) => i !== index));
  };

  const handleCreateBill = async (action = 'preview') => {
    if (!customer.name || !customer.phone) {
      toast.error('Customer name and phone are required');
      return;
    }

    if (selectedItems.length === 0 && customItems.length === 0) {
      toast.error('Add at least one item to the bill');
      return;
    }

    setSaving(true);
    try {
      const billData = {
        ...customer,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        items: [...selectedItems, ...customItems],
        subtotal: totals.subtotal,
        discount,
        total: totals.total,
        pdfTheme: settings?.pdfTheme || 'blue'
      };

      const { data } = await axios.post('/bills', billData);
      toast.success('Bill created successfully!');

      if (action === 'pdf') {
        generateBillPDF(data, settings);
      } else if (action === 'whatsapp') {
        sendBillOnWhatsApp(customer.phone, data, settings);
      }

      clearBill();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create bill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-slide-up font-outfit">
      <div className="xl:col-span-8 space-y-10">
        {/* Client Protocol Section */}
        <div className="glass-panel p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group border-white/[0.03]">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700">
            <FiUser size={180} />
          </div>
          <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-5 relative z-10 tracking-tight">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 text-2xl shadow-inner border border-sky-500/10">
               <FiUser />
            </div>
            Identification Protocol
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-3">Subject Name</label>
              <input
                type="text"
                value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                className="premium-input w-full bg-slate-900/40 border-slate-800 text-sm py-4"
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-3">Relay (WhatsApp)</label>
              <input
                type="text"
                value={customer.phone}
                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                className="premium-input w-full bg-slate-900/40 border-slate-800 text-sm py-4"
                placeholder="91 0000 0000"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-3">Settlement Node</label>
              <select
                value={customer.paymentMode}
                onChange={e => setCustomer({ ...customer, paymentMode: e.target.value })}
                className="premium-input w-full bg-slate-900/40 border-slate-800 text-xs font-black uppercase tracking-widest py-4 cursor-pointer"
              >
                <option value="Cash">Physical Relay (Cash)</option>
                <option value="UPI">Digital Stream (UPI)</option>
                <option value="Card">Bank Module (Card)</option>
                <option value="Pending">Deferred (Pending)</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-3">Internal Memo</label>
              <input
                type="text"
                value={customer.notes}
                onChange={e => setCustomer({ ...customer, notes: e.target.value })}
                className="premium-input w-full bg-slate-900/40 border-slate-800 text-sm py-4"
                placeholder="Optional notes..."
              />
            </div>
          </div>
        </div>

        {/* Inventory Hub Section */}
        <div className="glass-panel p-10 rounded-[3.5rem] shadow-2xl flex flex-col h-[700px] relative overflow-hidden group border-white/[0.03]">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700">
            <FiBox size={180} />
          </div>
          <div className="flex flex-col md:flex-row gap-8 mb-10 relative z-10">
            <div className="relative flex-1 group/search">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-sky-400 transition-colors duration-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="premium-input w-full pl-16 py-5 bg-slate-900/60 border-slate-800 focus:bg-slate-900/80 text-sm font-bold tracking-wide"
                placeholder="Access Catalog (Asset Name/Type)..."
              />
            </div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="premium-input bg-slate-900/60 border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] px-8 cursor-pointer"
            >
              <option value="All">Complete Repository</option>
              <option value="Screen Protection">Optic Defense</option>
              <option value="Cases & Covers">Armor Module</option>
              <option value="Cables & Chargers">Energy Relay</option>
              <option value="Audio">Acoustic Logic</option>
              <option value="Power">Core Cells</option>
              <option value="Accessories">Supplementary Hub</option>
              <option value="Other">Miscellaneous</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar relative z-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-6">
                <div className="w-16 h-16 border-4 border-sky-500/10 border-t-sky-500 rounded-full animate-spin shadow-2xl shadow-sky-500/20"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 animate-pulse">Syncing Inventory Core...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 pb-6">
                {filteredProducts.map(product => {
                  const selected = selectedItems.find(item => item.productId === product._id);
                  return (
                    <div 
                      key={product._id}
                      className={`
                        glass-card p-6 rounded-[2.5rem] relative overflow-hidden group transition-all duration-500 cursor-pointer
                        ${selected ? 'ring-2 ring-sky-500/40 bg-sky-500/10 shadow-[0_0_40px_rgba(14,165,233,0.15)]' : 'hover:bg-white/[0.04]'}
                      `}
                      onClick={() => !selected && addItem(product)}
                    >
                      <div className="absolute top-2 right-2 opacity-10 pointer-events-none transform -rotate-12 transition-transform group-hover:rotate-0 duration-700">
                         <div className="text-6xl font-black text-white">{product.emoji}</div>
                      </div>

                      <div className="text-4xl mb-6 relative z-10 transform group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">{product.emoji}</div>
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-200 line-clamp-1 mb-2 relative z-10">{product.name}</h4>
                      
                      <div className="flex justify-between items-center mt-6 relative z-10">
                        <p className="text-sky-400 font-black text-base tracking-tighter">₹{product.price.toLocaleString()}</p>
                        {selected ? (
                          <div className="flex items-center gap-4 bg-slate-950/80 rounded-2xl p-2 border border-white/[0.05] shadow-2xl" onClick={e => e.stopPropagation()}>
                            <button onClick={() => removeItem(product._id)} className="w-7 h-7 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><FiMinus size={14} /></button>
                            <span className="text-sm font-black text-white w-5 text-center">{selected.qty}</span>
                            <button onClick={() => addItem(product)} className="w-7 h-7 flex items-center justify-center text-sky-400 hover:bg-sky-400/10 rounded-xl transition-all"><FiPlus size={14} /></button>
                          </div>
                        ) : (
                          <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest bg-white/[0.02] px-3 py-1.5 rounded-xl border border-white/[0.03]">Units: {product.stock}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Engineering Services Section */}
        <div className="glass-panel p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group border-white/[0.03]">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700">
            <FiPlusCircle size={150} />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 relative z-10">
            <h3 className="text-2xl font-black text-white flex items-center gap-5 tracking-tight">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 text-2xl shadow-inner border border-amber-500/10">
                <FiPlusCircle />
              </div>
              Engineering Provision
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <select 
                className="premium-input bg-slate-900/60 text-[10px] py-4 px-6 focus:bg-slate-950/80 border-white/[0.05] font-black uppercase tracking-widest cursor-pointer w-full md:w-auto"
                onChange={(e) => {
                  const s = services.find(srv => srv._id === e.target.value);
                  if (s) {
                    handleAddCustomItem(s);
                    e.target.value = "";
                  }
                }}
              >
                <option value="">Matrix Provisioning</option>
                {services.map(s => (
                  <option key={s._id} value={s._id}>{s.name} (₹{s.price})</option>
                ))}
              </select>
              <button 
                onClick={() => handleAddCustomItem()}
                className="bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-2xl border border-white/[0.05] transition-all"
              >
                Manual Logic
              </button>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            {customItems.map((item, index) => (
              <div key={index} className="glass-card p-8 rounded-[2.5rem] grid grid-cols-1 lg:grid-cols-12 gap-8 items-end border-white/[0.01] hover:border-white/[0.05] transition-all group/item">
                <div className="lg:col-span-4 space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-4">Subject Description</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={e => updateCustomItem(index, 'name', e.target.value)}
                    className="premium-input w-full bg-slate-950/40 py-4 font-bold"
                    placeholder="Repair / Custom Service"
                  />
                </div>
                <div className="lg:col-span-3 space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-4">Temporal Insurance</label>
                  <input
                    type="text"
                    value={item.warranty}
                    onChange={e => updateCustomItem(index, 'warranty', e.target.value)}
                    className="premium-input w-full bg-slate-950/40 py-4 font-bold text-sky-400"
                    placeholder="Warranty duration"
                  />
                </div>
                <div className="lg:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-4">Valuation (₹)</label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={e => updateCustomItem(index, 'price', parseFloat(e.target.value) || 0)}
                    className="premium-input w-full bg-slate-950/40 py-4 text-emerald-400 font-extrabold text-center"
                  />
                </div>
                <div className="lg:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-4">Volume</label>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={e => updateCustomItem(index, 'qty', parseInt(e.target.value) || 1)}
                    className="premium-input w-full bg-slate-950/40 py-4 font-black text-center"
                  />
                </div>
                <div className="lg:col-span-1 flex justify-center pb-1">
                   <button 
                    onClick={() => removeCustomItem(index)}
                    className="w-14 h-14 flex items-center justify-center bg-rose-500/5 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/10"
                  >
                    <FiTrash2 size={24} />
                  </button>
                </div>
              </div>
            ))}
            {customItems.length === 0 && (
              <div className="text-center py-20 rounded-[2.5rem] border border-dashed border-white/[0.05]">
                 <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.4em] italic">No Engineering Provisions Documented</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="xl:col-span-4 max-h-[calc(100vh-100px)] sticky top-10">
        <div className="glass-panel rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col h-full border-white/[0.03]">
          <div className="p-10 bg-white/[0.02] border-b border-white/[0.03]">
            <h3 className="text-2xl font-black text-white flex items-center gap-5 uppercase tracking-tight">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 text-2xl shadow-inner border border-sky-500/10">
                 <FiShoppingBag />
              </div>
              Order Summary
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-600 border-b border-white/[0.03]">
                  <th className="pb-5 text-[9px] font-black uppercase tracking-[0.3em] px-2">Manifestation</th>
                  <th className="pb-5 text-[9px] font-black uppercase tracking-[0.3em] text-center">Qty</th>
                  <th className="pb-5 text-[9px] font-black uppercase tracking-[0.3em] text-right px-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {[...selectedItems, ...customItems].map((item, i) => (
                  <tr key={i} className="group hover:bg-white/[0.01] transition-all">
                    <td className="py-6 px-2 text-left">
                      <p className="font-bold text-slate-200 text-xs truncate max-w-[120px] uppercase tracking-wide">{item.name}</p>
                      <div className="flex items-center gap-2 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Wty Protocol:</span>
                        <input
                          type="text"
                          value={item.warranty || 'None'}
                          onChange={(e) => updateItemWarranty(item.productId || i, e.target.value, !item.productId)}
                          className="bg-transparent border-none text-[9px] p-0 text-sky-400 focus:ring-0 w-24 font-black uppercase"
                        />
                      </div>
                    </td>
                    <td className="py-6 font-black text-center text-slate-500 text-xs">{item.qty}</td>
                    <td className="py-6 font-black text-white text-right px-2 text-sm tracking-tighter">₹{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                {(selectedItems.length === 0 && customItems.length === 0) && (
                  <tr>
                    <td colSpan="3" className="py-24 text-center">
                       <p className="text-slate-800 italic text-[10px] font-black uppercase tracking-[0.4em]">Empty Manifestation Portfolio</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-10 bg-slate-950/60 space-y-8 border-t border-white/[0.05]">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                <span>Gross Accumulation</span>
                <span className="text-slate-200 text-sm">₹{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500/60">Legacy Rebate (₹)</span>
                <input
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-28 premium-input bg-slate-900/40 py-2.5 px-4 text-right text-base text-rose-500 font-black border-rose-500/10 focus:bg-slate-900/60"
                />
              </div>
            </div>

            <div className="pt-8 border-t border-white/[0.05] flex justify-between items-end relative">
              <div className="w-full">
                <p className="text-[10px] text-sky-400 font-black uppercase tracking-[0.4em] mb-3">CONSOLIDATED SETTLEMENT</p>
                <div className="flex items-center text-white relative w-full">
                  <span className="text-3xl font-black text-slate-600 mr-3">₹</span>
                  <input
                    type="number"
                    value={totals.total}
                    onChange={e => setManualTotal(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-none text-5xl font-black text-sky-400 focus:ring-0 p-0 w-full hover:bg-white/[0.02] rounded-2xl transition-all cursor-text tracking-tighter"
                  />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_20px_rgba(14,165,233,1)] animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button 
                onClick={clearBill}
                className="text-[9px] font-black text-slate-700 hover:text-rose-500 transition-colors uppercase tracking-[0.4em]"
              >
                Flush Protocol
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5 pt-2">
              <button
                onClick={() => handleCreateBill('pdf')}
                disabled={saving}
                className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] p-5 rounded-[2rem] flex flex-col items-center gap-3 group transition-all active:scale-95"
              >
                <FiDownload className="text-sky-500 group-hover:scale-110 transition-transform duration-500" size={28} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-200">Export Card</span>
              </button>
              <button
                onClick={() => handleCreateBill('whatsapp')}
                disabled={saving}
                className="bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 p-5 rounded-[2rem] flex flex-col items-center gap-3 group transition-all active:scale-95"
              >
                <FiNavigation className="text-emerald-500 group-hover:scale-110 rotate-45 transition-transform duration-500" size={28} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">Relay Port</span>
              </button>
              <button
                onClick={() => handleCreateBill('preview')}
                disabled={saving}
                className="col-span-2 bg-gradient-to-r from-sky-600 to-sky-400 text-white py-6 rounded-[2.5rem] flex items-center justify-center gap-5 font-black text-sm uppercase tracking-[0.3em] shadow-[0_20px_50px_-10px_rgba(14,165,233,0.4)] active:scale-95 transition-all overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {saving ? (
                  <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FiCheck size={24} /> Finalize Authorization
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
