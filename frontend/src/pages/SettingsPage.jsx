import { useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
  FiSettings, FiSmartphone, FiMapPin, FiPhone, FiCreditCard, 
  FiLayout, FiToggleLeft, FiToggleRight, FiPlus, FiTrash2, FiUser, FiActivity, FiShield, FiCpu
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
        if (password) payload.password = password;
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

  if (loading || !settings) return (
    <div className="flex flex-col items-center justify-center py-40 gap-6">
      <div className="w-16 h-16 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">Initializing Core Settings...</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-slide-up font-outfit">
      {/* Left Column: Core Architecture */}
      <div className="xl:col-span-7 space-y-10">
        <div className="bg-white p-6 md:p-10 lg:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-xl relative overflow-hidden group border border-gray-100">
          <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700">
            <FiCpu size={120} className="md:w-[180px] md:h-[180px]" />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12 relative z-10">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-4 md:gap-5 tracking-tight">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500 text-xl md:text-2xl shadow-inner border border-sky-100">
                <FiSettings />
              </div>
              System Architecture
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
              <span className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">Node Config Master</span>
            </div>
          </div>
          
          <form onSubmit={handleUpdateSettings} className="space-y-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-3">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2 md:ml-4">Enterprise Designation</label>
                <div className="relative group/input">
                  <FiSmartphone className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-sky-500 transition-colors" />
                  <input
                    type="text"
                    value={settings.shopName}
                    onChange={e => setSettings({ ...settings, shopName: e.target.value })}
                    className="premium-input w-full pl-12 md:pl-14 py-4 md:py-4.5 bg-gray-50 border-gray-100 text-gray-900 text-xs md:text-sm font-bold"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2 md:ml-4">Fiscal Identity (GSTIN)</label>
                <div className="relative group/input">
                  <FiCreditCard className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-sky-500 transition-colors" />
                  <input
                    type="text"
                    value={settings.gstin}
                    onChange={e => setSettings({ ...settings, gstin: e.target.value })}
                    className="premium-input w-full pl-12 md:pl-14 py-4 md:py-4.5 bg-gray-50 border-gray-100 text-gray-900 text-xs md:text-sm font-black uppercase tracking-widest"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2 md:ml-4">Primary Voice Relay</label>
                <div className="relative group/input">
                  <FiPhone className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-sky-500 transition-colors" />
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={e => setSettings({ ...settings, phone: e.target.value })}
                    className="premium-input w-full pl-12 md:pl-14 py-4 md:py-4.5 bg-gray-50 border-gray-100 text-gray-900 text-xs md:text-sm font-bold"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2 md:ml-4">Digital Stream (WhatsApp)</label>
                <div className="relative group/input">
                  <FiPhone className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    value={settings.whatsapp}
                    onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
                    className="premium-input w-full pl-12 md:pl-14 py-4 md:py-4.5 bg-gray-50 border-gray-100 text-xs md:text-sm font-black text-emerald-600"
                  />
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-3">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-2 md:ml-4">Physical Base Coordinates</label>
                <div className="relative group/input">
                  <FiMapPin className="absolute left-5 md:left-6 top-6 text-gray-400 group-focus-within/input:text-sky-500 transition-colors" />
                  <textarea
                    value={settings.address}
                    onChange={e => setSettings({ ...settings, address: e.target.value })}
                    className="premium-input w-full pl-12 md:pl-14 py-4 md:py-5 bg-gray-50 border-gray-100 min-h-[120px] md:min-h-[140px] text-gray-900 text-xs md:text-sm leading-relaxed"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-100 space-y-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                Protocol Behavioral Matrix
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] flex items-center justify-between group hover:ring-2 ring-sky-500/10 transition-all shadow-sm">
                  <div>
                     <p className="text-[12px] font-black text-gray-800 uppercase tracking-widest mb-1">Asset Syncing</p>
                     <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest leading-relaxed">Automated inventory<br/>decrement protocol</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSettings({ ...settings, autoStockDecrement: !settings.autoStockDecrement })}
                    className={`text-4xl transition-all duration-500 transform hover:scale-110 ${settings.autoStockDecrement ? 'text-sky-500 drop-shadow-md' : 'text-gray-200'}`}
                  >
                    {settings.autoStockDecrement ? <FiToggleRight /> : <FiToggleLeft />}
                  </button>
                </div>

                <div className="p-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] flex items-center justify-between group hover:ring-2 ring-emerald-500/10 transition-all shadow-sm">
                  <div>
                     <p className="text-[12px] font-black text-gray-800 uppercase tracking-widest mb-1">Fiscal Component</p>
                     <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest leading-relaxed">Integrated GST logic<br/>in digital manifests</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSettings({ ...settings, showGSTOnBill: !settings.showGSTOnBill })}
                    className={`text-4xl transition-all duration-500 transform hover:scale-110 ${settings.showGSTOnBill ? 'text-emerald-500 drop-shadow-md' : 'text-gray-200'}`}
                  >
                    {settings.showGSTOnBill ? <FiToggleRight /> : <FiToggleLeft />}
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                 <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-1">Manifest Chromatic Spectrum</label>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                   {['blue', 'green', 'dark', 'orange'].map(theme => (
                     <button
                       key={theme}
                       type="button"
                       onClick={() => setSettings({ ...settings, pdfTheme: theme })}
                       className={`
                         py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all border relative overflow-hidden group/theme
                         ${settings.pdfTheme === theme 
                           ? 'bg-sky-500 text-white border-transparent shadow-[0_15px_30px_rgba(14,165,233,0.3)] scale-105' 
                           : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-white'}
                       `}
                     >
                       <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/theme:animate-shimmer opacity-0 group-hover/theme:opacity-100 transition-opacity"></div>
                       {theme === 'blue' && 'Ultramarine'}
                       {theme === 'green' && 'Emerald'}
                       {theme === 'dark' && 'Obsidian'}
                       {theme === 'orange' && 'Amber'}
                     </button>
                   ))}
                 </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="premium-btn w-full bg-sky-500 text-white font-black py-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(14,165,233,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-4 uppercase tracking-[0.4em] text-sm relative overflow-hidden group/submit"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/submit:animate-shimmer"></div>
                {saving ? (
                  <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FiShield size={22} className="group-hover/submit:rotate-12 transition-transform" /> 
                    Commit System Configuration
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Provision Management Section */}
        <div className="bg-white p-6 md:p-10 lg:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-xl relative overflow-hidden group border border-gray-100">
          <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-700">
            <FiLayout size={120} className="md:w-[180px] md:h-[180px]" />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 md:mb-12 relative z-10">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-4 md:gap-5 tracking-tight">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 text-xl md:text-2xl shadow-inner border border-amber-100">
                <FiLayout />
              </div>
              Provision Repository
            </h3>
            <button 
              onClick={() => handleOpenServiceModal()}
              className="w-full sm:w-auto bg-amber-50 hover:bg-amber-100 text-amber-600 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl border border-amber-100 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 shadow-sm"
            >
              Initialize Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative z-10">
            {services.map(s => (
              <div key={s._id} className="p-6 md:p-8 bg-gray-50 border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-between group/srv hover:ring-2 ring-amber-500/10 transition-all shadow-sm">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-black text-gray-800 uppercase tracking-wide mb-1 md:mb-2 truncate">{s.name}</p>
                  <div className="flex items-center gap-2 md:gap-3">
                     <p className="text-[10px] md:text-xs text-amber-500 font-black tracking-tighter">₹{s.price.toLocaleString()}</p>
                     <span className="w-1 h-3 border-l border-gray-200"></span>
                     <p className="text-[8px] md:text-[9px] text-gray-400 uppercase font-black tracking-[0.2em] truncate">{s.warranty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 group-hover/srv:translate-x-0 transition-transform">
                  <button 
                    onClick={() => handleOpenServiceModal(s)}
                    className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-amber-500 transition-all shadow-sm"
                  >
                    <FiSettings size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteService(s._id)}
                    className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-white border border-gray-100 text-rose-300 hover:text-rose-500 transition-all shadow-sm"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Personnel & Status */}
      <div className="xl:col-span-5 space-y-10">
        <div className="bg-white p-10 lg:p-12 rounded-[4rem] shadow-xl relative overflow-hidden group border border-gray-100">
           <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity duration-700">
              <FiUser size={150} />
           </div>
           <div className="flex items-center justify-between mb-12 relative z-10">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-5 tracking-tight">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500 text-2xl shadow-inner border border-sky-100">
                   <FiUser />
                </div>
                Access Clearance
              </h3>
              <button 
                 onClick={() => handleOpenUserModal()}
                 className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-100 transition-all active:scale-95 border border-sky-100 shadow-sm"
              >
                <FiPlus size={24} />
              </button>
           </div>

           <div className="space-y-6 relative z-10">
              {users.map(u => (
                <div key={u._id} className="p-6 bg-gray-50 border border-gray-100 rounded-[2.5rem] flex items-center justify-between group/user hover:ring-2 ring-sky-500/10 transition-all shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[1.5rem] bg-white border border-gray-100 flex items-center justify-center text-gray-300 group-hover/user:text-sky-500 group-hover/user:scale-105 transition-all duration-500 shadow-inner">
                      <FiUser size={28} />
                    </div>
                    <div>
                      <p className="font-black text-gray-800 uppercase tracking-wide text-sm">{u.name}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                         <p className="text-[9px] text-gray-400 uppercase font-black tracking-[0.3em]">@{u.username}</p>
                         <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                         <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full ${u.role === 'admin' ? 'bg-sky-50 text-sky-500 border border-sky-100' : 'bg-gray-200 text-gray-500'}`}>
                           {u.role}
                         </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group-hover/user:translate-x-0 transition-transform">
                    <button 
                      onClick={() => handleOpenUserModal(u)}
                      className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-sky-500 transition-all shadow-sm"
                    >
                      <FiSettings size={18} />
                    </button>
                    {u.username !== 'admin' && (
                      <button 
                        onClick={() => handleDeleteUser(u._id)}
                        className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-rose-300 hover:text-rose-500 transition-all shadow-sm"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-10 lg:p-12 rounded-[4rem] shadow-xl relative overflow-hidden group border border-gray-100">
           <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-sky-50 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-[3000ms]"></div>
           <div className="flex items-center gap-5 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-sky-500 shadow-inner border border-gray-100">
                 <FiActivity size={24} />
              </div>
              <div>
                 <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400">Architecture Health</h4>
                 <p className="text-[9px] text-gray-300 uppercase font-black tracking-widest mt-1">Real-time status analysis</p>
              </div>
           </div>
           
           <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Protocol Iteration</span>
                <span className="text-[10px] text-sky-500 font-mono font-black tracking-tighter bg-sky-50 px-4 py-1.5 rounded-full border border-sky-100">CORE_V1.3.5_STABLE</span>
              </div>
              <div className="flex justify-between items-center px-2 border-t border-gray-50 pt-6">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Processing Node</span>
                <span className="text-[10px] text-gray-400 font-mono font-black tracking-tighter">DIST_RELAY_NODE_AX7</span>
              </div>
              <div className="flex justify-between items-center px-2 border-t border-gray-50 pt-6">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Temporal Alignment</span>
                <span className="text-[10px] text-emerald-500 font-mono font-black tracking-tighter">SYNCHRONIZED_0.00ms</span>
              </div>
               <div className="pt-10 border-t border-gray-50 flex items-center justify-center gap-4 group/status">
                 <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse group-hover:scale-125 transition-transform"></div>
                 <span className="text-emerald-500 font-black uppercase tracking-[0.5em] text-[10px]">System Optimized & Live</span>
               </div>
            </div>
         </div>
      </div>

      {/* Modals are remains the same functionality but with improved styling */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-white/30 animate-in fade-in duration-500">
          <div className="bg-white border border-gray-100 w-full max-w-lg rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden animate-slide-up relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-600 to-sky-400"></div>
            <div className="p-12 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-5">
                <div className="w-12 h-12 rounded-[1.2rem] bg-sky-50 flex items-center justify-center text-sky-500 shadow-inner border border-sky-100">
                   <FiUser />
                </div>
                {userFormData.id ? 'Refine Operator' : 'Enroll Operator'}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowUserModal(false)}
                className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 hover:text-gray-900 flex items-center justify-center transition-all hover:rotate-90 text-2xl"
               >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-12 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={e => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="premium-input w-full py-5 px-8 bg-gray-50 border-gray-100 text-gray-900 focus:bg-white"
                  placeholder="Designate Name"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">System Identity Code</label>
                <input
                  type="text"
                  required
                  value={userFormData.username}
                  onChange={e => setUserFormData({ ...userFormData, username: e.target.value })}
                  className="premium-input w-full font-mono font-bold py-5 px-8 bg-gray-50 border-gray-100 text-gray-900 focus:bg-white"
                  placeholder="operative_alias"
                  readOnly={userFormData.username === 'admin' && userFormData.id}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">
                  Access Credential {userFormData.id && <span className="text-gray-300 italic lowercase tracking-normal font-normal ml-2 font-mono">(Null for Persistence)</span>}
                </label>
                <input
                  type="password"
                  required={!userFormData.id}
                  value={userFormData.password}
                  onChange={e => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="premium-input w-full py-5 px-8 bg-gray-50 border-gray-100 text-gray-900 focus:bg-white"
                  placeholder="••••••••••••"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Clearance Specification</label>
                <select
                  value={userFormData.role}
                  onChange={e => setUserFormData({ ...userFormData, role: e.target.value })}
                  disabled={userFormData.username === 'admin'}
                  className="premium-input w-full py-5 px-8 font-black uppercase tracking-widest text-xs cursor-pointer bg-gray-50 border-gray-100 text-gray-600 focus:bg-white"
                >
                  <option value="staff">Standard Operative (Staff)</option>
                  <option value="admin">System Architect (Admin)</option>
                </select>
              </div>

              <div className="pt-10 flex gap-6">
                 <button 
                    type="button" 
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 py-5 rounded-[2rem] text-xs font-black text-gray-400 hover:text-gray-900 transition-all uppercase tracking-[0.3em] border border-gray-100 hover:bg-gray-50"
                 >
                    Abstain
                 </button>
                 <button 
                    type="submit" 
                    className="flex-[2] bg-sky-500 text-white py-5 rounded-[2rem] font-black shadow-[0_15px_30px_rgba(14,165,233,0.3)] active:scale-95 transition-all text-xs uppercase tracking-[0.4em] relative overflow-hidden group/btn"
                 >
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:animate-shimmer"></div>
                    Authorize Clearance
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showServiceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-white/30 animate-in fade-in duration-500">
          <div className="bg-white border border-gray-100 w-full max-w-lg rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden animate-slide-up relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-600 to-amber-400"></div>
            <div className="p-12 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-5">
                <div className="w-12 h-12 rounded-[1.2rem] bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner border border-amber-100">
                   <FiLayout />
                </div>
                {serviceFormData.id ? 'Refine Provision' : 'Define Provision'}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowServiceModal(false)}
                className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 hover:text-gray-900 flex items-center justify-center transition-all hover:rotate-90 text-2xl"
               >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-12 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Provision Designation</label>
                <input
                  type="text"
                  required
                  value={serviceFormData.name}
                  onChange={e => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                  className="premium-input w-full py-5 px-8 bg-gray-50 border-gray-100 text-gray-900 focus:bg-white"
                  placeholder="Service Descriptor"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Market Valuation (₹)</label>
                  <input
                    type="number"
                    required
                    value={serviceFormData.price}
                    onChange={e => setServiceFormData({ ...serviceFormData, price: parseFloat(e.target.value) || 0 })}
                    className="premium-input w-full text-amber-500 font-extrabold text-lg py-5 px-8 bg-gray-50 border-gray-100 focus:bg-white"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Internal Burden (₹)</label>
                  <input
                    type="number"
                    value={serviceFormData.costPrice}
                    onChange={e => setServiceFormData({ ...serviceFormData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="premium-input w-full text-gray-400 font-bold py-5 px-8 bg-gray-50 border-gray-100 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Operational Category</label>
                <select
                  value={serviceFormData.category}
                  onChange={e => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                  className="premium-input w-full py-5 px-8 font-black uppercase tracking-widest text-xs cursor-pointer bg-gray-50 border-gray-100 text-gray-600 focus:bg-white"
                >
                  <option value="Repair">Technical Repair</option>
                  <option value="Service">Routine Service</option>
                  <option value="Installation">Module Installation</option>
                  <option value="Software">Software Protocol</option>
                  <option value="Other">Miscellaneous</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-4">Assurance commitment</label>
                <input
                  type="text"
                  value={serviceFormData.warranty}
                  onChange={e => setServiceFormData({ ...serviceFormData, warranty: e.target.value })}
                  className="premium-input w-full py-5 px-8 text-sky-500 font-bold bg-gray-50 border-gray-100 focus:bg-white"
                  placeholder="Temporal Guard Protocol"
                />
              </div>

              <div className="pt-10 flex gap-6">
                 <button 
                    type="button" 
                    onClick={() => setShowServiceModal(false)}
                    className="flex-1 py-5 rounded-[2rem] text-xs font-black text-gray-400 hover:text-gray-900 transition-all uppercase tracking-[0.3em] border border-gray-100 hover:bg-gray-50"
                 >
                    Abort
                 </button>
                 <button 
                    type="submit" 
                    className="flex-[2] bg-amber-500 text-white py-5 rounded-[2rem] font-black shadow-[0_15px_30px_rgba(245,158,11,0.3)] active:scale-95 transition-all text-xs uppercase tracking-[0.4em] relative overflow-hidden group/btn"
                 >
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:animate-shimmer"></div>
                    Commit Provision
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
