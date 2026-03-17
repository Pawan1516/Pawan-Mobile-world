import { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import { BillingContext } from '../context/BillingContext';
import { AuthContext } from '../context/AuthContext';
import { 
  FiSearch, FiPlus, FiMinus, FiTrash2, FiFileText, 
  FiDownload, FiNavigation, FiPlusCircle, FiCheck, FiShoppingBag, FiUser, FiBox,
  FiCpu, FiTablet, FiShield, FiShare2, FiExternalLink
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { generateBillPDF } from '../components/pdf/pdfGenerator';
import { sendBillOnWhatsApp, shareBill } from '../components/pdf/whatsapp';

const BillingPage = () => {
  const { 
    customer, setCustomer,
    selectedItems, setSelectedItems, addItem, removeItem, updateItemWarranty,
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
      } else if (action === 'share') {
        shareBill(data, settings);
      } else if (action === 'view') {
        window.open(`/view-bill/${data._id}`, '_blank');
      }

      clearBill();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create bill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-slide-up font-outfit pb-72">
      <div className="xl:col-span-8 space-y-12">
        {/* Client Protocol Section */}
        <div className="bg-white p-10 rounded-[4rem] shadow-xl relative overflow-hidden group border border-gray-100 hover:bg-gray-50/50 transition-all duration-700">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-1000">
            <FiUser size={200} />
          </div>
          <div className="flex items-center justify-between mb-12 relative z-10">
            <h3 className="text-3xl font-black text-gray-900 flex items-center gap-6 tracking-tight">
              <div className="w-16 h-16 rounded-[1.5rem] bg-sky-50 flex items-center justify-center text-sky-500 text-3xl shadow-inner border border-sky-100 group-hover:rotate-6 transition-transform">
                 <FiUser />
              </div>
              <div className="flex flex-col">
                <span>Customer Details</span>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em] mt-1">Client Information</span>
              </div>
            </h3>
            <div className="hidden md:flex flex-col items-end">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Date & Time</span>
               <span className="text-xs font-mono text-sky-600 font-bold mt-1">{new Date().toLocaleDateString()} // {new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4">Customer Name</label>
              <input
                type="text"
                value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                className="premium-input w-full bg-gray-50 border-gray-100 text-gray-800 text-sm py-5 px-6 font-bold"
                placeholder="Full Name / Org"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4">WhatsApp Number</label>
              <input
                type="text"
                value={customer.phone}
                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                className="premium-input w-full bg-gray-50 border-gray-100 text-sm py-5 px-6 font-mono font-bold text-sky-600"
                placeholder="+91 0000 0000"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4">Payment Mode</label>
              <select
                value={customer.paymentMode}
                onChange={e => setCustomer({ ...customer, paymentMode: e.target.value })}
                className="premium-input w-full bg-gray-50 border-gray-100 text-[10px] font-black uppercase tracking-[0.3em] py-5 px-6 cursor-pointer hover:bg-gray-100 transition-all font-outfit text-gray-700"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay</option>
                <option value="Card">Card</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4">Bill Notes</label>
              <input
                type="text"
                value={customer.notes}
                onChange={e => setCustomer({ ...customer, notes: e.target.value })}
                className="premium-input w-full bg-gray-50 border-gray-100 text-gray-800 text-sm py-5 px-6"
                placeholder="Add special notes..."
              />
            </div>
          </div>
        </div>

        {/* Mobile Asset Repository Section */}
        <div className="bg-white p-10 rounded-[4rem] shadow-xl flex flex-col h-[750px] relative overflow-hidden group border border-gray-100 transition-all duration-700">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-1000">
            <FiCpu size={220} />
          </div>

          <div className="flex flex-col xl:flex-row items-center justify-between gap-8 mb-12 relative z-10">
            <h3 className="text-3xl font-black text-gray-900 flex items-center gap-6 tracking-tight">
              <div className="w-16 h-16 rounded-[1.5rem] bg-amber-50 flex items-center justify-center text-amber-500 text-3xl shadow-inner border border-amber-100 group-hover:scale-110 transition-transform">
                <FiBox />
              </div>
              <div className="flex flex-col">
                <span>Products & Inventory</span>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em] mt-1">Select from Stock</span>
              </div>
            </h3>

            <div className="flex flex-col sm:flex-row gap-6 w-full xl:w-auto">
              <div className="relative flex-1 group/search sm:w-80">
                <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-sky-500 transition-colors duration-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="premium-input w-full pl-16 py-5 bg-gray-50 border-gray-100 focus:bg-white text-gray-800 text-sm font-bold tracking-wide"
                  placeholder="Query Archives (Model/SN)..."
                />
              </div>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="premium-input bg-gray-50 border-gray-100 text-[10px] font-black uppercase tracking-[0.3em] px-10 cursor-pointer overflow-hidden max-w-[250px] text-gray-600"
              >
                <option value="All">All Categories</option>
                <option value="Screen Protection">Screen Guard</option>
                <option value="Cases & Covers">Cases & Covers</option>
                <option value="Cables & Chargers">Chargers & Cables</option>
                <option value="Audio">Audio / Earphones</option>
                <option value="Power">Power Banks</option>
                <option value="Accessories">Accessories</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar relative z-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-40 gap-8">
                <div className="w-20 h-20 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin shadow-2xl shadow-sky-500/10"></div>
                <p className="text-[11px] font-black uppercase tracking-[0.6em] text-gray-400 animate-pulse">Synchronizing Asset Pipeline...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 pb-10">
                {filteredProducts.map(product => {
                  const selected = selectedItems.find(item => item.productId === product._id);
                  return (
                  <div
                    key={product._id}
                    className={`
                        bg-white p-8 rounded-[3rem] relative overflow-hidden group transition-all duration-700 cursor-pointer border border-gray-100
                        ${selected
                          ? 'ring-2 ring-sky-500/50 bg-sky-50 shadow-[0_20px_40px_rgba(14,165,233,0.1)] scale-[1.02]'
                          : 'hover:bg-gray-50 hover:shadow-xl hover:translate-y-[-4px] hover:border-sky-100'}
                      `}
                      onClick={() => !selected && addItem(product)}
                    >
                      <div className="absolute top-4 right-4 opacity-[0.05] pointer-events-none transform -rotate-12 transition-all duration-1000 group-hover:rotate-0 group-hover:scale-125 group-hover:opacity-[0.15]">
                         <div className="text-7xl font-black text-gray-200">{product.emoji}</div>
                      </div>

                      <div className="text-5xl mb-6 relative z-10 transform group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">{product.emoji}</div>
                      <h4 className="text-[12px] font-black uppercase tracking-widest text-gray-800 line-clamp-1 mb-2 relative z-10">{product.name}</h4>

                      <div className="flex justify-between items-center mt-auto relative z-10 pt-4 border-t border-gray-50">
                        <div>
                          <p className="text-sky-600 font-black text-lg tracking-tighter">₹{product.price.toLocaleString()}</p>
                        </div>
                        {selected ? (
                          <div className="flex items-center gap-4 bg-white rounded-[1.5rem] p-2 border border-sky-100 shadow-xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                            <button onClick={() => removeItem(product._id)} className="w-8 h-8 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"><FiMinus size={16} /></button>
                            <span className="text-sm font-black text-gray-900 w-5 text-center">{selected.qty}</span>
                            <button onClick={() => addItem(product)} className="w-8 h-8 flex items-center justify-center text-sky-500 hover:bg-sky-50 rounded-xl transition-all active:scale-90"><FiPlus size={16} /></button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${product.stock <= 5 ? 'bg-rose-50 text-rose-500 border-rose-100 animate-pulse' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                              Vol: {product.stock}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {!loading && filteredProducts.length === 0 && (
              <div className="py-40 text-center">
                 <FiSearch size={60} className="mx-auto text-gray-200 mb-8" />
                 <p className="text-gray-400 italic text-[11px] font-black uppercase tracking-[0.5em]">No corresponding assets found in archives</p>
              </div>
            )}
          </div>
        </div>

        {/* Engineering Services Section (Manual Provisioning) */}
        <div className="bg-white p-10 rounded-[4rem] shadow-xl relative overflow-hidden group border border-gray-100 transition-all duration-700">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-1000">
            <FiTablet size={180} />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-12 relative z-10">
            <h3 className="text-3xl font-black text-gray-900 flex items-center gap-6 tracking-tight">
              <div className="w-16 h-16 rounded-[1.5rem] bg-violet-50 flex items-center justify-center text-violet-500 text-3xl shadow-inner border border-violet-100 group-hover:rotate-[-6deg] transition-transform">
                <FiPlusCircle />
              </div>
              <div className="flex flex-col">
                <span>Add Service / Custom</span>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em] mt-1">Manual Service & Product Entry</span>
              </div>
            </h3>

            <div className="flex flex-wrap gap-4 justify-center">
              <select
                className="premium-input bg-gray-50 text-gray-600 text-[10px] py-5 px-8 focus:bg-white border-gray-100 font-black uppercase tracking-[0.4em] cursor-pointer w-full md:w-auto shadow-sm"
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
                className="bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 icon-glow text-[10px] font-black uppercase tracking-[0.4em] px-10 py-5 rounded-[1.5rem] border border-gray-100 transition-all relative overflow-hidden group/manual shadow-sm"
              >
                <div className="absolute inset-0 bg-sky-500/5 -translate-x-full group-hover/manual:translate-x-0 transition-transform duration-500"></div>
                <span className="relative z-10 flex items-center gap-3"><FiPlus /> Custom Item</span>
              </button>
            </div>
          </div>

          <div className="space-y-8 relative z-10">
            {customItems.map((item, index) => (
              <div key={index} className="bg-white p-10 rounded-[3rem] border border-gray-100 hover:border-sky-100 transition-all group/item shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
                  <div className="lg:col-span-4 space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4">Item Name / Service</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => updateCustomItem(index, 'name', e.target.value)}
                      className="premium-input w-full bg-gray-50 py-5 px-6 font-bold text-gray-800 border-gray-100 focus:bg-white"
                      placeholder="e.g. iPhone Screen Replacement"
                    />
                  </div>
                  <div className="lg:col-span-3 space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4">IMEI / Serial No.</label>
                    <input
                      type="text"
                      value={item.imei || ''}
                      onChange={e => updateCustomItem(index, 'imei', e.target.value)}
                      className="premium-input w-full bg-gray-50 py-5 px-6 font-mono text-[11px] font-bold text-sky-600 tracking-tighter border-gray-100 focus:bg-white"
                      placeholder="IMEI Number"
                    />
                  </div>
                  <div className="lg:col-span-2 space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4">Price (₹)</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-[10px] font-black">₹</span>
                       <input
                        type="number"
                        value={item.price}
                        onChange={e => updateCustomItem(index, 'price', parseFloat(e.target.value) || 0)}
                        className="premium-input w-full bg-gray-50 py-5 pl-8 pr-4 text-emerald-600 font-extrabold text-sm border-gray-100 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-2 space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4">Warranty</label>
                    <input
                      type="text"
                      value={item.warranty}
                      onChange={e => updateCustomItem(index, 'warranty', e.target.value)}
                      className="premium-input w-full bg-gray-50 py-5 px-6 font-black text-[9px] uppercase tracking-widest text-gray-500 border-gray-100 focus:bg-white"
                      placeholder="e.g. 6 Months"
                    />
                  </div>
                  <div className="lg:col-span-1 flex justify-center pb-2">
                     <button
                      onClick={() => removeCustomItem(index)}
                      className="w-14 h-14 flex items-center justify-center bg-rose-50 text-rose-500/50 hover:text-rose-500 hover:bg-rose-100 rounded-2xl transition-all border border-rose-100 active:scale-90"
                    >
                      <FiTrash2 size={22} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {customItems.length === 0 && (
              <div className="text-center py-24 rounded-[3.5rem] border-2 border-dashed border-gray-100 bg-gray-50/50">
                 <FiPlusCircle size={40} className="mx-auto text-gray-200 mb-6" />
                 <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.5em] italic">Zero Engineering Provisions Documented</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="manifest-summary" className="xl:col-span-4 xl:max-h-[calc(100vh-100px)] xl:sticky top-10">
        <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col xl:h-full border border-gray-100">
          <div className="p-10 bg-gray-50 border-b border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-5 uppercase tracking-tight">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500 text-2xl shadow-inner border border-sky-100">
                 <FiShoppingBag />
              </div>
              Order Summary
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="pb-6 text-[10px] font-black uppercase tracking-[0.5em] px-3">Subject</th>
                  <th className="pb-6 text-[10px] font-black uppercase tracking-[0.5em] text-center">Vol</th>
                  <th className="pb-6 text-[10px] font-black uppercase tracking-[0.5em] text-right px-3">Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...selectedItems, ...customItems].map((item, i) => (
                  <tr key={i} className="group hover:bg-gray-50 transition-all">
                    <td className="py-8 px-3 text-left">
                      <p className="font-black text-gray-800 text-xs truncate max-w-[150px] uppercase tracking-widest">{item.name}</p>
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center gap-2">
                           <FiCpu size={10} className="text-sky-400" />
                           <input
                              type="text"
                              value={item.imei || ''}
                              placeholder="IMEI / Serial"
                              onChange={(e) => {
                                if (item.productId) {
                                  setSelectedItems(prev => prev.map(si => si.productId === item.productId ? { ...si, imei: e.target.value } : si));
                                } else {
                                  updateCustomItem(i - selectedItems.length, 'imei', e.target.value);
                                }
                              }}
                              className="bg-sky-50 border-none text-[9px] px-2 py-0.5 rounded text-sky-600 focus:ring-0 w-32 font-mono font-bold"
                           />
                        </div>
                        <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                          <FiShield size={10} className="text-gray-400" />
                          <input
                            type="text"
                            value={item.warranty || 'No Warranty'}
                            onChange={(e) => updateItemWarranty(item.productId || (i - selectedItems.length), e.target.value, !item.productId)}
                            className="bg-transparent border-none text-[9px] p-0 text-gray-400 focus:ring-0 w-32 font-black uppercase tracking-widest"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-8 font-black text-center text-gray-400 text-xs">x{item.qty}</td>
                    <td className="py-8 font-black text-gray-900 text-right px-3 text-base tracking-tighter">₹{item.total.toLocaleString()}</td>
                  </tr>
                ))}
                {(selectedItems.length === 0 && customItems.length === 0) && (
                  <tr>
                    <td colSpan="3" className="py-32 text-center">
                       <FiShoppingBag size={60} className="mx-auto text-gray-100 mb-8" />
                       <p className="text-gray-300 italic text-[11px] font-black uppercase tracking-[0.6em]">Zero Entries Detected</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-12 bg-gray-50 space-y-10 border-t border-gray-100">
            <div className="space-y-6">
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.5em] text-gray-400">
                <span>Total Items Cost</span>
                <span className="text-gray-700 text-lg font-black tracking-tighter">₹{totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between gap-10">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                   <span className="text-[11px] font-black uppercase tracking-[0.5em] text-rose-500">Discount Amount</span>
                </div>
                <div className="relative group/disc">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 text-xs font-black">₹</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-36 premium-input bg-white py-4 pl-10 pr-6 text-right text-lg text-rose-500 font-extrabold border-rose-100 focus:bg-white focus:border-rose-300 transition-all rounded-[1.5rem]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-100 relative w-full group/total">
              <p className="text-[11px] text-sky-500 font-black uppercase tracking-[0.5em] mb-4 relative z-10 flex items-center gap-3">
                 <span className="w-8 h-[1px] bg-sky-200"></span>
                 FINAL TOTAL AMOUNT
              </p>
              <div className="flex items-end text-gray-900 relative z-10 w-full px-2">
                <span className="text-4xl font-black text-gray-200 mr-4 mb-2">₹</span>
                <input
                  type="number"
                  value={totals.total}
                  onChange={e => setManualTotal(parseFloat(e.target.value) || 0)}
                  className="bg-transparent border-none text-7xl font-black text-sky-600 focus:ring-0 p-0 w-full hover:bg-gray-100 rounded-3xl transition-all cursor-text tracking-tighter"
                />
                <div className="absolute right-4 bottom-4 w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.5)] animate-pulse"></div>
              </div>
            </div>

            <div className="flex justify-between items-center relative z-10">
              <button
                onClick={clearBill}
                className="text-[10px] font-black text-gray-400 hover:text-rose-500 transition-all uppercase tracking-[0.5em] hover:scale-105 active:scale-90 flex items-center gap-3"
              >
                <FiTrash2 /> Clear All Fields
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5 pt-4">
              <button
                onClick={() => handleCreateBill('pdf')}
                disabled={saving}
                className="bg-sky-50 hover:bg-sky-100 border border-sky-100 p-6 rounded-[2rem] flex flex-col items-center gap-3 group transition-all active:scale-95 shadow-md"
              >
                <FiDownload className="text-sky-500 group-hover:scale-110 transition-transform duration-500" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest text-sky-700">Download PDF</span>
              </button>
              <button
                onClick={() => handleCreateBill('whatsapp')}
                disabled={saving}
                className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 p-6 rounded-[2rem] flex flex-col items-center gap-3 group transition-all active:scale-95 shadow-md"
              >
                <FiNavigation className="text-emerald-500 group-hover:scale-110 rotate-45 transition-transform duration-500" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">WhatsApp Bill</span>
              </button>
              <button
                onClick={() => handleCreateBill('share')}
                disabled={saving}
                className="col-span-1 bg-gray-50 hover:bg-gray-100 border border-gray-100 p-6 rounded-[2rem] flex flex-col items-center gap-3 group transition-all active:scale-95 shadow-md"
              >
                <FiShare2 className="text-indigo-500 group-hover:scale-110 transition-transform duration-500" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Share Bill</span>
              </button>
              <button
                onClick={() => handleCreateBill('view')}
                disabled={saving}
                className="col-span-1 bg-gray-50 hover:bg-gray-100 border border-gray-100 p-6 rounded-[2rem] flex flex-col items-center gap-3 group transition-all active:scale-95 shadow-md"
              >
                <FiExternalLink className="text-sky-500 group-hover:scale-110 transition-transform duration-500" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Online Link</span>
              </button>
              <button
                onClick={() => handleCreateBill('preview')}
                disabled={saving}
                className="col-span-2 bg-gradient-to-r from-sky-600 to-sky-400 text-white py-8 rounded-[3rem] flex items-center justify-center gap-6 font-black text-base uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(14,165,233,0.3)] active:scale-95 transition-all overflow-hidden relative group/authorize"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/authorize:animate-shimmer opacity-0 group-hover/authorize:opacity-100 transition-opacity"></div>
                {saving ? (
                  <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FiCheck size={28} className="group-hover/authorize:scale-125 transition-transform" />
                    <span>Save Bill</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Summary Hub */}
      <div className="xl:hidden fixed bottom-[110px] left-0 right-0 z-[90] px-6 animate-in slide-in-from-bottom-10 duration-700">
         <div className="bg-white/90 p-6 rounded-[2.5rem] backdrop-blur-3xl border border-sky-100 shadow-[0_20px_50px_rgba(14,165,233,0.1)] flex items-center justify-between">
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Aggregate Total</span>
               <div className="flex items-baseline gap-2">
                  <span className="text-sky-500 font-black text-sm">₹</span>
                  <span className="text-2xl font-black text-gray-900 tracking-tighter">{totals.total.toLocaleString()}</span>
               </div>
            </div>
            <button
               onClick={() => {
                  const summaryElement = document.getElementById('manifest-summary');
                  if (summaryElement) summaryElement.scrollIntoView({ behavior: 'smooth' });
               }}
               className="bg-sky-500 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-3 text-[10px] uppercase tracking-widest shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
            >
               <FiShoppingBag /> View Manifest
            </button>
         </div>
      </div>
    </div>
  );
};

export default BillingPage;
