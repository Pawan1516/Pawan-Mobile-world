import { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
  FiSettings, FiSmartphone, FiMapPin, FiPhone, FiCreditCard, 
  FiLayout, FiToggleLeft, FiToggleRight, FiPlus, FiTrash2, FiUser
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { isAdmin } = useContext(AuthContext);
  const [settings, setSettings] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [services, setServices] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [userFormData, setUserFormData] = useState({
    id: null, name: '', username: '', password: '', role: 'staff'
  });
  const [serviceFormData, setServiceFormData] = useState({
    id: null, name: '', price: 0, costPrice: 0, warranty: 'No Warranty', category: 'Repair'
  });

  useEffect(() => {
    fetchSettings();
    if (isAdmin()) {
      fetchUsers();
      fetchServices();
    }
  }, [isAdmin]);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/settings');
      setSettings(data);
    } catch (err) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/auth/users');
      setUsers(data);
    } catch (err) {
      toast.error('Failed to fetch users');
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

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/settings', settings);
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenUserModal = (user = null) => {
    if (user) {
      setUserFormData({
        id: user._id,
        name: user.name,
        username: user.username,
        password: '',
        role: user.role
      });
    } else {
      setUserFormData({ id: null, name: '', username: '', password: '', role: 'staff' });
    }
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const { id, name, username, password, role } = userFormData;

    try {
      if (id) {
        const payload = { name, username, role };
        if (password) payload.password = password; // only send if changing
        await axios.put(`/auth/users/${id}`, payload);
        toast.success('User updated!');
      } else {
        if (!password) {
          toast.error('Password is required for new user');
          return;
        }
        await axios.post('/auth/users', { name, username, password, role });
        toast.success('User created!');
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`/auth/users/${id}`);
      toast.success('User removed');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleOpenServiceModal = (service = null) => {
    if (service) {
      setServiceFormData({
        id: service._id,
        name: service.name,
        price: service.price,
        costPrice: service.costPrice || 0,
        warranty: service.warranty || 'No Warranty',
        category: service.category || 'Repair'
      });
    } else {
      setServiceFormData({ id: null, name: '', price: 0, costPrice: 0, warranty: 'No Warranty', category: 'Repair' });
    }
    setShowServiceModal(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      if (serviceFormData.id) {
        await axios.put(`/services/${serviceFormData.id}`, serviceFormData);
        toast.success('Service updated!');
      } else {
        await axios.post('/services', serviceFormData);
        toast.success('Service created!');
      }
      setShowServiceModal(false);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await axios.delete(`/services/${id}`);
      toast.success('Service removed');
      fetchServices();
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  if (loading || !settings) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in duration-700">
      {/* Shop Info Form */}
      <div className="bg-[#121d30] border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#00d4ff] mb-8 flex items-center gap-2">
          <FiSettings /> Shop Profile Configuration
        </h3>
        
        <form onSubmit={handleUpdateSettings} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Shop Name</label>
              <div className="relative group">
                <FiSmartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00d4ff] transition-colors" />
                <input
                  type="text"
                  value={settings.shopName}
                  onChange={e => setSettings({ ...settings, shopName: e.target.value })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#00d4ff]/50 transition-all font-bold"
                />
              </div>
            </div>
            <div className="col-span-2 md:col-span-1 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">GST Identification (GSTIN)</label>
              <div className="relative group">
                <FiCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00d4ff] transition-colors" />
                <input
                  type="text"
                  value={settings.gstin}
                  onChange={e => setSettings({ ...settings, gstin: e.target.value })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#00d4ff]/50 transition-all font-bold"
                />
              </div>
            </div>
            <div className="col-span-2 md:col-span-1 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Contact Phone</label>
              <div className="relative group">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00d4ff] transition-colors" />
                <input
                  type="text"
                  value={settings.phone}
                  onChange={e => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#00d4ff]/50 transition-all font-bold"
                />
              </div>
            </div>
            <div className="col-span-2 md:col-span-1 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">WhatsApp Number</label>
              <div className="relative group">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00e676] transition-colors" />
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-[#00e676] focus:outline-none focus:border-[#00e676]/50 transition-all font-bold"
                />
              </div>
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Shop Address</label>
              <div className="relative group">
                <FiMapPin className="absolute left-4 top-4 text-white/20 group-focus-within:text-[#00d4ff] transition-colors" />
                <textarea
                  value={settings.address}
                  onChange={e => setSettings({ ...settings, address: e.target.value })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#00d4ff]/50 transition-all font-bold min-h-[80px]"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">System Behavior & Display</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                <div>
                   <p className="text-xs font-black text-white/60 uppercase">Auto-Stock Update</p>
                   <p className="text-[10px] text-white/20">Decrement stock on new bills</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setSettings({ ...settings, autoStockDecrement: !settings.autoStockDecrement })}
                  className={`text-2xl transition-all ${settings.autoStockDecrement ? 'text-[#00d4ff]' : 'text-white/10'}`}
                >
                  {settings.autoStockDecrement ? <FiToggleRight /> : <FiToggleLeft />}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                <div>
                   <p className="text-xs font-black text-white/60 uppercase">GST Component</p>
                   <p className="text-[10px] text-white/20">Include GST block on invoices</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setSettings({ ...settings, showGSTOnBill: !settings.showGSTOnBill })}
                  className={`text-2xl transition-all ${settings.showGSTOnBill ? 'text-[#00e676]' : 'text-white/10'}`}
                >
                  {settings.showGSTOnBill ? <FiToggleRight /> : <FiToggleLeft />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1 flex items-center gap-2">
                 <FiLayout className="text-[#00d4ff]" /> Default PDF Theme
               </label>
               <div className="grid grid-cols-4 gap-2">
                 {['blue', 'green', 'dark', 'orange'].map(theme => (
                   <button
                     key={theme}
                     type="button"
                     onClick={() => setSettings({ ...settings, pdfTheme: theme })}
                     className={`
                       py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                       ${settings.pdfTheme === theme 
                         ? 'bg-[#00d4ff]/10 border-[#00d4ff]/40 text-[#00d4ff]' 
                         : 'bg-white/5 border-white/5 text-white/20 hover:text-white/40'}
                     `}
                   >
                     {theme}
                   </button>
                 ))}
               </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-[#004aaa] to-[#00d4ff] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#00d4ff]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {saving ? 'SAVING...' : 'UPDATE SYSTEM SETTINGS'}
            </button>
          </div>
        </form>
      </div>

      {/* User Management Section */}
      <div className="space-y-8">
        <div className="bg-[#121d30] border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#00d4ff] flex items-center gap-2">
                <FiUser /> User Account Management
              </h3>
              <button 
                onClick={() => handleOpenUserModal()}
                className="bg-[#00d4ff]/10 text-[#00d4ff] px-4 py-2 rounded-xl border border-[#00d4ff]/20 text-xs font-black uppercase tracking-tighter hover:bg-[#00d4ff]/20 transition-all flex items-center gap-2"
              >
                <FiPlus /> New User
              </button>
           </div>

           <div className="space-y-3">
              {users.map(u => (
                <div key={u._id} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-[#00d4ff]/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/30 group-hover:text-[#00d4ff] transition-colors">
                      <FiUser size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white/80">{u.name}</p>
                      <p className="text-[10px] text-white/20 uppercase font-black">@{u.username} • {u.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenUserModal(u)}
                      className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all"
                    >
                      <FiSettings size={16} />
                    </button>
                    {u.username !== 'admin' && (
                      <button 
                        onClick={() => handleDeleteUser(u._id)}
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-gradient-to-br from-[#1a3050] to-[#121d30] border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#00d4ff]/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
           <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">System Information</h3>
           <div className="space-y-3 relative z-10">
              <div className="flex justify-between text-xs">
                <span className="text-white/20">API Endpoint</span>
                <span className="text-white/40 font-mono italic">/api/v1.0</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/20">DB Cluster</span>
                <span className="text-white/40 font-mono italic">Local Instance</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/20">Last Backup</span>
                <span className="text-white/40 font-mono italic">Yesterday, 14:30</span>
              </div>
               <div className="flex justify-between text-xs pt-3 border-t border-white/5">
                 <span className="text-white/20">Environment</span>
                 <span className="text-[#00e676] font-black uppercase tracking-widest text-[9px]">Production Optimized</span>
               </div>
            </div>
         </div>
       </div>

      {/* Service Management Section */}
      <div className="bg-[#121d30] border border-white/5 p-8 rounded-[2.5rem] shadow-xl xl:col-span-2">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#00d4ff] flex items-center gap-2">
              <FiLayout /> Predefined Services & Repairs
            </h3>
            <button 
              onClick={() => handleOpenServiceModal()}
              className="bg-[#00d4ff]/10 text-[#00d4ff] px-4 py-2 rounded-xl border border-[#00d4ff]/20 text-xs font-black uppercase tracking-tighter hover:bg-[#00d4ff]/20 transition-all flex items-center gap-2"
            >
              <FiPlus /> New Service
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(s => (
              <div key={s._id} className="p-4 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-[#00d4ff]/20 transition-all">
                <div>
                  <p className="font-bold text-white/80">{s.name}</p>
                  <p className="text-[10px] text-white/20 uppercase font-black">₹{s.price} • {s.warranty}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenServiceModal(s)}
                    className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-[#00d4ff] transition-all"
                  >
                    <FiSettings size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteService(s._id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
         </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className="bg-[#121d30] border border-white/10 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <FiUser className="text-[#00d4ff]" />
                {userFormData.id ? 'Edit User' : 'Add New User'}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowUserModal(false)}
                className="w-10 h-10 rounded-full bg-white/5 text-white/40 hover:text-white flex items-center justify-center transition-colors"
               >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={e => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                  placeholder="E.g. John Doe"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">Username</label>
                <input
                  type="text"
                  required
                  value={userFormData.username}
                  onChange={e => setUserFormData({ ...userFormData, username: e.target.value })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                  placeholder="johndoe123"
                  readOnly={userFormData.username === 'admin' && userFormData.id}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">
                  Password {userFormData.id && <span className="text-white/40 lowercase tracking-normal font-normal">(Leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  required={!userFormData.id}
                  value={userFormData.password}
                  onChange={e => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">Role</label>
                <select
                  value={userFormData.role}
                  onChange={e => setUserFormData({ ...userFormData, role: e.target.value })}
                  disabled={userFormData.username === 'admin'}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                 <button 
                   type="button" 
                   onClick={() => setShowUserModal(false)}
                   className="px-6 py-3 rounded-2xl text-sm font-bold text-white/40 hover:text-white transition-colors"
                 >
                   CANCEL
                 </button>
                 <button 
                   type="submit" 
                   className="bg-gradient-to-r from-[#004aaa] to-[#00d4ff] text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-[#00d4ff]/20 active:scale-95 transition-all"
                 >
                   SAVE USER
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className="bg-[#121d30] border border-white/10 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <FiLayout className="text-[#00d4ff]" />
                {serviceFormData.id ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowServiceModal(false)}
                className="w-10 h-10 rounded-full bg-white/5 text-white/40 hover:text-white flex items-center justify-center transition-colors"
               >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={serviceFormData.name}
                  onChange={e => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                  className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                  placeholder="E.g. Screen Replacement"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={serviceFormData.price}
                    onChange={e => setServiceFormData({ ...serviceFormData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={serviceFormData.costPrice}
                    onChange={e => setServiceFormData({ ...serviceFormData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                  />
                </div>
              </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">Category</label>
                  <select
                    value={serviceFormData.category}
                    onChange={e => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                    className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                  >
                    <option value="Repair">Repair</option>
                    <option value="Service">Service</option>
                    <option value="Installation">Installation</option>
                    <option value="Software">Software</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#00d4ff] ml-1">Warranty</label>
                  <input
                    type="text"
                    value={serviceFormData.warranty}
                    onChange={e => setServiceFormData({ ...serviceFormData, warranty: e.target.value })}
                    className="w-full bg-black/30 border border-white/5 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-[#00d4ff]/50"
                    placeholder="E.g. 6 Months"
                  />
                </div>

              <div className="pt-4 flex justify-end gap-3">
                 <button 
                   type="button" 
                   onClick={() => setShowServiceModal(false)}
                   className="px-6 py-3 rounded-2xl text-sm font-bold text-white/40 hover:text-white transition-colors"
                 >
                   CANCEL
                 </button>
                 <button 
                   type="submit" 
                   className="bg-gradient-to-r from-[#004aaa] to-[#00d4ff] text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-[#00d4ff]/20 active:scale-95 transition-all"
                 >
                   SAVE SERVICE
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
