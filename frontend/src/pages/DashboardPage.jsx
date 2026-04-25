import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiCalendar, FiMapPin, FiX, FiCheckCircle } from 'react-icons/fi';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const { user, logout, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Bookings');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, bookingId: null });

  // Profile Form State
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (activeTab === 'Bookings') {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/bookings/my')
      .then(res => setBookings(res.data))
      .catch(err => {
        console.error(err);
        toast.error('Failed to load bookings');
      })
      .finally(() => setLoading(false));
  };

  const handleCancelClick = (bookingId) => {
    setCancelModal({ isOpen: true, bookingId });
  };

  const confirmCancel = () => {
    const id = cancelModal.bookingId;
    setCancelModal({ isOpen: false, bookingId: null });
    
    api.put(`/bookings/${id}/cancel`)
      .then(() => {
        toast.success('Booking cancelled successfully');
        fetchBookings();
      })
      .catch(err => {
        console.error(err);
        toast.error(err.response?.data?.detail || 'Failed to cancel booking');
      });
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    api.put('/auth/me', profileForm)
      .then(res => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        toast.success('Profile updated successfully');
      })
      .catch(err => toast.error('Failed to update profile'))
      .finally(() => setUpdatingProfile(false));
  };

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

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] pt-16 font-inter">
      
      {/* Sidebar */}
      <div className="w-72 bg-[#0D1B2A] text-white flex flex-col p-8 hidden md:flex shrink-0 h-[calc(100vh-64px)] sticky top-16 shadow-2xl z-10">
        <div className="mb-12">
          <h2 className="font-playfair text-3xl font-bold text-white mb-2">My Account</h2>
          <p className="text-[#94A3B8] text-sm font-medium">Welcome back, {user?.name?.split(' ')[0]}!</p>
        </div>
        
        <div className="flex flex-col gap-3 flex-1">
          <div 
            onClick={() => setActiveTab('Bookings')}
            className={`flex items-center gap-4 py-4 px-5 rounded-xl cursor-pointer transition-all duration-300 ${activeTab === 'Bookings' ? 'bg-gradient-to-r from-[#C9A84C]/20 to-transparent text-[#C9A84C] border-l-4 border-[#C9A84C] font-semibold' : 'text-[#94A3B8] hover:text-white hover:bg-white/5'}`}
          >
            <FiCalendar size={20} /> <span className="text-[15px]">My Bookings</span>
          </div>
          <div 
            onClick={() => setActiveTab('Profile')}
            className={`flex items-center gap-4 py-4 px-5 rounded-xl cursor-pointer transition-all duration-300 ${activeTab === 'Profile' ? 'bg-gradient-to-r from-[#C9A84C]/20 to-transparent text-[#C9A84C] border-l-4 border-[#C9A84C] font-semibold' : 'text-[#94A3B8] hover:text-white hover:bg-white/5'}`}
          >
            <FiUser size={20} /> <span className="text-[15px]">Profile Settings</span>
          </div>
        </div>
        
        <div 
          onClick={() => logout()}
          className="flex items-center gap-4 py-4 px-5 rounded-xl hover:bg-red-500/10 cursor-pointer transition-all text-red-400 mt-auto"
        >
          <FiLogOut size={20} /> <span className="text-[15px] font-medium">Secure Logout</span>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto w-full max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} key={activeTab}>
          <h1 className="font-playfair text-4xl font-bold text-[#0D1B2A] mb-2">{activeTab === 'Bookings' ? 'My Stays' : 'Personal Profile'}</h1>
          <p className="text-[#64748B] mb-10">{activeTab === 'Bookings' ? 'Manage your upcoming and past reservations.' : 'Update your personal information.'}</p>
          
          {loading ? (
             <div className="w-full flex justify-center py-20">
               <div className="w-10 h-10 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : activeTab === 'Bookings' ? (
            <div className="space-y-6">
              {bookings.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCalendar size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Bookings Yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto leading-relaxed">It looks like you haven't made any reservations yet. Start exploring our premium hotels and book your next getaway.</p>
                </div>
              ) : (
                bookings.map(booking => (
                  <div key={booking.id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col md:flex-row group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                    <div className="md:w-72 h-56 shrink-0 relative overflow-hidden">
                      <img 
                        src={booking.hotel_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'} 
                        alt={booking.hotel_name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="text-white font-playfair text-xl font-bold leading-tight mb-1">{booking.hotel_name}</div>
                        <div className="text-white/80 text-xs flex items-center gap-1"><FiMapPin /> {booking.room_type}</div>
                      </div>
                    </div>

                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-sm text-[#64748B] mb-1 font-medium tracking-wide uppercase">Dates</div>
                            <div className="text-[#0D1B2A] font-semibold">
                              {new Date(booking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                              <span className="text-gray-400 mx-2">→</span> 
                              {new Date(booking.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                        <div className="mt-6 flex justify-end">
                          <button 
                            onClick={() => handleCancelClick(booking.id)}
                            className="text-red-500 hover:text-white border border-red-200 hover:bg-red-500 hover:border-red-500 px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300"
                          >
                            Cancel Reservation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Profile Tab
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-12 max-w-3xl">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-24 h-24 bg-[#0D1B2A] text-[#C9A84C] rounded-full flex items-center justify-center text-4xl font-playfair font-bold shadow-inner">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0D1B2A]">{user?.name}</h2>
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
                    {updatingProfile ? 'Saving...' : 'Save Changes'} <FiCheckCircle />
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>

      {/* Cancellation Modal */}
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
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-2xl font-bold">!</div>
              </div>
              
              <h3 className="text-2xl font-playfair font-bold text-[#0D1B2A] mb-3">Cancel Reservation</h3>
              <p className="text-gray-500 font-inter mb-8 leading-relaxed">
                Are you absolutely sure you want to cancel this booking? This action cannot be undone and your room will be released.
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
