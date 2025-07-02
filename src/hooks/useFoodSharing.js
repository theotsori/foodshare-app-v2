import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // We might need axios for categories, or if user data is fetched here

const FoodSharingContext = createContext();

export const FoodSharingProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('home');
  // Initialize user as null or from localStorage if you persist login
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('foodshare_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });
  const [userRole, setUserRole] = useState(() => {
    try {
      const storedRole = localStorage.getItem('foodshare_user_role');
      return storedRole || null;
    } catch (error) {
      console.error("Failed to parse user role from localStorage", error);
      return null;
    }
  });
  const [showModal, setShowModal] = useState(null);
  const [categories, setCategories] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Effect to persist user and userRole to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('foodshare_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('foodshare_user');
    }
    if (userRole) {
      localStorage.setItem('foodshare_user_role', userRole);
    } else {
      localStorage.removeItem('foodshare_user_role');
    }
  }, [user, userRole]);

  // Fetch categories on initial load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err.message);
        // Optionally set an error state here
      }
    };
    fetchCategories();
  }, []);

    // Fetch unread notifications count
    const fetchUnreadNotifications = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:4000/api/users/${userId}/notifications`);
            const unreadCount = res.data.filter(n => !n.is_read).length;
            setUnreadNotifications(unreadCount);
        } catch (err) {
            console.error('Error fetching unread notifications:', err);
        }
    };

  return (
    <FoodSharingContext.Provider
      value={{
        currentView,
        setCurrentView,
        user,
        setUser,
        userRole,
        setUserRole,
        showModal,
        setShowModal,
        categories,
        unreadNotifications,
        setUnreadNotifications,
        fetchUnreadNotifications,
      }}
    >
      {children}
    </FoodSharingContext.Provider>
  );
};

export const useFoodSharingContext = () => useContext(FoodSharingContext);