import React, { useState } from 'react';
import axios from 'axios';
import { Heart, Package, HandHelping, ChevronRight, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useFoodSharingContext } from '../hooks/useFoodSharing';

const LoginPage = () => {
  const { setUser, setUserRole, setCurrentView } = useFoodSharingContext();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '', // This will be password_hash in the backend
    name: '',
    role: 'recipient', // Default role for registration
    phone: '',
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    try {
      // In a real app, you would hash the password on the frontend before sending
      // For this example, sending plain text or a simple hash to match backend's expectation.
      // Make sure your backend securely hashes and compares passwords!
      const response = await axios.post('http://localhost:4000/api/users/login', {
        email: formData.email,
        password_hash: formData.password, // Assuming plain text password for now
      });
      const userData = response.data;
      setUser({
        user_id: userData.user_id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        is_verified: userData.is_verified,
      });
      setUserRole(userData.role);
      setCurrentView('home');
    } catch (err) {
      console.error('Login error:', err.response?.data?.error || err.message);
      setError(err.response?.data?.error || 'Failed to log in. Please check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await axios.post('http://localhost:4000/api/users/register', {
        ...formData,
        password_hash: formData.password,
      });
      setSuccessMessage('Registration successful! Please log in.');
      setIsRegistering(false);
      setFormData({
        email: formData.email,
        password: '',
        name: '', role: 'recipient', phone: '', address: '', latitude: '', longitude: ''
      });
    } catch (err) {
      console.error('Registration error:', err.response?.data?.error || err.message);
      setError(err.response?.data?.error || 'Failed to register.');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-[1.01]">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">FoodShare Connect</h1>
          <p className="text-gray-600 text-lg">Nourishing communities, eliminating waste</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <p className="font-bold">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <p className="font-bold">Success:</p>
            <p className="text-sm">{successMessage}</p>
          </div>
        )}

        {isRegistering ? (
          // Registration Form
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <div>
              <label htmlFor="registerName" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                id="registerName"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="registerEmail"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                id="registerPassword"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="registerPhone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                id="registerPhone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="registerRole" className="block text-sm font-medium text-gray-700 mb-1">I am a:</label>
              <select
                id="registerRole"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="donor">Donor</option>
                <option value="recipient">Recipient</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md"
            >
              Register
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="font-medium text-green-600 hover:text-green-800 transition-colors"
              >
                Log In
              </button>
            </p>
          </form>
        ) : (
          // Login Form
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="loginEmail"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                id="loginPassword"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md"
            >
              Log In
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className="font-medium text-green-600 hover:text-green-800 transition-colors"
              >
                Register Now
              </button>
            </p>
          </form>
        )}
        
      </div>
  );
};

export default LoginPage;