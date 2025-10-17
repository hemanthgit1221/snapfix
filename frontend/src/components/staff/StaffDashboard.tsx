import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, Ticket } from '../../services/api';
import { formatRelativeTime, formatDateOnly } from '../../utils/dateUtils';
import { 
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  TagIcon,
  PhotoIcon,
  PencilSquareIcon,
  EyeIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { TicketStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import StatusUpdateModal from './StatusUpdateModal';

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'ALL'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [ticketForStatusUpdate, setTicketForStatusUpdate] = useState<Ticket | null>(null);

  useEffect(() => {
    const fetchAssignedTickets = async () => {
      try {
        setLoading(true);
        
        const response = await dashboardApi.getAssignedTickets();
        
        setAssignedTickets(response as any);
      } catch (err: any) {
        console.error('❌ StaffDashboard: Failed to fetch assigned tickets:', err);
        // Keep empty array on error
        setAssignedTickets([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAssignedTickets();
    }
  }, [user]);

  const filteredTickets = (filterStatus === 'ALL' 
    ? assignedTickets 
    : assignedTickets.filter(ticket => {
        // Special handling for IN_PROGRESS filter to include AT_SITE and WAITING_FOR_MATERIAL
        if (filterStatus === TicketStatus.IN_PROGRESS) {
          return ['IN_PROGRESS', 'AT_SITE', 'WAITING_FOR_MATERIAL'].includes(ticket.status);
        }
        
        // Special handling for RESOLVED filter to include both RESOLVED and CLOSED
        if (filterStatus === TicketStatus.RESOLVED) {
          return ['RESOLVED', 'CLOSED'].includes(ticket.status);
        }
        
        return ticket.status === filterStatus;
      })
  ).sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Most recent first
  });

  const stats = {
    total: assignedTickets.length,
    pending: assignedTickets.filter(t => t.status === 'PENDING').length,
    inProgress: assignedTickets.filter(t => ['IN_PROGRESS', 'AT_SITE', 'WAITING_FOR_MATERIAL'].includes(t.status)).length,
    atSite: assignedTickets.filter(t => t.status === 'AT_SITE').length,
    waitingForMaterial: assignedTickets.filter(t => t.status === 'WAITING_FOR_MATERIAL').length,
    resolved: assignedTickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status)).length,
    rejected: assignedTickets.filter(t => t.status === 'REJECTED').length,
  };

  const handleStatusUpdate = async (ticketId: number, newStatus: TicketStatus) => {
    try {
      await dashboardApi.updateTicketStatus(ticketId, newStatus);
      
      // Update local state
      setAssignedTickets(prev => {
        const updated = prev.map(ticket => 
          ticket.id === ticketId 
            ? { 
                ...ticket, 
                status: newStatus, 
                updatedAt: new Date().toISOString(),
                ...(newStatus === TicketStatus.RESOLVED && { resolvedAt: new Date().toISOString() })
              }
            : ticket
        );
        return updated;
      });
      
    } catch (err: any) {
      console.error('❌ StaffDashboard: Failed to update ticket status:', err);
      // You could add a toast notification here
      throw err; // Re-throw so the modal can handle the error
    }
  };

  const handleOpenStatusModal = (ticket: Ticket) => {
    setTicketForStatusUpdate(ticket);
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setTicketForStatusUpdate(null);
  };

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

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PENDING:
        return <ClockIcon className="h-4 w-4" />;
      case TicketStatus.IN_PROGRESS:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case TicketStatus.AT_SITE:
        return <MapPinIcon className="h-4 w-4" />;
      case TicketStatus.WAITING_FOR_MATERIAL:
        return <TruckIcon className="h-4 w-4" />;
      case TicketStatus.RESOLVED:
        return <CheckCircleIcon className="h-4 w-4" />;
      case TicketStatus.CLOSED:
        return <CheckCircleIcon className="h-4 w-4" />;
      case TicketStatus.REJECTED:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Staff Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage assigned tickets and updates</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Staff Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage assigned tickets and updates</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-4 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total</p>
              <p className="text-lg font-bold text-gray-900 font-poppins">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <ClipboardDocumentListIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-4 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Pending</p>
              <p className="text-lg font-bold text-yellow-600 font-poppins">{stats.pending}</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-4 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">In Progress</p>
              <p className="text-lg font-bold text-blue-600 font-poppins">{stats.inProgress}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <ExclamationTriangleIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-4 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">At Site</p>
              <p className="text-lg font-bold text-purple-600 font-poppins">{stats.atSite}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <MapPinIcon className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-4 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Waiting</p>
              <p className="text-lg font-bold text-orange-600 font-poppins">{stats.waitingForMaterial}</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <TruckIcon className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-4 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Resolved</p>
              <p className="text-lg font-bold text-green-600 font-poppins">{stats.resolved}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter and Tickets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 font-poppins">Assigned Tickets</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'ALL'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus(TicketStatus.PENDING)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === TicketStatus.PENDING
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilterStatus(TicketStatus.IN_PROGRESS)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === TicketStatus.IN_PROGRESS
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Progress ({stats.inProgress})
            </button>
            <button
              onClick={() => setFilterStatus(TicketStatus.AT_SITE)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === TicketStatus.AT_SITE
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              At Site ({stats.atSite})
            </button>
            <button
              onClick={() => setFilterStatus(TicketStatus.WAITING_FOR_MATERIAL)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === TicketStatus.WAITING_FOR_MATERIAL
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Waiting ({stats.waitingForMaterial})
            </button>
            <button
              onClick={() => setFilterStatus(TicketStatus.RESOLVED)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === TicketStatus.RESOLVED
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              RESOLVED & CLOSED ({stats.resolved})
            </button>
            <button
              onClick={() => setFilterStatus(TicketStatus.REJECTED)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === TicketStatus.REJECTED
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected ({stats.rejected})
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {assignedTickets.length === 0 
                  ? "No tickets have been assigned to you yet." 
                  : "No tickets found for the selected filter."}
              </p>
              {assignedTickets.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  Contact your administrator to assign tickets to you.
                </p>
              )}
            </div>
          ) : (
            filteredTickets.map((ticket, index) => {
              return (
                <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{ticket.ticketId}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status as TicketStatus)}`}>
                        {getStatusIcon(ticket.status as TicketStatus)}
                        <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Reported by: {ticket.user.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Room {ticket.roomNumber}, {ticket.floor} Floor</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TagIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{ticket.category}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{ticket.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span title={formatDateOnly(ticket.createdAt)}>
                            Created {formatRelativeTime(ticket.createdAt)}
                          </span>
                        </div>
                        {ticket.resolvedAt && (
                          <div className="flex items-center space-x-1">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span title={formatDateOnly(ticket.resolvedAt)}>
                              Resolved {formatRelativeTime(ticket.resolvedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowTicketModal(true);
                          }}
                          className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <PhotoIcon className="h-4 w-4" />
                          <span>View Photo</span>
                        </button>
                        
                        <button
                          onClick={() => handleOpenStatusModal(ticket)}
                          className="flex items-center space-x-1 px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                          <span>Update Status</span>
                        </button>
                        
                        <button 
                          onClick={() => navigate(`/tickets/${ticket.ticketId}`, { state: { fromStaff: true } })}
                          className="flex items-center space-x-1 px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Ticket Photo Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedTicket.ticketId} - Issue Photo
              </h3>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <img
              src={selectedTicket.photoUrl}
              alt="Ticket issue"
              className="w-full h-96 object-cover rounded-lg"
            />
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowTicketModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && ticketForStatusUpdate && (
        <StatusUpdateModal
          isOpen={showStatusModal}
          onClose={handleCloseStatusModal}
          ticketId={ticketForStatusUpdate.id}
          currentStatus={ticketForStatusUpdate.status as TicketStatus}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

    </div>
  );
};

export default StaffDashboard;
