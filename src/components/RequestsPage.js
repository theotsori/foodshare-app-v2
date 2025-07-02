import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardCheck } from 'lucide-react';
import { useFoodSharingContext } from '../hooks/useFoodSharing';

const EmptyState = ({ message }) => (
  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100 text-gray-500 text-md">
    <p>{message}</p>
  </div>
);

const RequestCard = ({ request, user, handleUpdateRequestStatus }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
    <h5 className="font-semibold text-lg text-gray-800 mb-1">Request for: {request.donation_title}</h5>
    <p className="text-sm text-gray-600 mb-1">Quantity: <span className="font-medium">{request.donation_quantity}</span></p>
    <p className="text-sm text-gray-600 mb-1">Preferred Pickup: <span className="font-medium">{request.pickup_time_preference}</span></p>
    {request.notes && <p className="text-sm text-gray-600 mb-2">Notes: <span className="font-medium">{request.notes}</span></p>}
    <p className={`text-sm font-semibold mt-1 ${
      request.request_status === 'pending' ? 'text-blue-600' :
      request.request_status === 'accepted' ? 'text-green-600' :
      'text-red-600'
    }`}>
      Status: {request.request_status.charAt(0).toUpperCase() + request.request_status.slice(1)}
    </p>
    {request.donor_id === user.user_id && request.request_status === 'pending' && (
      <div className="flex space-x-2 mt-4">
        <button
          onClick={() => handleUpdateRequestStatus(request.request_id, 'accepted')}
          className="flex-1 px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Accept
        </button>
        <button
          onClick={() => handleUpdateRequestStatus(request.request_id, 'rejected')}
          className="flex-1 px-3 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Reject
        </button>
      </div>
    )}
    {request.requester_id === user.user_id && (
      <p className="text-xs text-gray-500 mt-2">Requested from: <span className="font-medium">{request.donor_name} ({request.donor_email})</span></p>
    )}
    {request.donor_id === user.user_id && (
      <p className="text-xs text-gray-500 mt-2">Requested by: <span className="font-medium">{request.requester_name} ({request.requester_email})</span></p>
    )}
  </div>
);

const RequestsPage = () => {
  const { user, setCurrentView } = useFoodSharingContext();
  const [userRequests, setUserRequests] = useState([]);
  const [userDonations, setUserDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.user_id) {
        setLoading(false);
        setError("User not logged in.");
        setCurrentView('login');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const requestsRes = await axios.get(`http://localhost:4000/api/users/${user.user_id}/requests`);
        setUserRequests(requestsRes.data);
        const donationsRes = await axios.get(`http://localhost:4000/api/users/${user.user_id}/donations`);
        setUserDonations(donationsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching requests:', err.message, err.stack);
        setError('Failed to load requests: ' + (err.response?.data?.error || err.message));
        setLoading(false);
      }
    };

    fetchData();
  }, [user, setCurrentView]);

  const handleUpdateRequestStatus = async (requestId, status) => {
    try {
      await axios.put(`http://localhost:4000/api/requests/${requestId}/status`, {
        status,
        donor_id: user.user_id
      });
      const requestsRes = await axios.get(`http://localhost:4000/api/users/${user.user_id}/requests`);
      setUserRequests(requestsRes.data);
      const donationsRes = await axios.get(`http://localhost:4000/api/users/${user.user_id}/donations`);
      setUserDonations(donationsRes.data);
    } catch (err) {
      console.error('Error updating request status:', err.response?.data?.error || err.message);
      alert('Failed to update request status: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-600 text-lg">Loading requests...</div>;
  if (error) return <div className="text-center py-12 text-red-600 text-lg">Error: {error}</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-inter antialiased">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <ClipboardCheck className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">My Requests</h2>
          </div>
          {userRequests.length === 0 ? (
            <EmptyState message="No requests made or received yet." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {userRequests.map((request) => (
                <RequestCard
                  key={request.request_id}
                  request={request}
                  user={user}
                  handleUpdateRequestStatus={handleUpdateRequestStatus}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;