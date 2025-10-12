import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16">
      <div className="flex items-center justify-between px-4 lg:px-6 h-full">
        {/* Page Title - Empty space for content-specific titles */}
        <div>
          {/* Content-specific titles will be added here by individual pages */}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
          >
            <BellIcon className="h-5 w-5 lg:h-6 lg:w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
          </motion.button>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1 lg:space-x-2 p-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
            >
              <UserCircleIcon className="h-5 w-5 lg:h-6 lg:w-6" />
              <span className="text-xs lg:text-sm font-medium hidden sm:block">{user?.role}</span>
            </motion.button>
          </div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="px-2 lg:px-4 py-2 text-xs lg:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg transition-colors"
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
