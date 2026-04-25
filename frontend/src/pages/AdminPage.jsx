import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiHome, FiGrid, FiList, FiUsers, FiUser, FiCheckCircle } from 'react-icons/fi';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

export default function AdminPage() {
  const { user, logout, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, bookingId: null });

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
      Promise.all([
        api.get('/admin/stats'),
        api.get('/bookings/all')
      ])
        .then(([statsRes, bookingsRes]) => {
          setStats(statsRes.data);
          setDataList(bookingsRes.data.slice(0, 5)); // Show only 5 recent bookings on dashboard
        })
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
    if (activeTab === 'Bookings' || activeTab === 'Dashboard') {
      setCancelModal({ isOpen: true, bookingId: id });
    } else {
      toast.error(`Delete functionality for ${activeTab} is disabled in this demo.`);
    }
  };

  const confirmCancel = () => {
    const id = cancelModal.bookingId;
    setCancelModal({ isOpen: false, bookingId: null });
    api.put(`/bookings/${id}/cancel`)
      .then(() => {
        toast.success('Booking cancelled successfully');
        fetchData();
      })
      .catch(err => {
        toast.error(err.response?.data?.detail || 'Failed to cancel booking');
      });
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

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
      case 'upcoming':
        return <span className="px-4 py-1.5 bg-blue-50/80 text-blue-600 rounded-full text-xs font-bold tracking-wider uppercase border border-blue-100 backdrop-blur-sm shadow-sm">Upcoming</span>;
      case 'completed':
        return <span className="px-4 py-1.5 bg-green-50/80 text-green-600 rounded-full text-xs font-bold tracking-wider uppercase border border-green-100 backdrop-blur-sm shadow-sm">Completed</span>;
      case 'cancelled':
        return <span className="px-4 py-1.5 bg-red-50/80 text-red-500 rounded-full text-xs font-bold tracking-wider uppercase border border-red-100 backdrop-blur-sm shadow-sm">Cancelled</span>;
      default:
        return <span className="px-4 py-1.5 bg-gray-50/80 text-gray-600 rounded-full text-xs font-bold tracking-wider uppercase border border-gray-200 backdrop-blur-sm shadow-sm">{status}</span>;
    }
  };

  const renderBookingCards = () => (
    <div className="space-y-6 mt-8">
      {activeTab === 'Dashboard' && <h3 className="text-2xl font-playfair font-bold text-[#0D1B2A] mb-4">Recent Bookings</h3>}
      {dataList.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Bookings Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">No reservations have been made on the platform yet.</p>
        </div>
      ) : (
        dataList.map(booking => (
          <div key={booking.id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col md:flex-row group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            <div className="md:w-64 h-56 shrink-0 relative overflow-hidden">
              <img 
                src={booking.hotel_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'} 
                alt={booking.hotel_name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-white font-playfair text-xl font-bold leading-tight mb-1">{booking.hotel_name}</div>
                <div className="text-white/80 text-xs">#{booking.id} • {booking.room_type}</div>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-[#0D1B2A] font-semibold">
                      {new Date(booking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                      <span className="text-gray-400 mx-2">→</span> 
                      {new Date(booking.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Booked by: <span className="font-medium text-[#0D1B2A]">{booking.user_name || 'User'}</span> ({booking.user_email || 'No email'})
                    </div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                  <div>
                    <div className="text-sm text-[#64748B] mb-1 font-medium">Guests</div>
                    <div className="text-[#0D1B2A] font-semibold">{booking.guests} Guests</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#64748B] mb-1 font-medium">Total Amount</div>
                    <div className="text-[#C9A84C] font-bold text-lg">₹{booking.total_price?.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {(booking.status === 'confirmed' || booking.status === 'upcoming') && (
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => handleDelete(booking.id)}
                    className="text-red-500 hover:text-white border border-red-200 hover:bg-red-500 hover:border-red-500 px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
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
                    {activeTab === 'Hotels' ? item.name : activeTab === 'Rooms' ? item.room_type : item.name || 'Detail'}
                  </td>
                  <td className="py-5 px-8 text-sm">
                    <button onClick={() => toast.error('Edit disabled in demo')} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors mr-3 font-medium font-inter">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition-colors font-medium font-inter disabled:opacity-50">Delete</button>
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
            activeTab === 'Dashboard' ? (
              <>
                {renderDashboard()}
                {renderBookingCards()}
              </>
            ) : 
            activeTab === 'Profile' ? renderProfile() : 
            activeTab === 'Bookings' ? renderBookingCards() :
            renderTable()
          )}
        </motion.div>
      </div>

      {/* Cancel Booking Modal */}
      <AnimatePresence>
        {cancelModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setCancelModal({ isOpen: false, bookingId: null })}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition"
              >
                <FiX size={24} />
              </button>

              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <FiAlertTriangle size={28} className="text-red-500" />
              </div>

              <h3 className="text-2xl font-playfair font-bold text-[#0D1B2A] mb-3">Cancel Reservation</h3>
              <p className="text-gray-500 font-inter mb-8 leading-relaxed">
                Are you sure you want to cancel this booking? This action cannot be undone, the room will be released and the payment will be refunded.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setCancelModal({ isOpen: false, bookingId: null })}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all font-inter"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg transition-all font-inter"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
