import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  HomeIcon, 
  TicketIcon, 
  ChartBarIcon, 
  GiftIcon, 
  CogIcon,
  UserGroupIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  TicketIcon as TicketIconSolid,
  GiftIcon as GiftIconSolid,
  StarIcon,
  FireIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const Sidebar: React.FC = () => {
  const { user, userPoints } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(true); // Always open on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: HomeIcon, 
      iconSolid: HomeIconSolid,
      gradient: 'from-sky-400 to-blue-600',
      color: 'text-sky-600'
    },
    { 
      name: 'My Tickets', 
      href: '/tickets', 
      icon: TicketIcon, 
      iconSolid: TicketIconSolid,
      gradient: 'from-indigo-400 to-purple-600',
      color: 'text-indigo-600'
    },
    { 
      name: 'Rewards', 
      href: '/rewards', 
      icon: GiftIcon, 
      iconSolid: GiftIconSolid,
      gradient: 'from-purple-400 to-pink-600',
      color: 'text-purple-600',
      showBadge: true
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: CogIcon, 
      gradient: 'from-gray-400 to-gray-600',
      color: 'text-gray-600'
    },
  ];

  const adminNavigation = [
    { 
      name: 'Admin Panel', 
      href: '/admin', 
      icon: UserIcon,
      gradient: 'from-rose-400 to-red-600',
      color: 'text-rose-600'
    },
    { 
      name: 'All Tickets', 
      href: '/admin/tickets', 
      icon: TicketIcon,
      gradient: 'from-blue-400 to-cyan-600',
      color: 'text-blue-600'
    },
    { 
      name: 'Staff Management', 
      href: '/admin/staff', 
      icon: UsersIcon,
      gradient: 'from-violet-400 to-purple-600',
      color: 'text-violet-600'
    },
    { 
      name: 'Student Management', 
      href: '/admin/students', 
      icon: AcademicCapIcon,
      gradient: 'from-amber-400 to-orange-600',
      color: 'text-amber-600'
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: ChartBarIcon,
      gradient: 'from-teal-400 to-cyan-600',
      color: 'text-teal-600'
    },
  ];

  const staffNavigation = [
    { 
      name: 'Staff Panel', 
      href: '/staff', 
      icon: UserGroupIcon,
      gradient: 'from-blue-400 to-indigo-600',
      color: 'text-blue-600'
    },
    { 
      name: 'Assigned Tickets', 
      href: '/assigned-tickets', 
      icon: TicketIcon,
      gradient: 'from-green-400 to-emerald-600',
      color: 'text-green-600'
    },
  ];

  const isActive = (href: string) => {
    // Exact match for root
    if (href === '/') {
      return location.pathname === '/';
    }
    
    // Special handling for settings pages - highest priority
    if (location.pathname === '/settings' || location.pathname === '/admin/settings' || location.pathname === '/staff/settings') {
      return href === '/settings';
    }
    
    // Special handling for admin routes to prevent conflicts
    if (location.pathname.startsWith('/admin/')) {
      if (location.pathname === '/admin') {
        return href === '/admin';
      } else if (location.pathname === '/admin/tickets') {
        return href === '/admin/tickets';
      } else if (location.pathname === '/admin/staff') {
        return href === '/admin/staff';
      } else if (location.pathname === '/admin/students') {
        return href === '/admin/students';
      }
      // All other /admin/* routes (like /admin/settings) are handled above
      return false;
    }
    
    // Special handling for staff routes
    if (location.pathname.startsWith('/staff/')) {
      if (location.pathname === '/staff') {
        return href === '/staff';
      }
      // All other /staff/* routes are handled above
      return false;
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
    
    // Exact match for all other routes
    return location.pathname === href;
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
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </motion.button>

      {/* Mobile overlay */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          x: isDesktop ? 0 : (isOpen ? 0 : '-100%')
        }}
        className="w-64 h-screen fixed left-0 top-0 z-40 lg:translate-x-0 flex-shrink-0"
      >
        <div className="relative h-full bg-gradient-to-b from-white via-blue-50/30 to-purple-50/30 backdrop-blur-xl border-r border-white/20 shadow-2xl">
          {/* Background Texture Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.3) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          {/* Logo Section */}
          <div className="relative p-6 border-b border-white/20">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3"
            >
              <div>
                <img 
                  src="/images/brand-logo.png" 
                  alt="Brand Logo" 
                  className="h-8 w-8 object-contain"
                />
              </div>
              <img 
                src="/images/snapfix-logo.png" 
                alt="SnapFix" 
                className="h-7 object-contain"
              />
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="relative mt-6 px-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <ul className="space-y-2">
              {getNavigationItems().map((item, index) => {
                const active = isActive(item.href);
                const IconComponent = active && item.iconSolid ? item.iconSolid : item.icon;
                
                return (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className="group relative block"
                    >
                      <motion.div
                        whileHover={{ x: 4 }}
                        className={`relative flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 overflow-hidden ${
                          active
                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                            : 'text-gray-700 hover:bg-white/60 hover:text-gray-900'
                        }`}
                        style={active ? { boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 0 20px -5px rgba(99, 102, 241, 0.3)' } : {}}
                      >
                        {/* Active Indicator Glow */}
                        {active && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        
                        {/* Icon */}
                        <div className={`relative z-10 mr-3 transition-colors ${
                          active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                        }`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        
                        {/* Label */}
                        <span className="relative z-10 flex-1 font-poppins">
                          {item.name}
                        </span>
                        
                        {/* Reward Badge */}
                        {item.showBadge && userPoints !== undefined && userPoints > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="relative z-10 ml-2 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full shadow-lg"
                          >
                            <StarIcon className="h-3 w-3 text-white" />
                            <span className="text-xs font-bold text-white">{userPoints}</span>
                          </motion.div>
                        )}
                        
                        {/* Hover Shine Effect - Only show on non-active items */}
                        {!active && (
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl pointer-events-none"></div>
                        )}
                      </motion.div>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          {/* User Info Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 bg-white/40 backdrop-blur-md">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm border border-white/30 shadow-lg"
            >
              {/* Avatar with Gradient */}
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 p-0.5">
                  <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                    <span className="text-sm font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                {/* Online Indicator */}
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-400 rounded-full border-2 border-white shadow-lg"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate font-poppins">{user?.name}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-gray-600 truncate">{user?.role}</span>
                  {userPoints !== undefined && userPoints > 0 && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="flex items-center gap-1"
                    >
                      <FireIcon className="h-3 w-3 text-orange-500" />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
