import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiCalendar } from 'react-icons/fi';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    api.get('/bookings/my')
      .then(res => setBookings(res.data))
      .catch(err => {
        console.error(err);
        toast.error('Failed to load bookings');
      })
      .finally(() => setLoading(false));
  };

  const handleCancel = (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    api.put(`/bookings/${bookingId}/cancel`)
      .then(() => {
        toast.success('Booking cancelled successfully');
        fetchBookings();
      })
      .catch(err => {
        console.error(err);
        toast.error(err.response?.data?.detail || 'Failed to cancel booking');
      });
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
      case 'upcoming':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium font-inter">Upcoming</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium font-inter">Completed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium font-inter">Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium font-inter">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-xl font-semibold text-gray-600 font-inter animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col p-6 hidden md:flex shrink-0 h-[calc(100vh-64px)] sticky top-16">
        <div className="text-yellow-600 font-playfair text-2xl font-bold mb-8">LuxeStay</div>
        
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-gray-700 cursor-pointer transition font-inter text-gray-200">
            <FiCalendar /> My Bookings
          </div>
          <div className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-700 cursor-pointer transition font-inter text-gray-200">
            <FiUser /> Profile
          </div>
        </div>
        
        <div 
          onClick={() => logout()}
          className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-700 cursor-pointer transition font-inter text-red-400"
        >
          <FiLogOut /> Logout
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>
        
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-500 font-inter">
            You don't have any bookings yet.
          </div>
        ) : (
          bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-2xl shadow-sm p-6 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition">
              
              {/* Left */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 font-inter">{booking.hotel_name || 'Hotel Name'}</h3>
                <div className="text-gray-500 text-sm mt-1 font-inter">{booking.room_type || 'Room Type'}</div>
                <div className="text-gray-500 text-sm mt-1 font-inter">
                  {new Date(booking.check_in).toLocaleDateString()} — {new Date(booking.check_out).toLocaleDateString()}
                </div>
                <div className="text-yellow-600 font-medium text-sm mt-2 font-inter">
                  Total: ₹{booking.total_price?.toLocaleString()}
                </div>
              </div>

              {/* Right */}
              <div className="flex flex-col items-end gap-3">
                {getStatusBadge(booking.status)}
                
                {(booking.status === 'confirmed' || booking.status === 'upcoming') && (
                  <button 
                    onClick={() => handleCancel(booking.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition font-inter underline"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
}
