import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight,
  FiBox, FiTag, FiDollarSign, FiTruck, FiHash, FiUpload, FiFilter, FiShield, FiActivity
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', emoji: '📦', category: 'Accessories',
    price: 0, costPrice: 0, stock: 0, 
    minStockAlert: 5, supplier: '', sku: '', 
    description: '', status: 'active', warranty: 'No Warranty'
  });

  useEffect(() => {
    fetchProducts();
  }, [search, statusFilter, categoryFilter]);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`/products?search=${search}&status=${statusFilter}&category=${categoryFilter}`);
      setProducts(data);
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (p = null) => {
    if (p) {
      setEditingId(p._id);
      setFormData({ ...p });
    } else {
      setEditingId(null);
      setFormData({
        name: '', emoji: '📦', category: 'Accessories',
        price: 0, costPrice: 0, stock: 0, 
        minStockAlert: 5, supplier: '', sku: '', 
        description: '', status: 'active', warranty: 'No Warranty'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/products/${editingId}`, formData);
        toast.success('Product updated');
      } else {
        await axios.post('/products', formData);
        toast.success('Product created');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.put(`/products/${id}/toggle`);
      toast.success('Status toggled');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Uploading products...');
    try {
      const { data } = await axios.post('/products/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(data.message || 'Bulk upload successful', { id: toastId });
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk upload failed', { id: toastId });
    }
    e.target.value = null;
  };

  return (
    <div className="space-y-10 animate-slide-up font-outfit">
      {/* Search and Control Hub */}
      <div className="glass-panel p-10 lg:p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group border-white/[0.03]">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700">
           <FiBox size={180} />
        </div>
        
        <div className="flex flex-col xl:flex-row gap-10 items-center justify-between relative z-10">
          <div className="flex flex-col md:flex-row gap-6 flex-1 w-full">
            <div className="relative flex-1 group/search">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-sky-400 transition-colors duration-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="premium-input w-full pl-16 py-5 bg-slate-950/40 border-slate-800 focus:bg-slate-950/60 text-sm font-bold tracking-wide"
                placeholder="Locate Assets (Name/SKU/Code)..."
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="premium-input bg-slate-950/40 border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] px-8 cursor-pointer hover:bg-slate-950/60 transition-all focus:ring-1 ring-sky-500/20"
              >
                <option value="All">Operational Status: All</option>
                <option value="active">Active Stream</option>
                <option value="inactive">Suspended</option>
              </select>
              
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="premium-input bg-slate-950/40 border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] px-8 cursor-pointer hover:bg-slate-950/60 transition-all focus:ring-1 ring-sky-500/20"
              >
                <option value="All">Segment: All</option>
                <option value="Screen Protection">Optic Defense</option>
                <option value="Cases & Covers">Armor System</option>
                <option value="Audio">Acoustic Logic</option>
                <option value="Cables & Chargers">Energy Flow</option>
                <option value="Power">Core Power</option>
                <option value="Accessories">Extras</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full xl:w-auto">
            <input 
              type="file" 
              id="bulkUpload" 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
              onChange={handleBulkUpload} 
            />
            <button 
              onClick={() => document.getElementById('bulkUpload').click()}
              className="flex-1 xl:flex-none bg-white/[0.03] border border-white/10 text-slate-400 font-black px-10 py-5 rounded-[2rem] flex items-center justify-center gap-4 transition-all hover:bg-white/[0.08] hover:text-white uppercase tracking-[0.3em] text-[10px] group/bulk"
            >
              <FiUpload size={22} className="text-sky-500 group-hover:-translate-y-1 transition-transform" /> 
              Bulk Relay
            </button>

            <button 
              onClick={() => handleOpenModal()}
              className="flex-1 xl:flex-none bg-sky-500 text-white font-black px-12 py-5 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(14,165,233,0.4)] flex items-center justify-center gap-4 transition-all active:scale-[0.98] uppercase tracking-[0.3em] text-[10px] relative overflow-hidden group/add"
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/add:animate-shimmer"></div>
              <FiPlus size={24} className="group-hover/add:rotate-90 transition-transform" /> 
              Initiate Asset
            </button>
          </div>
        </div>
      </div>

      {/* Asset Repository Table */}
      <div className="glass-panel border-white/[0.03] rounded-[4rem] shadow-2xl overflow-hidden relative group bg-white/[0.01]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">
                <th className="px-12 py-10">Specification Portfolio</th>
                <th className="px-12 py-10">Sector Branch</th>
                <th className="px-12 py-10 text-right">Settlement Unit</th>
                <th className="px-12 py-10 text-center">Volume Status</th>
                <th className="px-12 py-10 text-center">Operational</th>
                <th className="px-12 py-10 text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-white/[0.02] transition-all group/row">
                  <td className="px-12 py-8 flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-slate-900/60 border border-white/[0.05] flex items-center justify-center text-5xl group-hover/row:scale-110 transition-all duration-700 shadow-inner group-hover/row:rotate-3">
                      {p.emoji}
                    </div>
                    <div>
                      <p className="font-black text-slate-200 text-base tracking-wide uppercase">{p.name}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[9px] font-mono text-sky-500 bg-sky-500/5 px-2.5 py-1 rounded-md border border-sky-500/10 font-black tracking-widest uppercase">SKU: {p.sku || 'ABSENT'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-8">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/[0.03] text-slate-400 border border-white/[0.05] px-5 py-2.5 rounded-[1.5rem] group-hover/row:bg-sky-500/10 group-hover/row:text-sky-400 transition-colors">{p.category}</span>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <p className="font-black text-white text-xl tracking-tight">₹{p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mt-1.5 opacity-60 group-hover/row:opacity-100 transition-opacity">Basis: ₹{p.costPrice}</p>
                  </td>
                  <td className="px-12 py-8">
                    <div className="flex flex-col items-center gap-3">
                       <div className="flex items-center gap-4 bg-slate-950/40 px-5 py-2.5 rounded-[2rem] border border-white/[0.03]">
                          <div className={`w-2.5 h-2.5 rounded-full ${p.stock <= p.minStockAlert ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}></div>
                          <span className={`font-black text-base ${p.stock <= p.minStockAlert ? 'text-rose-500' : 'text-slate-300'}`}>{p.stock}</span>
                       </div>
                       {p.stock <= p.minStockAlert && <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.4em] animate-pulse">Critical Depletion</span>}
                    </div>
                  </td>
                  <td className="px-12 py-8 text-center">
                    <button 
                      onClick={() => toggleStatus(p._id)}
                      className={`text-5xl transition-all duration-700 transform hover:scale-110 ${p.status === 'active' ? 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-900 group-hover/row:text-slate-800'}`}
                    >
                      {p.status === 'active' ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <div className="flex items-center justify-end gap-4 opacity-0 group-hover/row:opacity-100 transition-all transform translate-x-4 group-hover/row:translate-x-0">
                      <button 
                        onClick={() => handleOpenModal(p)}
                        className="w-12 h-12 flex items-center justify-center rounded-[1.5rem] bg-white/[0.03] text-slate-500 hover:text-sky-400 hover:bg-sky-400/10 transition-all border border-transparent hover:border-sky-500/10 active:scale-95"
                      >
                        <FiEdit2 size={20} />
                      </button>
                      <button 
                        onClick={() => deleteProduct(p._id)}
                        className="w-12 h-12 flex items-center justify-center rounded-[1.5rem] bg-rose-500/5 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/10 active:scale-95"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && products.length === 0 && (
            <div className="py-40 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm -z-10"></div>
               <FiPackage size={80} className="mx-auto text-slate-800 mb-8 opacity-20" />
               <p className="text-slate-700 italic text-[12px] font-black uppercase tracking-[0.6em]">Zero Operational Assets Identified in Repository</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Redesigned Modal with Ultra-Premium Look */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-slate-950/60 animate-in fade-in duration-500">
          <div className="glass-panel border-white/10 w-full max-w-3xl rounded-[4rem] shadow-[0_0_150px_rgba(0,0,0,0.7)] overflow-hidden animate-slide-up relative">
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${editingId ? 'from-sky-600 to-sky-400' : 'from-emerald-600 to-emerald-400'}`}></div>
            
            <div className="p-12 border-b border-white/[0.03] flex items-center justify-between bg-white/[0.01]">
              <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-6">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-inner border transition-all duration-700 ${editingId ? 'bg-sky-500/10 text-sky-500 border-sky-500/10' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10'}`}>
                   {editingId ? <FiEdit2 /> : <FiPlus />}
                </div>
                <div className="flex flex-col">
                  <span className="leading-none mb-1">{editingId ? 'Refine Asset' : 'Register Asset'}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Core Repository Entry</span>
                </div>
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-14 h-14 rounded-2xl bg-white/[0.03] text-slate-600 hover:text-white flex items-center justify-center transition-all hover:rotate-90 text-3xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-12 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-4">Architecture Designation</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="premium-input w-full py-5 px-8"
                  placeholder="Asset Full Name"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-4">Visual Iconography</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={e => setFormData({ ...formData, emoji: e.target.value })}
                    className="premium-input w-24 text-center text-3xl py-4"
                  />
                  <div className="flex-1 text-[9px] text-slate-500 font-bold uppercase py-2 leading-relaxed italic">
                    Use standard OS symbols <br/>for identified asset.
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-4">Sector branch</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="premium-input w-full py-5 px-8 font-black uppercase tracking-[0.2em] text-xs cursor-pointer"
                >
                  <option>Screen Protection</option>
                  <option>Cases & Covers</option>
                  <option>Cables & Chargers</option>
                  <option>Audio</option>
                  <option>Power</option>
                  <option>Accessories</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-4">Unified SKU Code</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={e => setFormData({ ...formData, sku: e.target.value })}
                  className="premium-input w-full font-mono font-bold py-5 px-8"
                  placeholder="ID_GEN_SYSTEM_000"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-4">Settlement Valuation (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="premium-input w-full text-white font-black text-xl py-5 px-8 bg-sky-500/5 focus:bg-sky-500/10 border-sky-500/20"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-4">Archive Cost (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.costPrice}
                  onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  className="premium-input w-full text-slate-600 font-bold py-5 px-8"
                />
              </div>

              <div className="space-y-4 text-center">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Current Volume</label>
                <div className="flex items-center gap-6 justify-center bg-slate-950/40 p-4 rounded-[2.5rem] border border-white/[0.03]">
                  <button type="button" onClick={() => setFormData({...formData, stock: Math.max(0, formData.stock - 1)})} className="w-12 h-12 rounded-[1.2rem] bg-white/[0.03] hover:bg-white/[0.08] transition-all flex items-center justify-center text-slate-400 group/btn"><FiMinus /></button>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="bg-transparent border-none text-3xl font-black text-white w-20 text-center focus:ring-0 p-0"
                  />
                  <button type="button" onClick={() => setFormData({...formData, stock: formData.stock + 1})} className="w-12 h-12 rounded-[1.2rem] bg-white/[0.03] hover:bg-white/[0.08] transition-all flex items-center justify-center text-slate-400 group/btn"><FiPlus /></button>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-4">Depletion Alert Node</label>
                <input
                  type="number"
                  value={formData.minStockAlert}
                  onChange={e => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 5 })}
                  className="premium-input w-full py-5 px-8 text-rose-500/60 font-black"
                />
              </div>

              <div className="col-span-1 md:col-span-2 space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 ml-4">Assurance commitment Protocol</label>
                <input
                  type="text"
                  value={formData.warranty}
                  onChange={e => setFormData({ ...formData, warranty: e.target.value })}
                  className="premium-input w-full py-5 px-8 text-sky-400 font-bold"
                  placeholder="Temporal Guard Terms"
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex gap-8 pt-10">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-6 rounded-[2.5rem] text-xs font-black text-slate-600 hover:text-slate-300 transition-all uppercase tracking-[0.4em] border border-white/[0.03] hover:bg-white/[0.02]"
                >
                  Terminate
                </button>
                <button 
                  type="submit" 
                  className={`flex-[2] py-6 rounded-[2.5rem] font-black active:scale-95 transition-all text-sm uppercase tracking-[0.5em] relative overflow-hidden group/final shadow-2xl ${editingId ? 'bg-sky-500 text-white shadow-sky-500/30' : 'bg-emerald-500 text-white shadow-emerald-500/30'}`}
                >
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/final:animate-shimmer"></div>
                  {editingId ? 'Modify Record' : 'Commit Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FiMinus = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
);

export default ProductsPage;
