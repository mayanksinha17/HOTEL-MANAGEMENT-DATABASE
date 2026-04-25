import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiHome, FiGrid, FiList, FiUsers, FiUser, FiCheckCircle } from 'react-icons/fi';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const { user, logout, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = () => {
    if (activeTab === 'Profile') {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    if (activeTab === 'Dashboard') {
      api.get('/admin/stats')
        .then(res => setStats(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else if (activeTab === 'Hotels') {
      api.get('/hotels/')
        .then(res => setDataList(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else if (activeTab === 'Bookings') {
      api.get('/bookings/all')
        .then(res => setDataList(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else if (activeTab === 'Rooms') {
      api.get('/rooms/all')
        .then(res => setDataList(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setDataList([]);
      setLoading(false);
    }
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    api.put('/auth/me', profileForm)
      .then(res => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        toast.success('Admin profile updated successfully');
      })
      .catch(err => toast.error('Failed to update profile'))
      .finally(() => setUpdatingProfile(false));
  };

  const handleDelete = (id) => {
    if (activeTab === 'Bookings') {
      if (!window.confirm('Are you sure you want to cancel this booking?')) return;
      api.put(`/bookings/${id}/cancel`)
        .then(() => {
          toast.success('Booking cancelled successfully');
          fetchData(); // Refresh table
        })
        .catch(err => {
          toast.error(err.response?.data?.detail || 'Failed to cancel booking');
        });
    } else {
      toast.error(`Delete functionality for ${activeTab} is disabled in this demo.`);
    }
  };

  const navLinks = ['Dashboard', 'Hotels', 'Rooms', 'Bookings', 'Profile'];

  const renderDashboard = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Total Bookings', value: stats?.total_bookings || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Total Revenue', value: `₹${stats?.total_revenue?.toLocaleString() || 0}`, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Occupancy Rate', value: `${stats?.occupancy_rate || 0}%`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { label: 'Total Hotels', value: stats?.total_hotels || 0, color: 'text-purple-600', bg: 'bg-purple-50' }
      ].map((stat, i) => (
        <div key={i} className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-center">
          <div className={`text-4xl font-bold font-inter mb-2 ${stat.color}`}>{stat.value}</div>
          <div className="text-gray-500 text-sm font-semibold tracking-wide uppercase">{stat.label}</div>
        </div>
      ))}
    </div>
  );

  const renderTable = () => (
    <div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase font-inter tracking-wider border-b border-gray-100">
              <th className="py-5 px-8 font-semibold">ID</th>
              <th className="py-5 px-8 font-semibold">Name / Details</th>
              <th className="py-5 px-8 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length === 0 ? (
              <tr><td colSpan="3" className="py-12 text-center text-gray-500 font-inter">No data available for {activeTab}.</td></tr>
            ) : (
              dataList.map((item, idx) => (
                <tr key={item.id} className={`${idx !== dataList.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50/50 transition-colors`}>
                  <td className="py-5 px-8 text-gray-500 font-inter text-sm font-medium">#{item.id}</td>
                  <td className="py-5 px-8 text-[#0D1B2A] font-inter text-sm font-semibold">
                    {activeTab === 'Hotels' ? item.name : activeTab === 'Bookings' ? (
                      <div className="flex items-center gap-3">
                        <span>{item.hotel_name} — {item.room_type}</span>
                        {item.status === 'cancelled' && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase">Cancelled</span>
                        )}
                      </div>
                    ) : activeTab === 'Rooms' ? item.room_type : item.name || 'Detail'}
                  </td>
                  <td className="py-5 px-8 text-sm">
                    <button onClick={() => toast.error('Edit disabled in demo')} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors mr-3 font-medium font-inter">Edit</button>
                    {activeTab === 'Bookings' && item.status !== 'cancelled' ? (
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition-colors font-medium font-inter">Cancel</button>
                    ) : (
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition-colors font-medium font-inter disabled:opacity-50">Delete</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-12 max-w-3xl">
      <div className="flex items-center gap-6 mb-10">
        <div className="w-24 h-24 bg-gradient-to-br from-[#0D1B2A] to-gray-800 text-[#C9A84C] rounded-full flex items-center justify-center text-4xl font-playfair font-bold shadow-lg">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#0D1B2A]">{user?.name}</h2>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded uppercase">Admin</span>
          </div>
          <p className="text-[#64748B] mt-1">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleProfileUpdate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-2">Full Name</label>
            <input 
              type="text" 
              value={profileForm.name} 
              onChange={e => setProfileForm({...profileForm, name: e.target.value})}
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:bg-white transition-all text-[#0D1B2A]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1E293B] mb-2">Phone Number</label>
            <input 
              type="tel" 
              value={profileForm.phone} 
              onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:bg-white transition-all text-[#0D1B2A]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1E293B] mb-2">Email Address (Read Only)</label>
          <input 
            type="email" 
            value={user?.email} 
            disabled
            className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded-xl px-5 py-3.5 cursor-not-allowed"
          />
        </div>
        
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button 
            type="submit" 
            disabled={updatingProfile}
            className="bg-[#0D1B2A] hover:bg-[#1e324a] text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            {updatingProfile ? 'Saving...' : 'Save Settings'} <FiCheckCircle />
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] pt-16 font-inter">
      {/* Sidebar */}
      <div className="w-72 bg-[#0D1B2A] text-white flex flex-col p-8 hidden md:flex shrink-0 h-[calc(100vh-64px)] sticky top-16 shadow-2xl z-10">
        <div className="mb-12">
          <h2 className="font-playfair text-3xl font-bold text-white mb-2">LuxeStay</h2>
          <p className="text-[#C9A84C] text-sm font-bold tracking-widest uppercase">Admin Portal</p>
        </div>
        
        <div className="flex flex-col gap-2 flex-1">
          {navLinks.map(link => (
            <div 
              key={link}
              onClick={() => setActiveTab(link)}
              className={`flex items-center gap-4 py-4 px-5 rounded-xl cursor-pointer transition-all duration-300 ${activeTab === link ? 'bg-gradient-to-r from-[#C9A84C]/20 to-transparent text-[#C9A84C] border-l-4 border-[#C9A84C] font-semibold' : 'text-[#94A3B8] hover:text-white hover:bg-white/5'}`}
            >
              {link === 'Dashboard' && <FiGrid size={20} />}
              {link === 'Hotels' && <FiHome size={20} />}
              {link === 'Rooms' && <FiList size={20} />}
              {link === 'Bookings' && <FiUsers size={20} />}
              {link === 'Profile' && <FiUser size={20} />}
              <span className="text-[15px]">{link}</span>
            </div>
          ))}
        </div>
        
        <div 
          onClick={() => logout()}
          className="flex items-center gap-4 py-4 px-5 rounded-xl hover:bg-red-500/10 cursor-pointer transition-all text-red-400 mt-auto"
        >
          <FiLogOut size={20} /> <span className="text-[15px] font-medium">Secure Logout</span>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto w-full max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} key={activeTab}>
          <div className="mb-10">
            <h1 className="font-playfair text-4xl font-bold text-[#0D1B2A] mb-2">{activeTab}</h1>
            <p className="text-[#64748B]">Manage system {activeTab.toLowerCase()} and configurations.</p>
          </div>
          
          {loading ? (
             <div className="w-full flex justify-center py-20">
               <div className="w-10 h-10 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
            activeTab === 'Dashboard' ? renderDashboard() : 
            activeTab === 'Profile' ? renderProfile() : 
            renderTable()
          )}
        </motion.div>
      </div>
    </div>
  );
}
