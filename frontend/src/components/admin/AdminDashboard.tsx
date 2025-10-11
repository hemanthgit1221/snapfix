import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TicketIcon, 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CogIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { Ticket, User, TicketStatus } from '../../types';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalTickets: 0,
    pendingTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    totalUsers: 0,
    activeStaff: 0
  });
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [unassignedTickets, setUnassignedTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setStats({
        totalTickets: 156,
        pendingTickets: 23,
        inProgressTickets: 12,
        resolvedTickets: 121,
        totalUsers: 89,
        activeStaff: 8
      });

      setRecentTickets([
        {
          id: 1,
          ticketId: 'SF2024001',
          user: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'STUDENT' as any, points: 150 },
          photoUrl: '/api/placeholder/300/200',
          roomNumber: '101',
          floor: '1st',
          building: 'Main Building',
          category: 'ELECTRICAL' as any,
          description: 'Light not working in room 101',
          status: TicketStatus.PENDING,
          priority: 'MEDIUM' as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          ticketId: 'SF2024002',
          user: { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'FACULTY' as any, points: 200 },
          photoUrl: '/api/placeholder/300/200',
          roomNumber: '205',
          floor: '2nd',
          building: 'Science Block',
          category: 'PLUMBING' as any,
          description: 'Leaky faucet in laboratory',
          status: TicketStatus.IN_PROGRESS,
          priority: 'HIGH' as any,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]);

      setUnassignedTickets([
        {
          id: 3,
          ticketId: 'SF2024003',
          user: { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'STUDENT' as any, points: 75 },
          photoUrl: '/api/placeholder/300/200',
          roomNumber: '301',
          floor: '3rd',
          building: 'Main Building',
          category: 'AC_WATER' as any,
          description: 'AC not cooling properly',
          status: TicketStatus.PENDING,
          priority: 'LOW' as any,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]);

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      name: 'Total Tickets',
      value: stats.totalTickets,
      icon: TicketIcon,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Pending',
      value: stats.pendingTickets,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      name: 'In Progress',
      value: stats.inProgressTickets,
      icon: ExclamationTriangleIcon,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      name: 'Resolved',
      value: stats.resolvedTickets,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Active Staff',
      value: stats.activeStaff,
      icon: UserPlusIcon,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case TicketStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case TicketStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case TicketStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage tickets, assignments, and analytics</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage tickets, assignments, and analytics</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <ChartBarIcon className="h-5 w-5" />
              Analytics
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <CogIcon className="h-5 w-5" />
              Settings
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 font-poppins">Recent Tickets</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
              >
                <img
                  src={ticket.photoUrl}
                  alt="Ticket"
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {ticket.ticketId}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {ticket.roomNumber} • {ticket.user.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Unassigned Tickets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 font-poppins">Unassigned Tickets</h2>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {unassignedTickets.length} pending
            </span>
          </div>
          
          <div className="space-y-4">
            {unassignedTickets.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400 mb-4" />
                <p className="text-gray-500">All tickets are assigned!</p>
              </div>
            ) : (
              unassignedTickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={ticket.photoUrl}
                      alt="Ticket"
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {ticket.ticketId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ticket.roomNumber} • {ticket.category}
                      </p>
                    </div>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Assign
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 font-poppins mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <div className="p-2 bg-blue-500 rounded-lg">
              <TicketIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">View All Tickets</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <div className="p-2 bg-green-500 rounded-lg">
              <UserGroupIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">Manage Users</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <div className="p-2 bg-purple-500 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">View Analytics</span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <div className="p-2 bg-orange-500 rounded-lg">
              <CogIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">System Settings</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
