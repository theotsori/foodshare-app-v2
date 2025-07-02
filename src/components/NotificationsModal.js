// src/components/NotificationsModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, X, AlertCircle } from 'lucide-react';
import { useFoodSharingContext } from '../hooks/useFoodSharing';

const NotificationCard = ({ notification, handleMarkNotificationRead }) => (
  <div className={`bg-white rounded-lg p-4 shadow-sm border ${notification.is_read ? 'border-gray-100' : 'border-blue-200 bg-blue-50'} transition-all duration-200 hover:shadow-md`}>
    <div className="flex justify-between items-start">
      <p className={`font-medium text-gray-800 ${notification.is_read ? '' : 'text-blue-700'}`}>
        {notification.message}
      </p>
      {!notification.is_read && (
        <button
          onClick={() => handleMarkNotificationRead(notification.notification_id)}
          className="flex-shrink-0 ml-4 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Mark as Read
        </button>
      )}
    </div>
    <p className="text-xs text-gray-500 mt-2">
      {new Date(notification.created_at).toLocaleString()}
    </p>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100 text-gray-500 text-md">
    <p>{message}</p>
  </div>
);

const NotificationsModal = ({ isOpen, onClose }) => {
  const { user, setUnreadNotifications } = useFoodSharingContext(); // Added setUnreadNotifications
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !user.user_id) {
        setLoading(false);
        setError("User not logged in.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const notificationsRes = await axios.get(`http://localhost:4000/api/users/${user.user_id}/notifications`);
        setNotifications(notificationsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notifications:', err.message, err.stack);
        setError('Failed to load notifications: ' + (err.response?.data?.error || err.message));
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchNotifications();
    }
  }, [user, isOpen]);

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:4000/api/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => n.notification_id === notificationId ? { ...n, is_read: true } : n));
      // Refresh unread count
      const res = await axios.get(`http://localhost:4000/api/users/${user.user_id}/notifications`);
      const unreadCount = res.data.filter(n => !n.is_read).length;
      setUnreadNotifications(unreadCount);
    } catch (err) {
      console.error('Error marking notification as read:', err.response?.data?.error || err.message);
      alert('Failed to mark notification as read: ' + (err.response?.data?.error || err.message));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto transform transition-all duration-300">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close notifications"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {loading && (
            <div className="text-center py-8 text-gray-600 text-lg">Loading notifications...</div>
          )}
          {error && (
            <div className="text-center py-8 text-red-600 text-lg">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              Error: {error}
            </div>
          )}
          {!loading && !error && notifications.length === 0 && (
            <EmptyState message="No notifications." />
          )}
          {!loading && !error && notifications.length > 0 && (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.notification_id}
                  notification={notification}
                  handleMarkNotificationRead={handleMarkNotificationRead}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;