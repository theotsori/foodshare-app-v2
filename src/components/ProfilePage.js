import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Star, Mail, Settings, Phone, User as UserIcon, LayoutList, MessageSquare
} from 'lucide-react';
import { useFoodSharingContext } from '../hooks/useFoodSharing';

const ProfilePage = () => {
  const { user, userRole, setUser, setUserRole, setCurrentView } = useFoodSharingContext();
  const [userDonations, setUserDonations] = useState([]);
  const [userFeedback, setUserFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('donations');

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.user_id) {
        setLoading(false);
        setError("User not logged in.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const donationsRes = await axios.get(`http://localhost:4000/api/users/${user.user_id}/donations`);
        setUserDonations(donationsRes.data);

        const feedbackRes = await axios.get(`http://localhost:4000/api/users/${user.user_id}/feedback`);
        setUserFeedback(feedbackRes.data);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err.message, err.stack);
        setError('Failed to load profile data: ' + (err.response?.data?.error || err.message));
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setUserRole(null);
    setCurrentView('login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'donor': return 'bg-green-50 text-green-700 ring-1 ring-green-600/20';
      case 'recipient': return 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20';
      case 'admin': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20';
      default: return 'bg-gray-50 text-gray-700 ring-1 ring-gray-600/20';
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-600 text-lg">Loading profile...</div>;
  if (error) return <div className="text-center py-12 text-red-600 text-lg">Error: {error}</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-inter antialiased">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-28 h-28 mx-auto mb-4 bg-gradient-to-br from-green-200 to-blue-200 rounded-full flex items-center justify-center overflow-hidden shadow-lg border-4 border-white ring-4 ring-green-100">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=c0a7f3,b6e3f4,ffd5dc`}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1">{user?.name}</h2>
          <p className={`text-gray-700 capitalize text-sm sm:text-base mb-4 px-3 py-1.5 rounded-full inline-block font-medium ${getRoleBadgeColor(userRole)}`}>
            {userRole}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-gray-600 text-sm">
            <div className="flex items-center space-x-1">
              <Mail className="h-4 w-4 text-gray-500" /> <span>{user?.email}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4 text-gray-500" /> <span>{user?.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-wrap border-b border-gray-100 bg-gray-50 sm:flex-nowrap">
            <TabButton icon={LayoutList} label="Donations" active={activeTab === 'donations'} onClick={() => setActiveTab('donations')} />
            <TabButton icon={MessageSquare} label="Feedback" active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} />
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {activeTab === 'donations' && (
              <Section title="My Donations">
                {userDonations.length === 0 ? (
                  <EmptyState message="No donations posted yet." />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {userDonations.map((d) => (
                      <DonationCard key={d.donation_id} donation={d} />
                    ))}
                  </div>
                )}
              </Section>
            )}

            {activeTab === 'feedback' && (
              <Section title="My Feedback">
                {userFeedback.length === 0 ? (
                  <EmptyState message="No feedback given or received yet." />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                    {userFeedback.map((f) => (
                      <FeedbackCard key={f.feedback_id} feedback={f} />
                    ))}
                  </div>
                )}
              </Section>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Settings & Support</h3>
          <SettingButton icon={Settings} label="Account Settings" />
          <SettingButton icon={LayoutList} label="Terms & Privacy" />
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-red-600 transition-colors duration-200 shadow-md flex items-center justify-center space-x-2 text-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <UserIcon className="h-5 w-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

const TabButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    className={`flex-1 flex items-center justify-center py-3 px-2 sm:px-4 text-center font-medium text-sm sm:text-base transition-all duration-200
      ${active
        ? 'text-green-600 border-b-2 border-green-600 bg-white'
        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-b-2 border-transparent'
      }
      first:rounded-tl-2xl last:rounded-tr-2xl sm:first:rounded-tr-none sm:last:rounded-bl-none
      flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2
    `}
    onClick={onClick}
  >
    <Icon className="h-5 w-5 sm:h-4 sm:w-4" />
    <span>{label}</span>
  </button>
);

const Section = ({ title, children }) => (
  <div className="space-y-4">
    <h4 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2 border-gray-100">{title}</h4>
    {children}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100 text-gray-500 text-md">
    <p>{message}</p>
  </div>
);

const DonationCard = ({ donation: d }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
    <h5 className="font-semibold text-lg text-gray-800 mb-1">{d.title}</h5>
    <p className="text-sm text-gray-600 mb-1">Quantity: <span className="font-medium">{d.quantity}</span></p>
    <p className={`text-sm font-semibold mb-2 ${
      d.status === 'available' ? 'text-green-600' : d.status === 'claimed' ? 'text-orange-600' : 'text-gray-600'
    }`}>
      Status: {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
    </p>
    <p className="text-xs text-gray-500">Expires: {new Date(d.expiry_date).toLocaleDateString()}</p>
  </div>
);

const FeedbackCard = ({ feedback: f }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
    <p className="font-semibold text-gray-800 flex items-center mb-2">
      Rating: {Array.from({ length: f.rating }).map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-current ml-1" />)}
      {Array.from({ length: 5 - f.rating }).map((_, i) => <Star key={i + f.rating} className="h-4 w-4 text-gray-300 ml-1" />)}
    </p>
    <p className="text-sm text-gray-700 mb-1">Comment: <span className="font-normal">{f.comment || 'N/A'}</span></p>
    <p className="text-xs text-gray-500 mt-2">
      For match on "<span className="font-medium">{f.donation_title}</span>" between <span className="font-medium">{f.donor_name}</span> and <span className="font-medium">{f.recipient_name}</span>
    </p>
    <p className="text-xs text-gray-500">
      Posted on: {new Date(f.created_at).toLocaleDateString()}
    </p>
  </div>
);

const SettingButton = ({ icon: Icon, label }) => (
  <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
    <div className="flex items-center space-x-4">
      <div className="p-2 bg-gray-100 rounded-lg">
        <Icon className="h-5 w-5 text-gray-600" />
      </div>
      <span className="font-medium text-gray-800 text-base">{label}</span>
    </div>
  </button>
);

export default ProfilePage;