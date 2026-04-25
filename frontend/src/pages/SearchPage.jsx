import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import api from '../api/axios';

export default function SearchPage() {
  const navigate = useNavigate();
  const fallbackImg = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  const [allHotels, setAllHotels] = useState([]);
  const [hotels, setHotels] = useState([]);
  
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    stars: [],
    amenities: []
  });

  const amenitiesList = ['WiFi', 'Pool', 'Parking', 'AC', 'Gym'];

  useEffect(() => {
    api.get('/hotels/')
      .then(res => {
        setAllHotels(res.data);
        setHotels(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleStarChange = (star) => {
    setFilters(prev => ({
      ...prev,
      stars: prev.stars.includes(star) 
        ? prev.stars.filter(s => s !== star)
        : [...prev.stars, star]
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    let filtered = [...allHotels];

    if (filters.minPrice) {
      filtered = filtered.filter(h => h.price_per_night >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(h => h.price_per_night <= Number(filters.maxPrice));
    }
    if (filters.stars.length > 0) {
      filtered = filtered.filter(h => filters.stars.includes(h.star_rating));
    }
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(h => {
        const hAmenities = h.amenities ? (typeof h.amenities === 'string' ? h.amenities.toLowerCase() : JSON.stringify(h.amenities).toLowerCase()) : '';
        return filters.amenities.every(a => hAmenities.includes(a.toLowerCase()));
      });
    }

    setHotels(filtered);
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen pt-28 pb-16 px-6 md:px-16 lg:px-24">
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <form onSubmit={applyFilters} className="bg-white rounded-2xl p-6 shadow-sm h-fit lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 font-inter">Filters</h2>
            
            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Price Range (₹)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={filters.minPrice}
                  onChange={e => setFilters({...filters, minPrice: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={filters.maxPrice}
                  onChange={e => setFilters({...filters, maxPrice: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Star Rating</label>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(star => (
                  <label key={star} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={filters.stars.includes(star)}
                      onChange={() => handleStarChange(star)}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <div className="flex items-center text-yellow-500 text-sm">
                      {Array.from({ length: star }).map((_, i) => (
                        <FaStar key={i} />
                      ))}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">Amenities</label>
              <div className="space-y-2 text-sm text-gray-600 font-inter">
                {amenitiesList.map(amenity => (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={filters.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition font-inter">
              Apply Filters
            </button>
          </form>
        </div>

        {/* Right Results */}
        <div className="flex-1">
          <p className="text-gray-500 mb-4 text-sm font-inter">Showing {hotels.length} properties</p>
          
          <div className="space-y-4">
            {hotels.map(hotel => (
              <div key={hotel.id} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row gap-0 mb-4 hover:shadow-lg transition">
                <img 
                  src={hotel.image_url} 
                  alt={hotel.name} 
                  className="w-full md:w-64 h-48 object-cover shrink-0"
                  onError={(e) => e.target.src = fallbackImg}
                />
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-gray-800 font-inter">{hotel.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm">
                        {Array.from({ length: hotel.star_rating }).map((_, i) => (
                          <FaStar key={i} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-2 font-inter">
                      <FiMapPin /> {hotel.city}, {hotel.state}
                    </div>
                    <p className="text-gray-600 text-sm mt-3 line-clamp-2 font-inter">
                      {hotel.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-yellow-600 text-2xl font-bold font-inter">
                      ₹{hotel.price_per_night.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ night</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/hotel/${hotel.id}`)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-semibold transition font-inter"
                    >
                      View Rooms
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
