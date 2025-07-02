import React, { useState, useEffect } from 'react';
import { X, UserIcon, Package, MapPin, Clock } from 'lucide-react';
import axios from 'axios';
import { useFoodSharingContext } from '../hooks/useFoodSharing';

const RequestModal = ({ setShowModal, donationId }) => {
  const { user } = useFoodSharingContext();
  const [donation, setDonation] = useState(null);
  const [formData, setFormData] = useState({
    pickup_time_preference: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    const fetchDonationDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:4000/api/donations/${donationId}`);
        setDonation(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching donation details:', err.message, err.stack);
        setError('Failed to load donation details: ' + (err.response?.data?.error || err.message));
        setLoading(false);
      }
    };

    if (donationId) {
      fetchDonationDetails();
    }
  }, [donationId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (!user || !user.user_id) {
        throw new Error("User not logged in or user ID is missing.");
      }
      if (!donation) {
        throw new Error("Donation details not loaded.");
      }

      await axios.post('http://localhost:4000/api/requests', {
        user_id: user.user_id, // Recipient's user_id
        donation_id: donation.donation_id, // Donation's UUID
        pickup_time_preference: formData.pickup_time_preference,
        notes: formData.notes,
      });
      setRequestSuccess(true);
      setShowModal('success'); // Re-use the existing success toast
    } catch (err) {
      console.error('Error submitting request:', err.message, err.stack);
      setError('Failed to submit request: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 font-inter animate-fade-in">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-in text-center">
          Loading donation details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 font-inter animate-fade-in">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-in text-center text-red-600">
          <p>Error: {error}</p>
          <button onClick={() => setShowModal(null)} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg">Close</button>
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 font-inter animate-fade-in">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-in text-center">
          Donation not found or invalid ID.
          <button onClick={() => setShowModal(null)} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 font-inter animate-fade-in">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform scale-95 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Request Food Donation</h2>
          <button
            onClick={() => setShowModal(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
            {error}
          </div>
        )}
        {requestSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
            Request submitted successfully!
          </div>
        )}

        <div className="space-y-5">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 shadow-inner">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">{donation.title}</h3>
            <p className="text-sm text-gray-600 mb-2 flex items-center space-x-1">
              <Package className="h-4 w-4 text-gray-500" />
              <span>Quantity: {donation.quantity}</span>
            </p>
            <p className="text-sm text-gray-600 mb-2 flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>Pickup: {donation.pickup_address}</span>
            </p>
            <p className="text-sm text-gray-600 mb-2 flex items-center space-x-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Expires: {new Date(donation.expiry_date).toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-600 flex items-center space-x-1">
              <UserIcon className="h-4 w-4 text-gray-500" />
              <span>Donor: {donation.donor_name}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Pickup Time/Method</label>
              <input
                type="text"
                name="pickup_time_preference"
                value={formData.pickup_time_preference}
                onChange={handleChange}
                placeholder="e.g., 'Tomorrow 10 AM', 'Anytime before expiry'"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes for Donor</label>
              <textarea
                rows="3"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special requirements or notes for the donor..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-shadow shadow-sm"
              ></textarea>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(null)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors duration-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-colors duration-200 shadow-sm"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;