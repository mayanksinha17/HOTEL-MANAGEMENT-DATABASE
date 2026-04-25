import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackImg = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

  useEffect(() => {
    Promise.all([
      api.get(`/hotels/${id}`),
      api.get(`/rooms/hotel/${id}`)
    ])
    .then(([hRes, rRes]) => {
      setHotel(hRes.data);
      setRooms(rRes.data);
    })
    .catch((err) => {
      console.error(err);
      navigate('/search');
    })
    .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-gray-50">
        <div className="text-xl font-semibold text-gray-600 font-inter animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!hotel) return null;

  return (
    <div className="w-full bg-gray-50 min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24">
        {user?.is_admin && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl mb-4 font-inter text-sm flex items-center justify-center font-medium">
            You are viewing this property as a Platform Administrator. Booking is disabled.
          </div>
        )}

        {/* Hero Image */}
        <img 
          src={hotel.image_url || fallbackImg} 
          alt={hotel.name} 
          className="w-full h-80 object-cover rounded-2xl shadow-md mt-4"
          onError={(e) => e.target.src = fallbackImg}
        />

        {/* Info Section */}
        <div className="py-8">
          <h1 className="font-playfair text-4xl font-bold text-gray-900">{hotel.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-gray-500 font-inter">
            <div className="flex items-center gap-1">
              <FiMapPin /> {hotel.address || ''} {hotel.city}, {hotel.state}
            </div>
            <div className="flex items-center gap-1 text-yellow-500">
              {Array.from({ length: hotel.star_rating || 5 }).map((_, i) => (
                <FaStar key={i} />
              ))}
            </div>
          </div>
          <p className="text-gray-600 mt-4 leading-relaxed max-w-3xl font-inter">
            {hotel.description}
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            {hotel.amenities?.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-700 font-inter border border-gray-200">
                {amenity}
              </div>
            ))}
          </div>
        </div>

        {/* Rooms Section */}
        <div className="mt-8">
          <h2 className="font-playfair text-3xl font-bold text-center text-gray-800 mb-12">Available Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 font-inter py-10">
                No rooms available currently.
              </div>
            ) : (
              rooms.map((room) => (
                <div key={room.id} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition">
                  <img 
                    src={room.image_url || fallbackImg} 
                    alt={room.room_type} 
                    className="h-48 w-full object-cover"
                    onError={(e) => e.target.src = fallbackImg}
                  />
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 font-inter">{room.room_type}</h3>
                    <p className="text-gray-500 text-sm mt-2 flex-1 font-inter">{room.description}</p>
                    <div className="text-sm text-gray-500 mt-2 font-inter space-y-1">
                      <div>Capacity: {room.capacity} Guests</div>
                      <div>Bed: {room.bed_type}</div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-yellow-600 font-bold text-xl font-inter">
                        ₹{room.price_per_night?.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ night</span>
                      </div>
                      
                      {!user?.is_admin && (
                        <button 
                          onClick={() => user ? navigate(`/booking?roomId=${room.id}&hotelId=${hotel.id}`) : navigate('/login')}
                          className={`px-6 py-2 rounded-lg font-semibold transition font-inter ${room.available_rooms > 0 ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                          disabled={room.available_rooms <= 0}
                        >
                          {room.available_rooms > 0 ? 'Book Now' : 'Sold Out'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
