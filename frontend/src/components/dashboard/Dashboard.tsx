import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  TicketIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  GiftIcon 
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
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      name: 'Pending',
      value: stats.pendingTickets,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      name: 'Resolved',
      value: stats.resolvedTickets,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      name: 'Reward Points',
      value: stats.rewardPoints,
      icon: GiftIcon,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 font-inter">
          Here's what's happening with your tickets today.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-inter">{stat.name}</p>
                <p className={`text-2xl font-bold ${stat.textColor} font-poppins`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 font-poppins mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/tickets/create')}
            className="flex items-center space-x-3 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <div className="p-2 bg-primary-500 rounded-lg">
              <TicketIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">Create New Ticket</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/tickets')}
            className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">View My Tickets</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/rewards/vouchers')}
            className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <div className="p-2 bg-purple-500 rounded-lg">
              <GiftIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">Redeem Vouchers</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 font-poppins mb-4">
          Recent Activity
        </h2>
        
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-gray-200 rounded-lg h-8 w-8"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        ) : recentTickets.length === 0 ? (
          <div className="text-center py-8">
            <TicketIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No recent tickets found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTickets.map((ticket, index) => (
              <div key={ticket.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  ticket.status === 'RESOLVED' ? 'bg-green-100' : 
                  ticket.status === 'IN_PROGRESS' ? 'bg-blue-100' : 'bg-yellow-100'
                }`}>
                  {ticket.status === 'RESOLVED' ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  ) : ticket.status === 'IN_PROGRESS' ? (
                    <TicketIcon className="h-4 w-4 text-blue-600" />
                  ) : (
                    <ClockIcon className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {ticket.status === 'RESOLVED' ? 'Ticket resolved' : 
                     ticket.status === 'IN_PROGRESS' ? 'Ticket in progress' : 'New ticket created'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {ticket.ticketId} - Room {ticket.roomNumber} • {ticket.category}
                  </p>
                </div>
                <span className="text-xs text-gray-400" title={formatDateOnly(ticket.createdAt)}>
                  {formatRelativeTime(ticket.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
