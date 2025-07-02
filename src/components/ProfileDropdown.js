import React from 'react';
import { User as UserIcon, LogOut, Shield } from 'lucide-react';
import { useFoodSharingContext } from '../hooks/useFoodSharing';

const ProfileDropdown = ({ isOpen, onClose, onNavigate, onLogout }) => {
  const { user, userRole } = useFoodSharingContext();

  if (!isOpen || !user) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=c0a7f3,b6e3f4,ffd5dc`}
            alt="User Avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>
      <div className="py-1">
        {userRole === 'admin' && (
          <button
            onClick={() => {
              onNavigate('superadmin');
              onClose();
            }}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Shield className="h-4 w-4 mr-2" />
            Super Admin
          </button>
        )}
        <button
          onClick={() => {
            onNavigate('profile');
            onClose();
          }}
          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <UserIcon className="h-4 w-4 mr-2" />
          View Profile
        </button>
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;