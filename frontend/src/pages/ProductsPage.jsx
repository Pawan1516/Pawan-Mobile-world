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
      <div className="bg-white p-10 lg:p-12 rounded-[4rem] shadow-xl relative overflow-hidden group border border-gray-100 hover:bg-gray-50/50 transition-all duration-1000">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700">
           <FiBox size={180} />
        </div>
        
        <div className="flex flex-col xl:flex-row gap-10 items-center justify-between relative z-10">
          <div className="flex flex-col md:flex-row gap-6 flex-1 w-full">
            <div className="relative flex-1 group/search">
              <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-sky-500 transition-colors duration-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="premium-input w-full pl-16 py-5 bg-gray-50 border-gray-100 focus:bg-white text-gray-800 text-sm font-bold tracking-wide"
                placeholder="Search Products (Name/SKU)..."
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="premium-input bg-gray-50 border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] px-8 cursor-pointer hover:bg-white transition-all text-gray-600"
              >
                <option value="All">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="premium-input bg-gray-50 border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] px-8 cursor-pointer hover:bg-white transition-all text-gray-600"
              >
                <option value="All">All Categories</option>
                <option value="Screen Protection">Screen Guard</option>
                <option value="Cases & Covers">Cases & Covers</option>
                <option value="Audio">Earphones / Audio</option>
                <option value="Cables & Chargers">Chargers & Cables</option>
                <option value="Power">Power Banks</option>
                <option value="Accessories">Accessories</option>
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
              className="flex-1 xl:flex-none bg-gray-50 border border-gray-100 text-gray-400 font-black px-10 py-5 rounded-[2rem] flex items-center justify-center gap-4 transition-all hover:bg-white hover:text-gray-900 uppercase tracking-[0.3em] text-[10px] group/bulk shadow-sm"
            >
              <FiUpload size={22} className="text-sky-500 group-hover:-translate-y-1 transition-transform" /> 
              Bulk Upload
            </button>

            <button 
              onClick={() => handleOpenModal()}
              className="flex-1 xl:flex-none bg-sky-500 text-white font-black px-12 py-5 rounded-[2rem] shadow-[0_20px_40px_rgba(14,165,233,0.3)] flex items-center justify-center gap-4 transition-all active:scale-[0.98] uppercase tracking-[0.3em] text-[10px] relative overflow-hidden group/add"
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/add:animate-shimmer"></div>
              <FiPlus size={24} className="group-hover/add:rotate-90 transition-transform" /> 
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Asset Repository Table */}
      <div className="bg-white border border-gray-100 rounded-[4rem] shadow-xl overflow-hidden relative group transition-all duration-700">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[9px] text-gray-400 font-black uppercase tracking-[0.4em]">
                <th className="px-6 md:px-12 py-6">Product Details</th>
                <th className="hidden lg:table-cell px-12 py-10">Category</th>
                <th className="px-6 md:px-12 py-6 text-right">Selling Price</th>
                <th className="px-6 md:px-12 py-6 text-center">Stock</th>
                <th className="hidden sm:table-cell px-12 py-10 text-center">Status</th>
                <th className="px-6 md:px-12 py-6 text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-all group/row">
                  <td className="px-6 md:px-12 py-6 flex items-center gap-4 md:gap-8">
                    <div className="w-12 h-12 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2.5rem] bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl md:text-5xl group-hover/row:scale-110 transition-all duration-700 shadow-inner group-hover/row:rotate-3 shadow-gray-200">
                      {p.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-gray-800 text-xs md:text-base tracking-wide uppercase truncate max-w-[120px] md:max-w-none">{p.name}</p>
                      <div className="flex items-center gap-3 mt-1 md:mt-2">
                        <span className="text-[8px] md:text-[9px] font-mono text-sky-600 bg-sky-50 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md border border-sky-100 font-black tracking-widest uppercase truncate max-w-[80px] md:max-w-none">SKU: {p.sku || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-12 py-8">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400 border border-gray-100 px-5 py-2.5 rounded-[1.5rem] group-hover/row:bg-sky-50 group-hover/row:text-sky-600 transition-colors uppercase">{p.category}</span>
                  </td>
                  <td className="px-6 md:px-12 py-6 text-right">
                    <p className="font-black text-gray-900 text-base md:text-xl tracking-tight">₹{p.price.toLocaleString()}</p>
                    <p className="hidden md:block text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1.5 opacity-60 group-hover/row:opacity-100 transition-opacity">Basis: ₹{p.costPrice}</p>
                  </td>
                  <td className="px-6 md:px-12 py-6">
                    <div className="flex flex-col items-center gap-2 md:gap-3">
                       <div className="flex items-center gap-3 md:gap-4 bg-gray-50 px-3 py-1.5 md:px-5 md:py-2.5 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-inner">
                          <div className={`w-2 md:w-2.5 h-2 md:h-2.5 rounded-full ${p.stock <= p.minStockAlert ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}></div>
                          <span className={`font-black text-xs md:text-base ${p.stock <= p.minStockAlert ? 'text-rose-500' : 'text-gray-700'}`}>{p.stock}</span>
                       </div>
                       {p.stock <= p.minStockAlert && <span className="hidden md:block text-[9px] font-black text-rose-500 uppercase tracking-[0.4em] animate-pulse">Critical</span>}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-12 py-8 text-center">
                    <button 
                      onClick={() => toggleStatus(p._id)}
                      className={`text-3xl md:text-5xl transition-all duration-700 transform hover:scale-110 ${p.status === 'active' ? 'text-emerald-500 drop-shadow-md' : 'text-gray-200 hover:text-gray-300'}`}
                    >
                      {p.status === 'active' ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                  </td>
                  <td className="px-6 md:px-12 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 md:gap-4 group-hover/row:translate-x-0">
                      <button 
                        onClick={() => handleOpenModal(p)}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-[1.5rem] bg-gray-50 text-gray-400 hover:text-sky-500 hover:bg-sky-50 transition-all border border-transparent hover:border-sky-100 active:scale-95"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteProduct(p._id)}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-[1.5rem] bg-rose-50 text-rose-300 hover:text-rose-500 hover:bg-rose-100 transition-all border border-transparent hover:border-rose-100 active:scale-95"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && products.length === 0 && (
            <div className="py-40 text-center relative overflow-hidden bg-gray-50">
               <FiPackage size={80} className="mx-auto text-gray-200 mb-8" />
               <p className="text-gray-400 italic text-[12px] font-black uppercase tracking-[0.6em]">Zero Operational Assets Identified in Repository</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Redesigned Modal with Ultra-Premium Look */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-white/30 animate-in fade-in duration-500">
          <div className="bg-white border border-gray-100 w-full max-w-3xl rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden animate-slide-up relative">
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${editingId ? 'from-sky-600 to-sky-400' : 'from-emerald-600 to-emerald-400'}`}></div>
            
            <div className="p-12 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
              <h3 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-6">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-inner border transition-all duration-700 ${editingId ? 'bg-sky-50 text-sky-500 border-sky-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
                   {editingId ? <FiEdit2 /> : <FiPlus />}
                </div>
                <div className="flex flex-col">
                  <span className="leading-none mb-1">{editingId ? 'Edit Product' : 'Add New Product'}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Inventory Management</span>
                </div>
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 hover:text-gray-900 flex items-center justify-center transition-all hover:rotate-90 text-3xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-12 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="premium-input w-full py-5 px-8 bg-gray-50 border-gray-100 text-gray-900 font-bold"
                  placeholder="e.g. iPhone 15 Case"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Visual Iconography</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={e => setFormData({ ...formData, emoji: e.target.value })}
                    className="premium-input w-24 text-center text-3xl py-4 bg-gray-50 border-gray-100"
                  />
                  <div className="flex-1 text-[9px] text-gray-400 font-bold uppercase py-2 leading-relaxed italic">
                    Select an emoji to <br/>represent this item.
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="premium-input w-full py-5 px-8 font-black uppercase tracking-[0.2em] text-xs cursor-pointer bg-gray-50 border-gray-100 text-gray-700"
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
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Unified SKU Code</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={e => setFormData({ ...formData, sku: e.target.value })}
                  className="premium-input w-full font-mono font-bold py-5 px-8 bg-gray-50 border-gray-100 text-sky-600"
                  placeholder="ID_GEN_SYSTEM_000"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Selling Price (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="premium-input w-full text-gray-900 font-black text-xl py-5 px-8 bg-sky-50 border-sky-100"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Purchase Cost (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.costPrice}
                  onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  className="premium-input w-full text-gray-600 font-bold py-5 px-8 bg-gray-50 border-gray-100"
                />
              </div>

              <div className="space-y-4 text-center">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Current Volume</label>
                <div className="flex items-center gap-6 justify-center bg-gray-50 p-4 rounded-[2.5rem] border border-gray-100 shadow-inner">
                  <button type="button" onClick={() => setFormData({...formData, stock: Math.max(0, formData.stock - 1)})} className="w-12 h-12 rounded-[1.2rem] bg-white border border-gray-100 hover:bg-gray-100 transition-all flex items-center justify-center text-gray-400 group/btn"><FiMinus /></button>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="bg-transparent border-none text-3xl font-black text-gray-900 w-20 text-center focus:ring-0 p-0"
                  />
                  <button type="button" onClick={() => setFormData({...formData, stock: formData.stock + 1})} className="w-12 h-12 rounded-[1.2rem] bg-white border border-gray-100 hover:bg-gray-100 transition-all flex items-center justify-center text-gray-400 group/btn"><FiPlus /></button>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Depletion Alert Node</label>
                <input
                  type="number"
                  value={formData.minStockAlert}
                  onChange={e => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 5 })}
                  className="premium-input w-full py-5 px-8 text-rose-500 font-black bg-gray-50 border-gray-100"
                />
              </div>

              <div className="col-span-1 md:col-span-2 space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Assurance commitment Protocol</label>
                <input
                  type="text"
                  value={formData.warranty}
                  onChange={e => setFormData({ ...formData, warranty: e.target.value })}
                  className="premium-input w-full py-5 px-8 text-sky-600 font-bold bg-gray-50 border-gray-100"
                  placeholder="Temporal Guard Terms"
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex gap-8 pt-10">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-6 rounded-[2.5rem] text-xs font-black text-gray-400 hover:text-gray-900 transition-all uppercase tracking-[0.4em] border border-gray-100 hover:bg-gray-50"
                >
                  Terminate
                </button>
                <button 
                  type="submit" 
                  className={`flex-[2] py-6 rounded-[2.5rem] font-black active:scale-95 transition-all text-sm uppercase tracking-[0.5em] relative overflow-hidden group/final shadow-lg ${editingId ? 'bg-sky-500 text-white shadow-sky-500/30' : 'bg-emerald-500 text-white shadow-emerald-500/30'}`}
                >
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/final:animate-shimmer"></div>
                  {editingId ? 'Update Product' : 'Save Product'}
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
