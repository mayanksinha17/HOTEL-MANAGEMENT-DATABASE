import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const hotelId = searchParams.get('hotelId');
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    check_in: '',
    check_out: '',
    guests: 1,
    special_requests: ''
  });

  const fallbackImg = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600';

  useEffect(() => {
    if (!roomId || !hotelId) {
      navigate('/search');
      return;
    }

    Promise.all([
      api.get(`/rooms/${roomId}`),
      api.get(`/hotels/${hotelId}`)
    ])
    .then(([rRes, hRes]) => {
      setRoom(rRes.data);
      setHotel(hRes.data);
    })
    .catch((err) => {
      console.error(err);
      toast.error('Failed to load booking details');
      navigate('/search');
    })
    .finally(() => setLoading(false));
  }, [roomId, hotelId, navigate]);

  const calculateNights = () => {
    if (!formData.check_in || !formData.check_out) return 0;
    const start = new Date(formData.check_in);
    const end = new Date(formData.check_out);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const nights = calculateNights();
  const totalPrice = room ? room.price_per_night * nights : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nights <= 0) {
      toast.error('Check-out date must be after check-in date');
      return;
    }
    
    // Create booking API call
    api.post('/bookings/', {
      room_id: parseInt(roomId),
      check_in_date: formData.check_in,
      check_out_date: formData.check_out,
      guests: parseInt(formData.guests),
      total_price: totalPrice,
      special_requests: formData.special_requests
    })
    .then(() => {
      toast.success('Booking confirmed successfully!');
      navigate('/dashboard');
    })
    .catch((err) => {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to confirm booking');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-gray-50">
        <div className="text-xl font-semibold text-gray-600 font-inter animate-pulse">Loading booking details...</div>
      </div>
    );
  }

  if (!room || !hotel) return null;

  return (
    <div className="w-full bg-gray-50 min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left — Room Summary Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 h-fit">
            <img 
              src={room.image_url || fallbackImg} 
              alt={room.room_type} 
              className="w-full h-48 object-cover rounded-xl mb-4"
              onError={(e) => e.target.src = fallbackImg}
            />
            <h2 className="text-2xl font-semibold text-gray-800 font-inter">{room.room_type}</h2>
            <h3 className="text-gray-500 font-inter mt-1">{hotel.name}</h3>
            
            <div className="text-gray-800 font-inter mt-4">
              ₹{room.price_per_night?.toLocaleString()} <span className="text-sm text-gray-500">/ night</span>
            </div>

            <hr className="my-6 border-gray-200" />

            <div className="flex justify-between items-center mb-2 font-inter">
              <span className="text-gray-600">Nights Stayed</span>
              <span className="font-semibold text-gray-800">{nights}</span>
            </div>
            <div className="flex justify-between items-center font-inter">
              <span className="text-gray-800 font-semibold text-lg">Total Price</span>
              <span className="text-2xl font-bold text-yellow-600">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Right — Booking Form */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="font-playfair text-3xl font-bold text-gray-800 mb-6">Complete Your Booking</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-1 font-inter">Check-in Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.check_in}
                  onChange={(e) => setFormData({...formData, check_in: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-yellow-500 focus:outline-none font-inter text-gray-800"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-1 font-inter">Check-out Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.check_out}
                  onChange={(e) => setFormData({...formData, check_out: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-yellow-500 focus:outline-none font-inter text-gray-800"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-1 font-inter">Guests</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  max={room.capacity}
                  value={formData.guests}
                  onChange={(e) => setFormData({...formData, guests: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-yellow-500 focus:outline-none font-inter text-gray-800"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-1 font-inter">Special Requests (Optional)</label>
                <textarea 
                  rows="3"
                  value={formData.special_requests}
                  onChange={(e) => setFormData({...formData, special_requests: e.target.value})}
                  placeholder="Any special requests or needs?"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-yellow-500 focus:outline-none font-inter text-gray-800 resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-xl font-semibold text-lg transition mt-4 font-inter"
              >
                Confirm Booking
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
