import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleUserClick = () => {
    // Navigate to appropriate settings based on user role
    if (user?.role === 'STUDENT') {
      navigate('/settings');
    } else if (user?.role === 'ADMIN') {
      navigate('/admin/settings');
    } else if (user?.role === 'STAFF') {
      navigate('/staff/settings');
    }
  };

  return (
    <header className="relative bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 backdrop-blur-xl border-b border-white/20 shadow-lg h-16">
      <div className="flex items-center justify-between px-4 lg:px-6 h-full">
        {/* Page Title - Empty space for content-specific titles */}
        <div>
          {/* Content-specific titles will be added here by individual pages */}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 text-gray-600 hover:text-indigo-600 bg-white/60 hover:bg-gradient-to-br hover:from-indigo-100 hover:to-purple-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <BellIcon className="h-5 w-5 lg:h-6 lg:w-6" />
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-gradient-to-r from-red-400 to-pink-500 ring-2 ring-white shadow-lg"
            />
          </motion.button>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUserClick}
              className="flex items-center space-x-2 p-2.5 text-gray-700 hover:text-indigo-700 bg-white/60 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
              title="Go to Settings"
            >
              <UserCircleIcon className="h-5 w-5 lg:h-6 lg:w-6" />
              <span className="text-xs lg:text-sm font-semibold hidden sm:block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {user?.role}
              </span>
            </motion.button>
          </div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="px-3 lg:px-5 py-2 text-xs lg:text-sm font-semibold text-white bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 hover:from-red-600 hover:via-pink-600 hover:to-orange-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Exit</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Header;
