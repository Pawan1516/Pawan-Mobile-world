import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight,
  FiBox, FiTag, FiDollarSign, FiTruck, FiHash, FiUpload
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

  // Form State
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
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-[#121d30] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1 w-full md:w-auto">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#00d4ff]/50"
              placeholder="Search by name, SKU..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50 text-sm"
          >
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50 text-sm"
          >
            <option value="All">All Categories</option>
            <option value="Screen Protection">Screen Protection</option>
            <option value="Cases & Covers">Cases & Covers</option>
            <option value="Audio">Audio</option>
            <option value="Cables & Chargers">Cables & Chargers</option>
            <option value="Power">Power</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            id="bulkUpload" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            onChange={handleBulkUpload} 
          />
          <button 
            onClick={() => document.getElementById('bulkUpload').click()}
            className="bg-white/5 border border-white/10 text-white font-black px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap hover:bg-[#00d4ff]/10 hover:border-[#00d4ff]/50 hover:text-[#00d4ff]"
          >
            <FiUpload size={20} /> BULK UPLOAD
          </button>

          <button 
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-[#004aaa] to-[#00d4ff] text-white font-black px-6 py-3 rounded-2xl shadow-xl shadow-[#00d4ff]/20 flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
          >
            <FiPlus size={20} /> ADD PRODUCT
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#121d30] border border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Product</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5">Stock</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-5 flex items-center gap-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{p.emoji}</span>
                    <div>
                      <p className="font-bold text-white/80">{p.name}</p>
                      <p className="text-[10px] font-mono text-white/20 mt-1 uppercase tracking-tighter">SKU: {p.sku || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs bg-white/5 px-3 py-1.5 rounded-full text-white/40">{p.category}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-black text-white">₹{p.price}</p>
                    <p className="text-[10px] text-white/20">Cost: ₹{p.costPrice}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${p.stock <= p.minStockAlert ? 'bg-red-500 animate-pulse' : 'bg-[#00e676]'}`}></span>
                       <span className={`font-black ${p.stock <= p.minStockAlert ? 'text-red-500' : 'text-white/80'}`}>{p.stock}</span>
                       {p.stock <= p.minStockAlert && <span className="text-[9px] font-black text-red-500/50 uppercase">Low</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => toggleStatus(p._id)}
                      className={`text-2xl transition-all ${p.status === 'active' ? 'text-[#00e676]' : 'text-white/10'}`}
                    >
                      {p.status === 'active' ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(p)}
                        className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all border border-transparent hover:border-[#00d4ff]/20"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteProduct(p._id)}
                        className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && products.length === 0 && (
            <div className="py-20 text-center text-white/10 italic text-sm font-medium uppercase tracking-widest">No products found matching filters</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className="bg-[#121d30] border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                {editingId ? <FiEdit2 className="text-[#00d4ff]" /> : <FiPlus className="text-[#00e676]" />}
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-white/5 text-white/40 hover:text-white flex items-center justify-center transition-colors">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-6">
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                  placeholder="E.g. Matte Glass"
                />
              </div>
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">Emoji Icon</label>
                <input
                  type="text"
                  value={formData.emoji}
                  onChange={e => setFormData({ ...formData, emoji: e.target.value })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                  placeholder="📦"
                />
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
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
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">SKU / Barcode</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={e => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                  placeholder="PROD101"
                />
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">Selling Price (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                />
              </div>
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">Cost Price (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.costPrice}
                  onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                />
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">Initial Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                />
              </div>
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">Min Stock Alert</label>
                <input
                  type="number"
                  value={formData.minStockAlert}
                  onChange={e => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 5 })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                />
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">Default Warranty</label>
                <input
                  type="text"
                  value={formData.warranty}
                  onChange={e => setFormData({ ...formData, warranty: e.target.value })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                  placeholder="E.g. 1 Year"
                />
              </div>

              <div className="col-span-2 flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-2xl text-sm font-bold text-white/40 hover:text-white transition-colors">CANCEL</button>
                <button type="submit" className="bg-gradient-to-r from-[#004aaa] to-[#00d4ff] text-white px-10 py-3 rounded-2xl font-black shadow-xl shadow-[#00d4ff]/20 active:scale-95 transition-all">
                  {editingId ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
