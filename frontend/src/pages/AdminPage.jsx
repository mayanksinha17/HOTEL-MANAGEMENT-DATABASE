import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiHome, FiGrid, FiList, FiUsers } from 'react-icons/fi';
import api from '../api/axios';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = () => {
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
    } else {
      // Rooms or others not strictly defined in backend GET all API, simulate or skip
      setDataList([]);
      setLoading(false);
    }
  };

  const navLinks = ['Dashboard', 'Hotels', 'Rooms', 'Bookings'];

  const renderDashboard = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="text-3xl font-bold text-yellow-600 font-inter">{stats?.total_bookings || 0}</div>
        <div className="text-gray-500 text-sm mt-1 font-inter">Total Bookings</div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="text-3xl font-bold text-yellow-600 font-inter">₹{stats?.total_revenue?.toLocaleString() || 0}</div>
        <div className="text-gray-500 text-sm mt-1 font-inter">Total Revenue</div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="text-3xl font-bold text-yellow-600 font-inter">{stats?.occupancy_rate || 0}%</div>
        <div className="text-gray-500 text-sm mt-1 font-inter">Occupancy Rate</div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="text-3xl font-bold text-yellow-600 font-inter">{stats?.total_hotels || 0}</div>
        <div className="text-gray-500 text-sm mt-1 font-inter">Total Hotels</div>
      </div>
    </div>
  );

  const renderTable = () => (
    <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm uppercase font-inter tracking-wider">
              <th className="py-4 px-6 font-semibold">ID</th>
              <th className="py-4 px-6 font-semibold">Name / Details</th>
              <th className="py-4 px-6 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length === 0 ? (
              <tr><td colSpan="3" className="py-8 text-center text-gray-500 font-inter">No data available.</td></tr>
            ) : (
              dataList.map(item => (
                <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-4 px-6 text-gray-800 font-inter text-sm">#{item.id}</td>
                  <td className="py-4 px-6 text-gray-800 font-inter text-sm">
                    {activeTab === 'Hotels' ? item.name : activeTab === 'Bookings' ? `${item.hotel_name} - ${item.room_type}` : item.name || 'Detail'}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <button className="text-blue-600 hover:underline mr-4 font-inter">Edit</button>
                    <button className="text-red-500 hover:underline font-inter">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 pt-16">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col p-6 hidden md:flex shrink-0 h-[calc(100vh-64px)] sticky top-16">
        <div className="text-yellow-600 font-playfair text-2xl font-bold mb-8">Admin Panel</div>
        
        <div className="flex flex-col gap-2 flex-1">
          {navLinks.map(link => (
            <div 
              key={link}
              onClick={() => setActiveTab(link)}
              className={`flex items-center gap-3 py-3 px-4 rounded-lg cursor-pointer transition font-inter text-sm ${activeTab === link ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
            >
              {link === 'Dashboard' && <FiGrid />}
              {link === 'Hotels' && <FiHome />}
              {link === 'Rooms' && <FiList />}
              {link === 'Bookings' && <FiUsers />}
              {link}
            </div>
          ))}
        </div>
        
        <div 
          onClick={() => logout()}
          className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-gray-800 cursor-pointer transition font-inter text-red-400 text-sm mt-auto"
        >
          <FiLogOut /> Logout
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-8">{activeTab}</h1>
        
        {loading ? (
          <div className="text-gray-500 animate-pulse font-inter">Loading {activeTab}...</div>
        ) : (
          activeTab === 'Dashboard' ? renderDashboard() : renderTable()
        )}
      </div>
    </div>
  );
}
