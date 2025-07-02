import React, { useEffect, useRef, useState } from 'react';
import {
  Heart, Bell, User as UserIcon, Home, MapPin, Plus, Check, X,
  HeartHandshake, ClipboardCheck
} from 'lucide-react';
import HomePage from './components/HomePage';
import MapView from './components/MapView';
import ProfilePage from './components/ProfilePage';
import MatchesPage from './components/MatchesPage';
import LoginPage from './components/LoginPage';
import DonateModal from './components/DonateModal';
import RequestModal from './components/RequestModal';
import NotificationsModal from './components/NotificationsModal';
import ProfileDropdown from './components/ProfileDropdown';
import RequestsPage from './components/RequestsPage'; // Import new RequestsPage
import IntroductionScreen from './components/IntroductionScreen';
import { FoodSharingProvider, useFoodSharingContext } from './hooks/useFoodSharing';
import './styles/App.css';

const FoodSharingAppContent = () => {
  const {
    currentView,
    setCurrentView,
    user,
    userRole,
    showModal,
    setShowModal,
    setUser,
    setUserRole,
    unreadNotifications,
    fetchUnreadNotifications,
  } = useFoodSharingContext();
  const navRef = useRef(null);
  const [hasSeenIntroduction, setHasSeenIntroduction] = useState(
    localStorage.getItem('hasSeenFoodShareIntro') === 'true'
  );
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    if (navRef.current) {
      const navHeight = navRef.current.offsetHeight;
      document.querySelector('main').style.paddingBottom = `${navHeight + 16}px`;
    }
  }, []);

  useEffect(() => {
    if (!user && (currentView === 'profile' || currentView === 'matches' || currentView === 'requests')) {
      setCurrentView('login');
    }
  }, [user, currentView, setCurrentView]);

  useEffect(() => {
    if (user && !hasSeenIntroduction) {
      setHasSeenIntroduction(true);
      localStorage.setItem('hasSeenFoodShareIntro', 'true');
    }
    if (user && user.user_id) {
      fetchUnreadNotifications(user.user_id);
    }
  }, [user, hasSeenIntroduction, fetchUnreadNotifications]);

  const handleLogout = () => {
    setUser(null);
    setUserRole(null);
    setCurrentView('login');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
  };

  const handleIntroductionComplete = () => {
    setHasSeenIntroduction(true);
    localStorage.setItem('hasSeenFoodShareIntro', 'true');
    if (!user) {
      setCurrentView('login');
    } else {
      setCurrentView('home');
    }
  };

  const handleProfileClick = () => {
    if (user) {
      setIsProfileDropdownOpen(!isProfileDropdownOpen);
    } else {
      setCurrentView('login');
    }
  };

  if (!hasSeenIntroduction) {
    return <IntroductionScreen onComplete={handleIntroductionComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter antialiased flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 left-0 right-0 z-30 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-7 w-7 text-green-600 fill-current" />
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight">FoodShare</span>
          </div>
          <div className="flex items-center space-x-3 relative">
            {user && (
              <>
                <button
                  onClick={() => setIsNotificationsOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-6 w-6" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleProfileClick}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                  aria-label="Profile"
                >
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=c0a7f3,b6e3f4,ffd5dc`}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-800 hidden sm:block">{user?.name}</span>
                </button>
                <ProfileDropdown
                  isOpen={isProfileDropdownOpen}
                  onClose={() => setIsProfileDropdownOpen(false)}
                  onNavigate={setCurrentView}
                  onLogout={handleLogout}
                />
              </>
            )}
            {!user && (
              <button
                onClick={handleProfileClick}
                className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors shadow-sm"
              >
                <UserIcon className="h-5 w-5 inline-block mr-1" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {currentView === 'home' && <HomePage />}
        {currentView === 'map' && <MapView />}
        {currentView === 'profile' && <ProfilePage />}
        {currentView === 'matches' && <MatchesPage />}
        {currentView === 'login' && <LoginPage />}
        {currentView === 'requests' && <RequestsPage />}
      </main>

      {user && (
        <nav
          ref={navRef}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 py-3 px-4 sm:px-6"
        >
          <div className="max-w-lg mx-auto flex justify-around items-center h-full">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors relative group ${
                currentView === 'home' ? 'text-green-600 font-bold' : 'text-gray-600 hover:text-gray-800'
              }`}
              aria-label="Home"
            >
              <Home className="h-6 w-6" />
              <span className="text-xs mt-1">Home</span>
              {currentView === 'home' && <span className="absolute -bottom-2 h-0.5 w-8 bg-green-600 rounded-full animate-grow-line"></span>}
            </button>

            <button
              onClick={() => setCurrentView('requests')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors relative group ${
                currentView === 'requests' ? 'text-green-600 font-bold' : 'text-gray-600 hover:text-gray-800'
              }`}
              aria-label="Requests"
            >
              <ClipboardCheck className="h-6 w-6" />
              <span className="text-xs mt-1">Requests</span>
              {currentView === 'requests' && <span className="absolute -bottom-2 h-0.5 w-8 bg-green-600 rounded-full animate-grow-line"></span>}
            </button>

            {userRole === 'donor' && (
              <button
                onClick={() => setShowModal({ type: 'donate' })}
                className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl hover:bg-green-700 transition-colors duration-300 transform -translate-y-4 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-75 flex items-center justify-center space-x-2 relative z-50"
                aria-label="Donate Food"
              >
                <Plus className="h-6 w-6" />
                <span className="font-semibold text-sm hidden sm:block">Donate</span>
              </button>
            )}

            <button
              onClick={() => setCurrentView('matches')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors relative group ${
                currentView === 'matches' ? 'text-green-600 font-bold' : 'text-gray-600 hover:text-gray-800'
              }`}
              aria-label="Matches"
            >
              <HeartHandshake className="h-6 w-6" />
              <span className="text-xs mt-1">Matches</span>
              {currentView === 'matches' && <span className="absolute -bottom-2 h-0.5 w-8 bg-green-600 rounded-full animate-grow-line"></span>}
            </button>

            <button
              onClick={() => setCurrentView('map')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors relative group ${
                currentView === 'map' ? 'text-green-600 font-bold' : 'text-gray-600 hover:text-gray-800'
              }`}
              aria-label="Map"
            >
              <MapPin className="h-6 w-6" />
              <span className="text-xs mt-1">Map</span>
              {currentView === 'map' && <span className="absolute -bottom-2 h-0.5 w-8 bg-green-600 rounded-full animate-grow-line"></span>}
            </button>
          </div>
        </nav>
      )}

      {showModal && showModal.type === 'donate' && <DonateModal setShowModal={setShowModal} />}
      {showModal && showModal.type === 'request' && (
        <RequestModal setShowModal={setShowModal} donationId={showModal.donationId} />
      )}
      {showModal === 'success' && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-in-up">
          <div className="max-w-md mx-auto bg-green-600 text-white p-3 rounded-lg shadow-md flex items-center space-x-3 border border-green-700">
            <Check className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Success!</p>
              <p className="text-sm opacity-90">Your food donation has been posted.</p>
            </div>
            <button
              onClick={() => setShowModal(null)}
              className="ml-auto p-1 hover:bg-green-700 rounded-md transition-colors"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </div>
  );
};

const App = () => {
  return (
    <FoodSharingProvider>
      <FoodSharingAppContent />
    </FoodSharingProvider>
  );
};

export default App;