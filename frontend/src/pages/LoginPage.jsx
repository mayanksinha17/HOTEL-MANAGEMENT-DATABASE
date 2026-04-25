import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', isAdmin: false });

  const fallbackImg = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200';

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const u = await login(form.email, form.password);
        toast.success('Logged in successfully!');
        navigate(u.is_admin ? '/admin' : '/dashboard');
      } else {
        const u = await register(form.name, form.email, form.phone, form.password, form.isAdmin);
        toast.success('Registered successfully!');
        navigate(u.is_admin ? '/admin' : '/dashboard');
      }
    } catch (err) {
      toast.error(isLogin ? 'Login failed' : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      
      {/* Left half - Image */}
      <div className="hidden md:block w-1/2 relative bg-gray-900">
        <img 
          src={fallbackImg} 
          alt="Luxury Hotel" 
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => e.target.src = fallbackImg}
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12 text-white">
          <h2 className="font-playfair text-5xl font-bold mb-4">Welcome Back</h2>
          <p className="font-inter text-lg text-gray-200">Discover premium hotels and create unforgettable memories.</p>
        </div>
      </div>

      {/* Right half - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-10 min-h-screen">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-8">
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mb-2">LuxeStay</h2>
          </div>

          <div className="flex mb-8 bg-gray-100 rounded-xl p-1 font-inter">
            <button 
              onClick={() => setIsLogin(true)} 
              className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${isLogin ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)} 
              className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${!isLogin ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={isLogin ? 'login' : 'register'} 
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }} 
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {!isLogin && (
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      name="name" 
                      type="text" 
                      placeholder="Full Name" 
                      value={form.name} 
                      onChange={handleChange} 
                      required={!isLogin} 
                      className="w-full border border-gray-300 rounded-lg pl-11 pr-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition font-inter" 
                    />
                  </div>
                )}

                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="Email Address" 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                    className="w-full border border-gray-300 rounded-lg pl-11 pr-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition font-inter" 
                  />
                </div>

                {!isLogin && (
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      name="phone" 
                      type="tel" 
                      placeholder="Phone (optional)" 
                      value={form.phone} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-lg pl-11 pr-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition font-inter" 
                    />
                  </div>
                )}

                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Password" 
                    value={form.password} 
                    onChange={handleChange} 
                    required 
                    minLength={6} 
                    className="w-full border border-gray-300 rounded-lg pl-11 pr-11 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition font-inter" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>

                {!isLogin && (
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="isAdmin" 
                      name="isAdmin"
                      checked={form.isAdmin}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 w-4 h-4"
                    />
                    <label htmlFor="isAdmin" className="text-sm text-gray-600 font-inter cursor-pointer">
                      Register as Administrator
                    </label>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg font-semibold transition mt-2 flex items-center justify-center gap-2 font-inter"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    isLogin ? 'Sign In' : 'Register'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center font-inter">
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-gray-500 hover:text-yellow-600 text-sm transition"
                >
                  {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
                </button>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
