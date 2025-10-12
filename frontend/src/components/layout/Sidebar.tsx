import React, { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HomeIcon, 
  TicketIcon, 
  PlusIcon, 
  ChartBarIcon, 
  GiftIcon, 
  CogIcon,
  UserGroupIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'My Tickets', href: '/tickets', icon: TicketIcon },
    { name: 'Create Ticket', href: '/tickets/create', icon: PlusIcon },
    { name: 'Rewards', href: '/rewards', icon: GiftIcon },
  ];

  const adminNavigation = [
    { name: 'Admin Panel', href: '/admin', icon: CogIcon },
    { name: 'All Tickets', href: '/admin/tickets', icon: TicketIcon },
    { name: 'Staff Management', href: '/admin/staff', icon: UsersIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  ];

  const staffNavigation = [
    { name: 'Staff Panel', href: '/staff', icon: UserGroupIcon },
    { name: 'Assigned Tickets', href: '/assigned-tickets', icon: TicketIcon },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    
    // Special handling for ticket details page
    if (location.pathname.startsWith('/tickets/')) {
      // Check URL parameter for navigation source
      const fromParam = searchParams.get('from');
      
      // Check if we came from assigned tickets page (via URL param or state) - highest priority
      const fromAssignedTickets = location.state?.fromAssignedTickets || fromParam === 'assigned-tickets';
      if (fromAssignedTickets) {
        return href === '/assigned-tickets';
      }
      
      // Check if we came from staff dashboard
      const fromStaff = location.state?.fromStaff;
      if (fromStaff) {
        return href === '/staff';
      }
      
      // Check if we came from admin (either dashboard or tickets page)
      const fromAdmin = location.state?.fromAdmin;
      if (fromAdmin) {
        return href === '/admin/tickets';
      }
      
      // Default to My Tickets if no specific source
      return href === '/tickets';
    }
    
    return location.pathname.startsWith(href);
  };

  const getNavigationItems = () => {
    let items = [...navigation];
    
    if (user?.role === 'ADMIN' || user?.role === 'DEPARTMENT_HEAD') {
      items = [...items, ...adminNavigation];
    }
    
    if (user?.role === 'STAFF') {
      items = [...items, ...staffNavigation];
    }
    
    return items;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6 text-gray-600" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`w-64 bg-white shadow-lg h-screen fixed left-0 top-0 z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img 
              src="/images/brand-logo.png" 
              alt="Brand Logo" 
              className="h-10 w-10 object-contain"
            />
            <img 
              src="/images/snapfix-logo.png" 
              alt="SnapFix" 
              className="h-8 object-contain"
            />
          </div>
        </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {getNavigationItems().map((item, index) => (
            <motion.li
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive(item.href) ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Sidebar;
