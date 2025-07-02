import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  HeartHandshake, 
  AlertCircle, 
  Gift,  
  Target,
  CheckCircle,
  XCircle,
  Sparkles,
  Award,
  TrendingUp,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Package
} from 'lucide-react';
import { useFoodSharingContext } from '../hooks/useFoodSharing';

const MatchCard = ({ match, user, handleUpdateMatchStatus, onCardExpand, isExpanded, cardIndex }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isNewMatch, setIsNewMatch] = useState(false);

  useEffect(() => {
    // Check if match is less than 24 hours old
    if (new Date(match.match_date) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      setIsNewMatch(true);
    }
  }, [match.match_date]);

  const handleStatusUpdate = async (status) => {
    setIsUpdating(true);
    await handleUpdateMatchStatus(match.match_id, status);
    setIsUpdating(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'completed': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-red-700 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Target className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
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
      {/* New Match Indicator */}
      {isNewMatch && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-400 rounded-full animate-pulse">
          <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping"></div>
        </div>
      )}

      <div className="p-6 cursor-pointer" onClick={() => onCardExpand(match.match_id)}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {match.donation_title}
            </h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(match.match_status)}`}>
              {getStatusIcon(match.match_status)}
              <span className="ml-2">{match.match_status.charAt(0).toUpperCase() + match.match_status.slice(1)}</span>
            </div>
          </div>
          <div className="ml-4 text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <HeartHandshake className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            </div>
            <span className="text-xs text-gray-500 mt-1 font-medium">+50 XP</span>
          </div>
        </div>

        {/* Quick Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Package className="w-4 h-4 text-gray-400" />
            <span>{match.donation_quantity}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{new Date(match.match_date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-100 animate-fadeIn">
            {/* Pickup Address */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>Pickup Location</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">{match.donation_pickup_address}</p>
            </div>

            {/* Contact Information */}
            {user.user_id === match.donor_id && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Recipient Details</span>
                </div>
                <p className="text-sm text-gray-900 ml-6">{match.recipient_name}</p>
                {match.recipient_phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 ml-6">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{match.recipient_phone}</span>
                  </div>
                )}
                {match.recipient_email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 ml-6">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span>{match.recipient_email}</span>
                  </div>
                )}
              </div>
            )}
            
            {user.user_id === match.recipient_id && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Donor Details</span>
                </div>
                <p className="text-sm text-gray-900 ml-6">{match.donor_name}</p>
                {match.donor_phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 ml-6">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{match.donor_phone}</span>
                  </div>
                )}
                {match.donor_email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 ml-6">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span>{match.donor_email}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {match.match_status === 'scheduled' && (user.user_id === match.donor_id || user.user_id === match.recipient_id) && (
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate('completed');
                  }}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Complete (+100 XP)</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate('canceled');
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

const StatsCard = ({ icon: Icon, title, value, subtitle }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-600" />
      </div>
    </div>
  </div>
);

const ProgressBar = ({ current, total, label }) => {
  const percentage = Math.min((current / total) * 100, 100);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">{label}</h3>
        <span className="text-sm font-medium text-gray-600">{current} of {total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-3">
        {percentage >= 100 ? "🎉 Goal achieved! Great work!" : `${(total - current)} more to reach your goal`}
      </p>
    </div>
  );
};

const EmptyState = () => (
  <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <Gift className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches yet</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      Start donating or requesting food to create your first match and begin earning XP!
    </p>
    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
      <Sparkles className="w-4 h-4 mr-2" />
      Get Started
    </button>
  </div>
);

const MatchesPage = () => {
  const { user } = useFoodSharingContext();
  const [userMatches, setUserMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [userStats, setUserStats] = useState({
    totalMatches: 0,
    completedMatches: 0,
    activeMatches: 0,
    totalXP: 0
  });

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user || !user.user_id) {
        setLoading(false);
        setError("User not logged in.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const matchesRes = await axios.get(`http://localhost:4000/api/users/${user.user_id}/matches`);
        const matches = matchesRes.data;
        setUserMatches(matches);
        
        // Calculate stats
        const completed = matches.filter(m => m.match_status === 'completed').length;
        const active = matches.filter(m => m.match_status === 'scheduled').length;
        setUserStats({
          totalMatches: matches.length,
          completedMatches: completed,
          activeMatches: active,
          totalXP: completed * 100 + active * 50 + matches.length * 25
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching matches:', err.message, err.stack);
        setError('Failed to load matches: ' + (err.response?.data?.error || err.message));
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user]);

  const handleUpdateMatchStatus = async (matchId, status) => {
  if (!user?.user_id) {
    setError('You must be logged in to update match status.');
    return;
  }

  console.log('Updating match:', { matchId, status, user_id: user.user_id }); // Debug log
    try {
      setError(null);
      const response = await axios.put(`http://localhost:4000/api/matches/${matchId}/status`, {
        status,
        user_id: user.user_id,
      });
      console.log('Match status updated:', response.data);

      // Refresh matches
      const matchesRes = await axios.get(`http://localhost:4000/api/users/${user.user_id}/matches`);
      const matches = matchesRes.data;
      setUserMatches(matches);

      // Update stats
      const completed = matches.filter(m => m.match_status === 'completed').length;
      const active = matches.filter(m => m.match_status === 'scheduled').length;
      setUserStats({
        totalMatches: matches.length,
        completedMatches: completed,
        activeMatches: active,
        totalXP: completed * 100 + active * 50 + matches.length * 25
      });

      alert(`Match status updated to ${status} successfully!`);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Error updating match status:', errorMessage, err.stack);
      setError(`Failed to update match status: ${errorMessage}`);
      alert(`Failed to update match status: ${errorMessage}`);
    }
  };

  const handleCardExpand = (matchId) => {
    setExpandedCard(expandedCard === matchId ? null : matchId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading matches...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <HeartHandshake className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Matches</h1>
          </div>
          <p className="text-gray-600">
            Track your food sharing activities and earn XP by completing matches
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            icon={Award} 
            title="Total XP" 
            value={userStats.totalXP}
            subtitle="Points earned"
          />
          <StatsCard 
            icon={Target} 
            title="Active Matches" 
            value={userStats.activeMatches}
            subtitle="In progress"
          />
          <StatsCard 
            icon={CheckCircle} 
            title="Completed" 
            value={userStats.completedMatches}
            subtitle="Successfully done"
          />
          <StatsCard 
            icon={TrendingUp} 
            title="Total Matches" 
            value={userStats.totalMatches}
            subtitle="All time"
          />
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar 
            current={userStats.completedMatches} 
            total={Math.max(userStats.completedMatches + 5, 10)} 
            label="Monthly Goal" 
          />
        </div>

        {/* Matches Grid */}
        {userMatches.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userMatches.map((match, index) => (
              <MatchCard
                key={match.match_id}
                match={match}
                user={user}
                handleUpdateMatchStatus={handleUpdateMatchStatus}
                onCardExpand={handleCardExpand}
                isExpanded={expandedCard === match.match_id}
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

export default MatchesPage;