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
      case TicketStatus.AT_SITE:
        return 'bg-purple-100 text-purple-800';
      case TicketStatus.WAITING_FOR_MATERIAL:
        return 'bg-orange-100 text-orange-800';
      case TicketStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case TicketStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      case TicketStatus.REJECTED:
        return 'bg-red-100 text-red-800';
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
            <button 
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ChartBarIcon className="h-5 w-5" />
              Analytics
            </button>
            <button 
              onClick={() => navigate('/admin/settings')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <CogIcon className="h-5 w-5" />
              Settings
            </button>
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
            className="bg-white rounded-xl shadow-sm p-4 card-hover h-24 flex items-center"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 font-inter mb-1">{stat.name}</p>
                <p className={`text-xl font-bold ${stat.textColor} font-poppins`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor} ml-2`}>
                <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
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
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 font-poppins">Tickets</h2>
          <button 
            onClick={() => navigate('/admin/tickets')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {recentTickets.length === 0 ? (
            <div className="text-center py-8">
              <TicketIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No tickets found</p>
            </div>
          ) : (
            recentTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/tickets/${ticket.ticketId}`, { state: { fromAdmin: true } })}
              >
                <div className="flex items-center space-x-4">
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
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status as TicketStatus)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <span className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View Details →
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
