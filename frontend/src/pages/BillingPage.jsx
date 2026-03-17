import { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import { BillingContext } from '../context/BillingContext';
import { AuthContext } from '../context/AuthContext';
import { 
  FiSearch, FiPlus, FiMinus, FiTrash2, FiFileText, 
  FiDownload, FiNavigation, FiPlusCircle, FiCheck, FiShoppingBag 
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#121d30] border border-white/5 p-6 rounded-3xl shadow-xl">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#00d4ff] mb-4 flex items-center gap-2">
            <FiFileText /> Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase ml-1">Name</label>
              <input
                type="text"
                value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                className="w-full bg-black/30 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase ml-1">Phone (WhatsApp)</label>
              <input
                type="text"
                value={customer.phone}
                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full bg-black/30 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                placeholder="91XXXXXXXXXX"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase ml-1">Payment Mode</label>
              <select
                value={customer.paymentMode}
                onChange={e => setCustomer({ ...customer, paymentMode: e.target.value })}
                className="w-full bg-black/30 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / PhonePe / GPay</option>
                <option value="Card">Card</option>
                <option value="Pending">Pending / Khata</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase ml-1">Notes</label>
              <input
                type="text"
                value={customer.notes}
                onChange={e => setCustomer({ ...customer, notes: e.target.value })}
                className="w-full bg-black/30 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                placeholder="Optional remarks"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#121d30] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col h-[600px]">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                placeholder="Search products..."
              />
            </div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
            >
              <option value="All">All Categories</option>
              <option value="Screen Protection">Screen Protection</option>
              <option value="Cases & Covers">Cases & Covers</option>
              <option value="Cables & Chargers">Cables & Chargers</option>
              <option value="Audio">Audio</option>
              <option value="Power">Power</option>
              <option value="Accessories">Accessories</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#00d4ff]/20 border-t-[#00d4ff] rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => {
                  const selected = selectedItems.find(item => item.productId === product._id);
                  return (
                    <div 
                      key={product._id}
                      className={`
                        p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02]
                        ${selected 
                          ? 'bg-[#00d4ff]/10 border-[#00d4ff]/30 shadow-lg shadow-[#00d4ff]/5' 
                          : 'bg-white/5 border-white/5 hover:border-white/10'}
                      `}
                      onClick={() => !selected && addItem(product)}
                    >
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{product.emoji}</div>
                      <h4 className="text-sm font-bold truncate text-white/90">{product.name}</h4>
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-[#00d4ff] font-black text-sm">₹{product.price}</p>
                        {selected ? (
                          <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 border border-white/5" onClick={e => e.stopPropagation()}>
                            <button onClick={() => removeItem(product._id)} className="p-1 hover:text-red-500"><FiMinus size={12} /></button>
                            <span className="text-xs font-black min-w-[20px] text-center">{selected.qty}</span>
                            <button onClick={() => addItem(product)} className="p-1 hover:text-[#00d4ff]"><FiPlus size={12} /></button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-white/30 font-bold uppercase truncate max-w-[60px]">Stock: {product.stock}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#121d30] border border-white/5 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#00d4ff] flex items-center gap-2">
              <FiPlusCircle /> Services & Repairs
            </h3>
            <div className="flex gap-2">
              <select 
                className="bg-black/30 border border-white/5 rounded-lg text-[10px] px-2 py-1 text-white/60 focus:outline-none"
                onChange={(e) => {
                  const s = services.find(srv => srv._id === e.target.value);
                  if (s) {
                    handleAddCustomItem(s);
                    e.target.value = "";
                  }
                }}
              >
                <option value="">Quick Add Service</option>
                {services.map(s => (
                  <option key={s._id} value={s._id}>{s.name} (₹{s.price})</option>
                ))}
              </select>
              <button 
                onClick={() => handleAddCustomItem()}
                className="text-xs font-bold bg-[#00d4ff]/10 text-[#00d4ff] px-3 py-1.5 rounded-lg border border-[#00d4ff]/20 hover:bg-[#00d4ff]/20 transition-all flex items-center gap-2"
              >
                <FiPlus /> Custom
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {customItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-end animate-in fade-in slide-in-from-left-4 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                <div className="flex-[2] space-y-1">
                  <label className="text-[9px] font-black text-white/20 uppercase ml-1">Service / Item Name</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={e => updateCustomItem(index, 'name', e.target.value)}
                    className="w-full bg-black/30 border border-white/5 rounded-xl py-2 px-3 text-sm text-white"
                    placeholder="E.g. Repair Service"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-black text-white/20 uppercase ml-1">Warranty</label>
                  <input
                    type="text"
                    value={item.warranty}
                    onChange={e => updateCustomItem(index, 'warranty', e.target.value)}
                    className="w-full bg-black/30 border border-white/5 rounded-xl py-2 px-3 text-sm text-white"
                    placeholder="E.g. 6 Months"
                  />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-[9px] font-black text-white/20 uppercase ml-1">Price (₹)</label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={e => updateCustomItem(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full bg-black/30 border border-white/5 rounded-xl py-2 px-3 text-sm text-white"
                  />
                </div>
                <div className="w-16 space-y-1">
                  <label className="text-[9px] font-black text-white/20 uppercase ml-1">Qty</label>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={e => updateCustomItem(index, 'qty', parseInt(e.target.value) || 1)}
                    className="w-full bg-black/30 border border-white/5 rounded-xl py-2 px-3 text-sm text-white"
                  />
                </div>
                <button 
                  onClick={() => removeCustomItem(index)}
                  className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-all"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
            {customItems.length === 0 && (
              <p className="text-center py-4 text-white/10 text-xs italic">No custom items or services added</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-[#121d30] border border-white/5 rounded-3xl shadow-xl overflow-hidden flex flex-col sticky top-20 max-h-[calc(100vh-120px)]">
          <div className="p-6 bg-white/[0.02] border-b border-white/5">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#00d4ff] flex items-center gap-2">
              <FiShoppingBag /> Order Summary
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-white/30 border-b border-white/5">
                  <th className="py-2 font-black uppercase tracking-tighter">Item</th>
                  <th className="py-2 font-black uppercase tracking-tighter text-center">Qty</th>
                  <th className="py-2 font-black uppercase tracking-tighter text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {[...selectedItems, ...customItems].map((item, i) => (
                  <tr key={i} className="group border-b border-white/[0.02] last:border-0 text-white/70">
                    <td className="py-3 pr-2">
                      <p className="font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">{item.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[9px] text-white/30 uppercase font-black">Warranty:</span>
                        <input
                          type="text"
                          value={item.warranty || 'No Warranty'}
                          onChange={(e) => updateItemWarranty(item.productId || i, e.target.value, !item.productId)}
                          className="bg-transparent border-none text-[10px] p-0 text-[#00d4ff] focus:ring-0 w-full"
                        />
                      </div>
                    </td>
                    <td className="py-3 font-black text-center text-white/80">{item.qty}</td>
                    <td className="py-3 font-black text-[#00d4ff] text-right">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
                {selectedItems.length === 0 && customItems.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-10 text-center text-white/10 italic">Cart is empty</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-black/20 space-y-4 border-t border-white/5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/40 font-bold uppercase">
                <span>Subtotal</span>
                <span>₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] text-white/40 font-black uppercase">Discount (₹)</span>
                <input
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-black/30 border border-white/5 rounded-lg px-2 py-1 text-right text-sm text-[#ff5f2e]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-end">
              <div>
                <p className="text-[10px] text-[#00d4ff] font-black uppercase tracking-widest">Final Amount (Editable)</p>
                <div className="flex items-center text-white">
                  <span className="text-2xl font-black">₹</span>
                  <input
                    type="number"
                    value={totals.total}
                    onChange={e => setManualTotal(parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-none text-3xl font-black text-white focus:ring-0 p-0 w-32 ml-1"
                  />
                </div>
              </div>
              <button 
                onClick={clearBill}
                className="text-xs font-bold text-white/20 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleCreateBill('pdf')}
                disabled={saving}
                className="col-span-1 bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-2xl flex flex-col items-center gap-1 transition-all group active:scale-95"
              >
                <FiDownload className="text-[#00d4ff] group-hover:scale-110 transition-transform" size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest">Download PDF</span>
              </button>
              <button
                onClick={() => handleCreateBill('whatsapp')}
                disabled={saving}
                className="col-span-1 bg-[#00e676]/10 hover:bg-[#00e676]/20 border border-[#00e676]/30 p-3 rounded-2xl flex flex-col items-center gap-1 transition-all group active:scale-95"
              >
                <FiNavigation className="text-[#00e676] group-hover:scale-110 rotate-45 transition-transform" size={20} />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#00e676]">WhatsApp Bill</span>
              </button>
              <button
                onClick={() => handleCreateBill('preview')}
                disabled={saving}
                className="col-span-2 bg-gradient-to-r from-[#004aaa] to-[#00d4ff] p-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm shadow-lg shadow-[#00d4ff]/20 active:scale-[0.98] transition-all"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FiCheck size={18} /> SAVE & VALIDATE BILL
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
