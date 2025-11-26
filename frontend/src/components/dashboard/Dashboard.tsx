import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  TicketIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  GiftIcon,
  SparklesIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/solid';
import { 
  TicketIcon as TicketIconOutline,
  ClockIcon as ClockIconOutline,
  GiftIcon as GiftIconOutline,
  PlusIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { dashboardApi, StudentStats, Ticket } from '../../services/api';
import { formatRelativeTime, formatDateOnly } from '../../utils/dateUtils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<StudentStats>({
    totalTickets: 0,
    pendingTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    rewardPoints: 0
  });
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch stats and tickets in parallel
        const [statsResponse, ticketsResponse] = await Promise.all([
          dashboardApi.getStudentStats(),
          dashboardApi.getStudentTickets()
        ]);
        
        setStats((statsResponse as any) || {
          totalTickets: 0,
          pendingTickets: 0,
          inProgressTickets: 0,
          resolvedTickets: 0,
          rewardPoints: 0
        });
        // Sort by createdAt in descending order and take the 3 most recent
        const allTickets = ((ticketsResponse as any) || []);
        const sortedTickets = allTickets.sort((a: Ticket, b: Ticket) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Most recent first
        });
        setRecentTickets(sortedTickets.slice(0, 3)); // Show only 3 most recent
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const statCards = [
    {
      name: 'Total Tickets',
      value: stats.totalTickets,
      icon: TicketIcon,
      gradient: 'from-sky-400 via-blue-500 to-indigo-600',
      iconBg: 'bg-gradient-to-br from-sky-400 to-blue-600',
      shadow: 'shadow-blue-500/20',
      glow: 'shadow-blue-500/30'
    },
    {
      name: 'Pending',
      value: stats.pendingTickets,
      icon: ClockIcon,
      gradient: 'from-amber-400 via-orange-500 to-pink-500',
      iconBg: 'bg-gradient-to-br from-amber-400 to-orange-600',
      shadow: 'shadow-orange-500/20',
      glow: 'shadow-orange-500/30'
    },
    {
      name: 'Resolved',
      value: stats.resolvedTickets,
      icon: CheckCircleIcon,
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-600',
      shadow: 'shadow-teal-500/20',
      glow: 'shadow-teal-500/30'
    },
    {
      name: 'Reward Points',
      value: stats.rewardPoints,
      icon: GiftIcon,
      gradient: 'from-purple-400 via-pink-500 to-rose-600',
      iconBg: 'bg-gradient-to-br from-purple-400 to-pink-600',
      shadow: 'shadow-purple-500/20',
      glow: 'shadow-purple-500/30',
      special: true
    }
  ];

  const quickActions = [
    {
      label: 'Create New Ticket',
      icon: PlusIcon,
      gradient: 'from-sky-500 via-blue-600 to-indigo-700',
      hoverGradient: 'from-sky-400 via-blue-500 to-indigo-600',
      shadow: 'shadow-blue-600/40',
      glow: 'shadow-blue-500/50',
      action: () => navigate('/tickets/create')
    },
    {
      label: 'View My Tickets',
      icon: TicketIconOutline,
      gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
      hoverGradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      shadow: 'shadow-teal-600/40',
      glow: 'shadow-teal-500/50',
      action: () => navigate('/tickets')
    },
    {
      label: 'Redeem Vouchers',
      icon: GiftIconOutline,
      gradient: 'from-purple-500 via-pink-600 to-rose-700',
      hoverGradient: 'from-purple-400 via-pink-500 to-rose-600',
      shadow: 'shadow-purple-600/40',
      glow: 'shadow-purple-500/50',
      action: () => navigate('/rewards/vouchers')
    }
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return {
          gradient: 'from-emerald-400 to-teal-500',
          bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
          icon: CheckCircleIcon,
          iconColor: 'text-emerald-600',
          text: 'Ticket Resolved',
          badge: 'bg-gradient-to-r from-emerald-400 to-teal-500'
        };
      case 'IN_PROGRESS':
        return {
          gradient: 'from-sky-400 to-blue-500',
          bg: 'bg-gradient-to-br from-sky-50 to-blue-50',
          icon: ClockIcon,
          iconColor: 'text-sky-600',
          text: 'Ticket In Progress',
          badge: 'bg-gradient-to-r from-sky-400 to-blue-500'
        };
      default:
        return {
          gradient: 'from-amber-400 to-orange-500',
          bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
          icon: ClockIconOutline,
          iconColor: 'text-amber-600',
          text: 'New Ticket Created',
          badge: 'bg-gradient-to-r from-amber-400 to-orange-500'
        };
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Header with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-8 md:p-10 shadow-2xl"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-4"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 font-poppins">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-blue-100 text-lg font-inter">
              Here's what's happening with your tickets today
            </p>
          </motion.div>
          
          {/* Reward Points Badge */}
          {stats.rewardPoints > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30"
            >
              <StarIcon className="h-5 w-5 text-yellow-300 animate-pulse" />
              <span className="text-white font-bold text-lg">{stats.rewardPoints}</span>
              <span className="text-blue-100 font-medium">Reward Points</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Stats Cards - Colorful KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.1 + 0.3,
              duration: 0.5,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              y: -8,
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className={`relative group overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl p-6 border border-white/20 shadow-lg ${stat.shadow} hover:${stat.glow} transition-all duration-300`}
          >
            {/* Gradient Background Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            
            {/* Animated Icon */}
            <div className="relative flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl ${stat.iconBg} shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                <stat.icon className="h-7 w-7 text-white" />
              </div>
              {stat.special && (
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="absolute top-0 right-0"
                >
                  <FireIcon className="h-6 w-6 text-orange-400" />
                </motion.div>
              )}
            </div>
            
            {/* Content */}
            <div className="relative">
              <p className="text-sm font-semibold text-gray-600 mb-2 font-inter uppercase tracking-wide">
                {stat.name}
              </p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                className={`text-4xl font-extrabold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent font-poppins`}
              >
                {stat.value}
              </motion.p>
            </div>
            
            {/* Shine Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions - Premium Gradient Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="relative rounded-3xl bg-white/60 backdrop-blur-xl p-8 border border-white/20 shadow-xl"
      >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl">
                <PlusIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 font-poppins">
                Quick Actions
              </h2>
            </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
              whileHover={{ 
                scale: 1.05,
                y: -4,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.gradient} p-6 text-white font-bold text-lg shadow-2xl ${action.shadow} hover:${action.glow} transition-all duration-300`}
            >
              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 transition-colors">
                    <action.icon className="h-6 w-6" />
                  </div>
                  <span className="font-poppins">{action.label}</span>
                </div>
                <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </div>
              
              {/* Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity - Glassmorphism Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="relative rounded-3xl bg-white/60 backdrop-blur-xl p-8 border border-white/20 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl">
            <ClockIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-poppins">
            Recent Activity
          </h2>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-5 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/30"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2 animate-pulse"></div>
                </div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-16 animate-pulse"></div>
              </motion.div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-white" />
            </div>
            <p className="text-red-600 font-semibold mb-4">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Retry
            </motion.button>
          </div>
        ) : recentTickets.length === 0 ? (
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl mb-6"
            >
              <TicketIconOutline className="h-10 w-10 text-gray-400" />
            </motion.div>
            <p className="text-gray-500 font-medium text-lg">No recent tickets found</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tickets/create')}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Create Your First Ticket
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTickets.map((ticket, index) => {
              const statusConfig = getStatusConfig(ticket.status);
              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ 
                    scale: 1.02,
                    x: 8,
                    transition: { duration: 0.2 }
                  }}
                  onClick={() => navigate(`/tickets/${ticket.ticketId}`)}
                  className="group cursor-pointer flex items-center gap-4 p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 hover:border-white/60 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  {/* Status Icon with Gradient */}
                  <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${statusConfig.gradient} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <statusConfig.icon className={`h-6 w-6 text-white`} />
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-base font-bold text-gray-900 font-poppins">
                        {statusConfig.text}
                      </p>
                      <span className={`px-3 py-1 rounded-full ${statusConfig.badge} text-white text-xs font-bold shadow-md`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-inter truncate">
                      <span className="font-semibold">{ticket.ticketId}</span> • Room {ticket.roomNumber} • {ticket.category}
                    </p>
                  </div>
                  
                  {/* Time Badge */}
                  <div className="flex flex-col items-end gap-1">
                    <span 
                      className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full"
                      title={formatDateOnly(ticket.createdAt)}
                    >
                      {formatRelativeTime(ticket.createdAt)}
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
