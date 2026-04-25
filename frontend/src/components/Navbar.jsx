/**
 * Navbar — premium navigation bar with transparent-to-solid scroll effect.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiLogOut, FiHome, FiGrid } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const navBg = scrolled || !isHome
    ? 'bg-[#0D1B2A] shadow-lg'
    : 'bg-transparent';

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#C9A84C] to-[#A8893D] rounded-xl flex items-center justify-center shadow-lg">
              <FiHome className="text-white text-2xl" />
            </div>
            <span className="text-white font-bold text-3xl tracking-wide drop-shadow-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
              StayLux
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-white/80 hover:text-[#C9A84C] transition-colors text-sm font-medium">
              Home
            </Link>
            <Link to="/search" className="text-white/80 hover:text-[#C9A84C] transition-colors text-sm font-medium">
              Hotels
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                {user.is_admin && (
                  <Link
                    to="/admin"
                    className="text-white/80 hover:text-[#C9A84C] transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    <FiGrid size={14} /> Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="text-white/80 hover:text-[#C9A84C] transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <FiUser size={14} /> {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white/60 hover:text-red-400 transition-colors text-sm flex items-center gap-1"
                >
                  <FiLogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-semibold transition shadow-md">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0D1B2A] border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-3">
              <Link to="/" onClick={() => setMobileOpen(false)} className="block text-white/80 hover:text-[#C9A84C] py-2">Home</Link>
              <Link to="/search" onClick={() => setMobileOpen(false)} className="block text-white/80 hover:text-[#C9A84C] py-2">Hotels</Link>
              {user ? (
                <>
                  {user.is_admin && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="block text-white/80 hover:text-[#C9A84C] py-2">Admin Panel</Link>
                  )}
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block text-white/80 hover:text-[#C9A84C] py-2">Dashboard</Link>
                  <button onClick={handleLogout} className="block text-red-400 py-2">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-semibold transition block text-center mt-2">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
