import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 px-6 md:px-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-playfair text-2xl font-bold text-yellow-600 mb-4">LuxeStay</h3>
          <p className="text-gray-400 text-sm font-inter leading-relaxed">
            Premium hotel booking platform offering the best stays across the world. Your comfort is our priority.
          </p>
        </div>
        <div>
          <h4 className="font-inter text-lg font-semibold mb-4 text-gray-200">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400 font-inter">
            <li><Link to="/" className="hover:text-yellow-500 cursor-pointer transition">Home</Link></li>
            <li><Link to="/search" className="hover:text-yellow-500 cursor-pointer transition">Search Hotels</Link></li>
            <li><Link to="/dashboard" className="hover:text-yellow-500 cursor-pointer transition">My Bookings</Link></li>
            <li><Link to="/login" className="hover:text-yellow-500 cursor-pointer transition">Login / Register</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-inter text-lg font-semibold mb-4 text-gray-200">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-400 font-inter">
            <li>123 Luxury Ave, NY 10001</li>
            <li>+1 (555) 123-4567</li>
            <li>support@luxestay.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400 text-sm font-inter">
        &copy; {new Date().getFullYear()} LuxeStay. All rights reserved.
      </div>
    </footer>
  );
}
