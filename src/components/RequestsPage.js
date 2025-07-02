import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClipboardCheck, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Package, 
  MessageSquare,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useFoodSharingContext } from '../hooks/useFoodSharing';

const EmptyState = ({ message }) => (
  <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <ClipboardCheck className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests yet</h3>
    <p className="text-gray-600 max-w-md mx-auto">{message}</p>
  </div>
);

const RequestCard = ({ request, user, handleUpdateRequestStatus, onCardExpand, isExpanded, cardIndex }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status) => {
    setIsUpdating(true);
    await handleUpdateRequestStatus(request.request_id, status);
    setIsUpdating(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'accepted': return 'text-green-700 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div 
      className={`group relative bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg ${
        isExpanded ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      } ${isUpdating ? 'opacity-50' : ''}`}
      style={{ 
        animationDelay: `${cardIndex * 100}ms`,
        animation: 'slideUp 0.5s ease-out forwards'
      }}
    >
      <div className="p-6 cursor-pointer" onClick={() => onCardExpand(request.request_id)}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              Request for: {request.donation_title}
            </h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.request_status)}`}>
              {getStatusIcon(request.request_status)}
              <span className="ml-2">{request.request_status.charAt(0).toUpperCase() + request.request_status.slice(1)}</span>
            </div>
          </div>
          <div className="ml-4 text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <ArrowRight className={`w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-all ${isExpanded ? 'rotate-90' : ''}`} />
            </div>
          </div>
        </div>

        {/* Quick Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Package className="w-4 h-4 text-gray-400" />
            <span>{request.donation_quantity}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{request.pickup_time_preference}</span>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-100 animate-fadeIn">
            {/* Notes */}
            {request.notes && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span>Notes</span>
                </div>
                <p className="text-sm text-gray-600 ml-6 bg-gray-50 rounded-lg p-3">{request.notes}</p>
              </div>
            )}

            {/* Contact Information */}
            {request.requester_id === user.user_id && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Donor:</span> 
                  <p className="text-sm text-gray-600 ml-6">{request.donor_name}</p>
                </div> 
              </div>
            )}
            
            {request.donor_id === user.user_id && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Requester Details</span>
                </div>
                <p className="text-sm text-gray-900 ml-6">{request.requester_name}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-600 ml-6">
                  <Mail className="w-3 h-3 text-gray-400" />
                  <span>{request.requester_phone}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {request.donor_id === user.user_id && request.request_status === 'pending' && (
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate('accepted');
                  }}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Accept Request</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate('rejected');
                  }}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RequestsPage = () => {
  const { user, setCurrentView } = useFoodSharingContext();
  const [userRequests, setUserRequests] = useState([]);
  const [userDonations, setUserDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

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

  const handleCardExpand = (requestId) => {
    setExpandedCard(expandedCard === requestId ? null : requestId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-xl border border-gray-200 p-8">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <ClipboardCheck className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Food Requests</h1>
          </div>
          <p className="text-gray-600">
            Manage your food requests and respond to requests from others
          </p>
        </div>

        {/* Requests Grid */}
        {userRequests.length === 0 ? (
          <EmptyState message="No requests made or received yet. Start by making a request or wait for others to request your donations." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userRequests.map((request, index) => (
              <RequestCard
                key={request.request_id}
                request={request}
                user={user}
                handleUpdateRequestStatus={handleUpdateRequestStatus}
                onCardExpand={handleCardExpand}
                isExpanded={expandedCard === request.request_id}
                cardIndex={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default RequestsPage;