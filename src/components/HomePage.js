// src/components/HomePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Clock, Filter, X, Search, Utensils, Building, Package, ChevronDown } from 'lucide-react';
import { useFoodSharingContext } from '../hooks/useFoodSharing';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Reusable DonationCard component
const DonationCard = ({ donation, onRequest }) => {
  const { title, description, quantity, expiry_date, pickup_address, donor_name, status } = donation;
  const { user } = useFoodSharingContext();

  const getCategoryDisplay = (categoryName) => {
    switch (categoryName?.toLowerCase()) {
      case 'fruits': return { icon: <Utensils className="h-10 w-10 text-orange-400" />, emoji: '🍎', color: 'from-orange-100 to-orange-200' };
      case 'fresh produce': return { icon: <Utensils className="h-10 w-10 text-green-500" />, emoji: '🥕', color: 'from-green-100 to-green-200' };
      case 'bakery': return { icon: <Building className="h-10 w-10 text-yellow-500" />, emoji: '🍞', color: 'from-yellow-100 to-yellow-200' };
      case 'dairy': return { icon: <Package className="h-10 w-10 text-blue-400" />, emoji: '🥛', color: 'from-blue-100 to-blue-200' };
      case 'cooked meals': return { icon: <Utensils className="h-10 w-10 text-red-400" />, emoji: '🍲', color: 'from-red-100 to-red-200' };
      default: return { icon: <Package className="h-10 w-10 text-gray-500" />, emoji: '📦', color: 'from-gray-100 to-gray-200' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Available</span>;
      case 'requested':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Requested</span>;
      case 'matched':
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Matched</span>;
      case 'completed':
        return <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Completed</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  const categoryDisplay = getCategoryDisplay(donation.category_name);

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full animate-fade-in">
      {/* Category Icon & Expiry */}
      <div className={`relative p-4 flex justify-between items-center ${categoryDisplay.color} bg-opacity-70`}>
        <div className="flex items-center space-x-2">
          {/*categoryDisplay.icon*/}
          <span className="text-xl font-bold text-gray-800">{categoryDisplay.emoji} {donation.category_name}</span>
        </div>
        <div className="flex items-center text-gray-600 text-sm font-medium">
          <Clock className="h-4 w-4 mr-1 text-gray-500" />
          <span>Expires: {new Date(expiry_date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Donation Image (Placeholder) */}
      <div className="flex-shrink-0 bg-gray-100 h-48 overflow-hidden flex items-center justify-center">
        {donation.photo_url ? (
          <img
            src={donation.photo_url}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x250?text=No+Image'; }}
          />
        ) : (
          <span className="text-gray-400 text-sm">No Image Available</span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{description}</p>
        <div className="flex items-center justify-between text-sm text-gray-700 mb-3">
          <div className="flex items-center space-x-1">
            <Package className="h-4 w-4 text-gray-500" />
            <span>Quantity: <span className="font-semibold">{quantity}</span></span>
          </div>
          {getStatusBadge(status)}
        </div>

        <div className="flex items-center text-gray-700 text-sm mb-4">
          <MapPin className="h-4 w-4 mr-1 text-gray-500 flex-shrink-0" />
          <span className="truncate">{pickup_address}</span>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-600">Donor: <span className="font-bold text-gray-700">{donor_name}</span></span>
        </div>
        {user?.role === 'recipient' && donation.status === 'available' && (
          <button
            onClick={() => onRequest(donation.donation_id)}
            className="mt-4 w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Request Donation
          </button>
        )}
        {user?.role === 'donor' && donation.status === 'available' && (
            <div className="mt-4 w-full bg-gray-600 text-gray-100 py-3 px-4 rounded-xl font-semibold text-center cursor-not-allowed">
                {donor_name}'s Donation
            </div>
        )}
        {donation.status !== 'available' && (user?.role === 'recipient' || user?.role === 'donor') && (
            <div className="mt-4 w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold text-center cursor-not-allowed shadow-inner">
               {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
            </div>
        )}
      </div>
    </div>
  );
};

// SearchFilter component remains the same
const SearchFilter = ({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, categories }) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-gray-100 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in">
      {/* Search Input */}
      <div className="relative flex-grow w-full sm:w-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search donations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-400 shadow-sm transition-all duration-200 text-gray-700 placeholder-gray-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="relative w-full sm:w-auto">
        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-400 shadow-sm appearance-none bg-white transition-all duration-200 text-gray-700"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.category_id} value={category.category_id}>
              {category.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

const HomePage = () => {
  const { setShowModal, user, categories } = useFoodSharingContext();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userLocation, setUserLocation] = useState(null); // State for user's actual geo location

  // Get user's current geolocation on mount (optional, for more dynamic results)
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          console.warn(`Geolocation error (${err.code}): ${err.message}`);
          // Fallback to user's registered location if geo fails
          if (user?.location?.latitude && user?.location?.longitude) {
            setUserLocation({
              latitude: user.location.latitude,
              longitude: user.location.longitude,
            });
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
      // Fallback to user's registered location if geo not supported
      if (user?.location?.latitude && user?.location?.longitude) {
        setUserLocation({
          latitude: user.location.latitude,
          longitude: user.location.longitude,
        });
      }
    }
  }, [user]); // Re-run if user object changes (e.g., after login)

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      setError(null);
      try {
        let apiUrl = 'http://localhost:4000/api/donations';
        const params = new URLSearchParams();

        if (searchTerm) {
          params.append('search', searchTerm);
        }
        if (selectedCategory !== 'all') {
          params.append('category_id', selectedCategory);
        }
        if (userLocation?.latitude && userLocation?.longitude) {
          params.append('latitude', userLocation.latitude);
          params.append('longitude', userLocation.longitude);
        }

        if (params.toString()) {
          apiUrl += `?${params.toString()}`;
        }

        const response = await axios.get(apiUrl);
        setDonations(response.data);
      } catch (err) {
        console.error("Failed to fetch donations:", err);
        setError("Failed to load donations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [searchTerm, selectedCategory, userLocation]); // Re-fetch when filters or location change

  const handleRequestDonation = (donationId) => {
    if (!user) {
      alert("Please log in to request a donation.");
      // setCurrentView('login'); // Redirect to login if not authenticated
      return;
    }
    setShowModal({ type: 'request', donationId: donationId });
  };

  if (loading) {
    return (
      <div className="space-y-8 p-4 sm:p-0">
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => ( // Show 6 skeleton cards
            <div key={i} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden h-96">
              <Skeleton height={192} className="w-full" /> {/* Image placeholder */}
              <div className="p-5 space-y-3">
                <Skeleton height={24} width="80%" /> {/* Title */}
                <Skeleton height={16} count={2} /> {/* Description */}
                <Skeleton height={16} width="60%" /> {/* Quantity/Expiry */}
                <Skeleton height={16} width="90%" /> {/* Address */}
                <Skeleton height={40} /> {/* Button */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-red-50 rounded-3xl shadow-lg border border-red-200 animate-fade-in flex flex-col items-center justify-center">
        <X className="h-24 w-24 mx-auto mb-6 text-red-400 stroke-1" />
        <p className="text-2xl font-bold text-red-700 mb-3">Oops! Something went wrong.</p>
        <p className="text-md text-red-600 max-w-md">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()} // Simple retry for now
          className="mt-6 bg-red-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-inter p-4 sm:p-0">
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />
      {donations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-lg border border-gray-100 animate-fade-in flex flex-col items-center">
          <Utensils className="h-24 w-24 mx-auto mb-6 text-gray-300 stroke-1" />
          <p className="text-2xl font-bold text-gray-700">No donations found nearby</p>
          <p className="text-md mt-3 text-gray-600 max-w-md">
            It looks like there aren't any available donations in your area right now.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your search or filters, or check back later for new listings!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <DonationCard
              key={donation.donation_id}
              donation={donation}
              onRequest={handleRequestDonation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;