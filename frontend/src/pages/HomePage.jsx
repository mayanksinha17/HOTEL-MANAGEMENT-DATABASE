import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTag, FiRefreshCw, FiHeadphones, FiMapPin } from 'react-icons/fi';
import api from '../api/axios';

export default function HomePage() {
  const navigate = useNavigate();
  const fallbackImg = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    api.get('/hotels/')
      .then(res => setHotels(res.data))
      .catch(err => console.error("Failed to load hotels", err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/search');
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative w-full h-screen">
        <img 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920" 
          alt="Luxury Hotel" 
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => e.target.src = fallbackImg}
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
          <h1 className="font-playfair text-5xl font-bold">Find Your Perfect Stay</h1>
          <p className="font-inter text-xl mt-4 text-gray-200">Discover luxury hotels at the best prices</p>
          
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-4 mt-8 flex gap-3 flex-wrap justify-center w-full max-w-4xl">
            <input 
              type="text" 
              placeholder="Location" 
              className="border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex-1 min-w-[150px]"
            />
            <input 
              type="date" 
              className="border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex-1 min-w-[150px]"
            />
            <input 
              type="date" 
              className="border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex-1 min-w-[150px]"
            />
            <input 
              type="number" 
              placeholder="Guests" 
              min="1"
              className="border border-gray-200 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex-1 min-w-[100px]"
            />
            <button 
              type="submit" 
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-2 rounded-lg font-semibold transition shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <section className="bg-white py-16 px-6 md:px-24">
        <h2 className="font-playfair text-3xl font-bold text-center text-gray-800 mb-12">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition">
            <FiTag className="text-yellow-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2 font-inter">Best Price Guarantee</h3>
            <p className="text-gray-500 text-sm leading-relaxed font-inter">We match any lower price you find, ensuring you always get the best deal.</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition">
            <FiRefreshCw className="text-yellow-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2 font-inter">Free Cancellation</h3>
            <p className="text-gray-500 text-sm leading-relaxed font-inter">Plans change — cancel up to 24 hours before check-in at no extra cost.</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition">
            <FiHeadphones className="text-yellow-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2 font-inter">24/7 Support</h3>
            <p className="text-gray-500 text-sm leading-relaxed font-inter">Our dedicated support team is available around the clock to assist you.</p>
          </div>
        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="py-16 px-6 md:px-24 bg-gray-50">
        <h2 className="font-playfair text-3xl font-bold text-center text-gray-800 mb-12">Featured Hotels</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hotels.slice(0, 3).map((hotel) => (
            <div key={hotel.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate(`/hotel/${hotel.id}`)}>
              <img 
                src={hotel.image_url} 
                alt={hotel.name} 
                className="w-full h-56 object-cover"
                onError={(e) => e.target.src = fallbackImg}
              />
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800 font-inter">{hotel.name}</h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1 font-inter">
                  <FiMapPin /> {hotel.city}, {hotel.state}
                </div>
                <div className="text-yellow-600 font-bold text-xl mt-3 font-inter">
                  ₹{hotel.price_per_night.toLocaleString()} <span className="text-sm text-gray-500 font-normal">/ night</span>
                </div>
                <button className="w-full mt-4 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition font-semibold font-inter">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>


    </div>
  );
}
