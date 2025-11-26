import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dashboardApi, AdminStats, Ticket } from '../../services/api';
import AssignTicketModal from './AssignTicketModal';
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
import { TicketStatus } from '../../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalTickets: 0,
    pendingTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    totalUsers: 0,
    activeStaff: 0
  });
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [unassignedTickets, setUnassignedTickets] = useState<Ticket[]>([]);
  const [pendingTickets, setPendingTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh dashboard data periodically to keep counts up-to-date
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

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
      name: 'In Progress',
      value: stats.inProgressTickets,
      icon: ExclamationTriangleIcon,
      gradient: 'from-blue-400 via-indigo-500 to-purple-600',
      iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-600',
      shadow: 'shadow-indigo-500/20',
      glow: 'shadow-indigo-500/30'
    },
    {
      name: 'Resolved',
      value: stats.resolvedTickets,
      icon: CheckCircleIcon,
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      glow: 'shadow-emerald-500/30'
    },
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: UserGroupIcon,
      gradient: 'from-purple-400 via-pink-500 to-rose-600',
      iconBg: 'bg-gradient-to-br from-purple-400 to-pink-600',
      shadow: 'shadow-purple-500/20',
      glow: 'shadow-purple-500/30'
    },
    {
      name: 'Active Staff',
      value: stats.activeStaff,
      icon: UserPlusIcon,
      gradient: 'from-indigo-400 via-purple-500 to-pink-600',
      iconBg: 'bg-gradient-to-br from-indigo-400 to-purple-600',
      shadow: 'shadow-indigo-500/20',
      glow: 'shadow-indigo-500/30'
    }
  ];

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PENDING:
        return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30';
      case TicketStatus.IN_PROGRESS:
        return 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-500/30';
      case TicketStatus.AT_SITE:
        return 'bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg shadow-purple-500/30';
      case TicketStatus.WAITING_FOR_MATERIAL:
        return 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/30';
      case TicketStatus.RESOLVED:
        return 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30';
      case TicketStatus.CLOSED:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/30';
      case TicketStatus.REJECTED:
        return 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg shadow-red-500/30';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/30';
      case 'HIGH':
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30';
      case 'MEDIUM':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/30';
      case 'LOW':
        return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/30';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/30';
    }
  };

  const handleAssignTicket = async (ticket: any) => {
    setSelectedTicket(ticket);
    setShowAssignModal(true);
  };

  const handleReviewTicket = async (ticket: any) => {
    // Navigate to ticket details for review and approval
    navigate(`/tickets/${ticket.ticketId}`, { state: { reviewMode: true, fromAdmin: true } });
  };

  const handleAssignToStaff = async (staffId: number) => {
    if (!selectedTicket) return;
    
    try {
      console.log(`🔄 Starting assignment: Ticket ${selectedTicket.id} to staff ${staffId}`);
      
      // Call the actual assignment API
      const assignmentResult = await dashboardApi.assignTicket(selectedTicket.id, staffId);
      console.log('✅ Assignment API response:', assignmentResult);
      
      console.log('✅ Ticket assigned successfully');
      
      // Refresh all data to reflect the changes
      console.log('🔄 Refreshing dashboard data...');
      const [statsResponse, ticketsResponse, unassignedResponse] = await Promise.all([
        dashboardApi.getAdminStats(),
        dashboardApi.getAllTickets(),
        dashboardApi.getUnassignedTickets()
      ]);
      
      const allTickets = ticketsResponse as any;
      const pendingTicketsFiltered = allTickets.filter((ticket: any) => ticket.status === 'PENDING');
      
      console.log('📊 Updated data:', {
        stats: statsResponse,
        allTickets: allTickets.length,
        unassignedTickets: (unassignedResponse as any).length,
        pendingTickets: pendingTicketsFiltered.length
      });
      
      setStats(statsResponse as any);
      setRecentTickets((allTickets || []).slice(0, 5));
      setUnassignedTickets((unassignedResponse as any) || []);
      setPendingTickets(pendingTicketsFiltered);
      
      // Close the modal
      setShowAssignModal(false);
      setSelectedTicket(null);
      
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      // You could add a toast notification here to show the error to the user
    }
  };

  const handleStaffUpdate = async () => {
    // Refresh dashboard data when staff data is updated (e.g., after ticket assignment)
    console.log('Staff data updated - refreshing dashboard data');
    await fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statsResponse, recentTicketsResponse, unassignedTicketsResponse] = await Promise.all([
        dashboardApi.getAdminStats(),
        dashboardApi.getAllTickets(),
        dashboardApi.getUnassignedTickets()
      ]);
      
      const allTickets = recentTicketsResponse as any;
      const pendingTicketsFiltered = allTickets.filter((ticket: any) => ticket.status === 'PENDING');
      
      setStats(statsResponse as any);
      setRecentTickets(allTickets.slice(0, 5)); // Show 5 most recent
      setUnassignedTickets(unassignedTicketsResponse as any);
      setPendingTickets(pendingTicketsFiltered);
    } catch (err: any) {
      console.error('Failed to fetch admin dashboard data:', err);
      // Keep existing mock data on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-3xl shadow-xl p-8 overflow-hidden"
        >
          <div className="relative z-10">
            <h1 className="text-3xl font-bold font-poppins">Admin Dashboard</h1>
            <p className="text-blue-100 mt-2">Manage tickets, assignments, and analytics</p>
          </div>
        </motion.div>
        
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl"></div>
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
        className="relative bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-3xl shadow-xl p-8 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-poppins">Admin Dashboard</h1>
            <p className="text-blue-100 mt-2">Manage tickets, assignments, and analytics</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg font-semibold"
            >
              <ChartBarIcon className="h-5 w-5" />
              Analytics
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/settings')}
              className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg font-semibold"
            >
              <CogIcon className="h-5 w-5" />
              Settings
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className={`relative bg-white/80 backdrop-blur-md rounded-2xl shadow-md p-4 border border-white/20 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            <div className="relative z-10 flex flex-col items-center text-center gap-2">
              <div className={`p-2.5 rounded-2xl ${stat.iconBg} shadow-lg ${stat.glow}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-[12px] font-semibold text-gray-600 uppercase tracking-[0.2em] leading-tight">{stat.name}</p>
                <p className="text-xl font-bold text-gray-900 font-poppins leading-tight">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tickets for Review - Left Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 font-poppins">Tickets Pending Review</h2>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {pendingTickets.length} need approval
            </span>
          </div>
          
          <div className="space-y-4">
            {pendingTickets.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400 mb-4" />
                <p className="text-gray-500">No tickets need review!</p>
              </div>
            ) : (
              pendingTickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
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
                  <button 
                    onClick={() => handleReviewTicket(ticket)}
                    className="px-3 py-1 bg-yellow-600 text-white text-xs rounded-md hover:bg-yellow-700 transition-colors"
                  >
                    Review & Approve
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Approved & Unassigned Tickets - Right Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 font-poppins">Approved & Unassigned Tickets</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {unassignedTickets.length} ready for assignment
            </span>
          </div>
          
          <div className="space-y-4">
            {unassignedTickets.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400 mb-4" />
                <p className="text-gray-500">No approved tickets need assignment!</p>
              </div>
            ) : (
              unassignedTickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
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
                  <button 
                    onClick={() => handleAssignTicket(ticket)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                    title="Assign to staff member"
                  >
                    Assign
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Tickets - Full Width Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/85 backdrop-blur-lg rounded-3xl shadow-lg p-6 border border-white/20"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-poppins">Tickets</h2>
          <button 
            onClick={() => navigate('/admin/tickets')}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1"
          >
            View All
            <span aria-hidden="true">→</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {recentTickets.length === 0 ? (
            <div className="text-center py-10">
              <TicketIcon className="mx-auto h-14 w-14 text-gray-300 mb-4" />
              <p className="text-gray-500">No tickets found</p>
            </div>
          ) : (
            recentTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
                onClick={() => navigate(`/tickets/${ticket.ticketId}`, { state: { fromAdmin: true } })}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center shadow-inner">
                    <img
                      src="/images/snapfix-logo.png"
                      alt="SNAPFIX"
                      className="h-6 w-auto object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-lg font-semibold text-gray-900 truncate">
                      {ticket.ticketId}
                    </p>
                    <p className="text-sm text-gray-600 truncate capitalize">
                      Room {ticket.roomNumber} • {ticket.user.name}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-end">
                  <div className="flex gap-2">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${getStatusColor(ticket.status as TicketStatus)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <span className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1">
                    View Details
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 font-poppins mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <button 
            onClick={() => navigate('/tickets')}
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <div className="p-2 bg-blue-500 rounded-lg">
              <TicketIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">View All Tickets</span>
          </button>
          
          <button 
            onClick={() => navigate('/admin/staff')}
            className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <div className="p-2 bg-green-500 rounded-lg">
              <UserGroupIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">Manage Staff</span>
          </button>
          
          <button 
            onClick={() => navigate('/admin/students')}
            className="flex items-center space-x-3 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <div className="p-2 bg-indigo-500 rounded-lg">
              <UserGroupIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">Manage Students</span>
          </button>
          
          <button 
            onClick={() => navigate('/analytics')}
            className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <div className="p-2 bg-purple-500 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">View Analytics</span>
          </button>
          
          <button 
            onClick={() => navigate('/admin/settings')}
            className="flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <div className="p-2 bg-orange-500 rounded-lg">
              <CogIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium text-gray-900">System Settings</span>
          </button>
        </div>
      </motion.div>

      {/* Assign Ticket Modal */}
      {selectedTicket && (
        <AssignTicketModal
          isOpen={showAssignModal}
          onClose={async () => {
            setShowAssignModal(false);
            setSelectedTicket(null);
            // Refresh dashboard data when modal is closed to get updated counts
            await fetchDashboardData();
          }}
          onAssign={handleAssignToStaff}
          ticketId={selectedTicket.ticketId}
          currentAssignedTo={selectedTicket.assignedTo ? {
            id: selectedTicket.assignedTo.id,
            name: selectedTicket.assignedTo.name,
            email: selectedTicket.assignedTo.email,
            role: selectedTicket.assignedTo.role,
            isActive: true
          } : null}
          onStaffUpdate={handleStaffUpdate}
        />
      )}

    </div>
  );
};

export default AdminDashboard;
