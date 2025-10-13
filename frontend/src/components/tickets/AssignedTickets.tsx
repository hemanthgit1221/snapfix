import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, Ticket } from '../../services/api';
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
import StatusUpdateModal from '../staff/StatusUpdateModal';

const AssignedTickets: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TicketStatus | 'ALL'>('ALL');
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
        console.error('❌ AssignedTickets: Failed to fetch assigned tickets:', err);
        setAssignedTickets([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAssignedTickets();
    }
  }, [user]);

  const filteredTickets = activeTab === 'ALL' 
    ? assignedTickets 
    : assignedTickets.filter(ticket => ticket.status === activeTab);

  const stats = {
    total: assignedTickets.length,
    pending: assignedTickets.filter(t => t.status === 'PENDING').length,
    inProgress: assignedTickets.filter(t => t.status === 'IN_PROGRESS').length,
    atSite: assignedTickets.filter(t => t.status === 'AT_SITE').length,
    waitingForMaterial: assignedTickets.filter(t => t.status === 'WAITING_FOR_MATERIAL').length,
    resolved: assignedTickets.filter(t => t.status === 'RESOLVED').length,
    closed: assignedTickets.filter(t => t.status === 'CLOSED').length,
  };

  const handleStatusUpdate = async (ticketId: number, newStatus: TicketStatus) => {
    try {
      console.log(`🔄 AssignedTickets: Starting status update for ticket ${ticketId} to ${newStatus}`);
      
      await dashboardApi.updateTicketStatus(ticketId, newStatus);
      console.log(`✅ AssignedTickets: API call successful for ticket ${ticketId}`);
      
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
        console.log(`📊 AssignedTickets: Updated local state for ticket ${ticketId}`, {
          oldStatus: prev.find(t => t.id === ticketId)?.status,
          newStatus: updated.find(t => t.id === ticketId)?.status
        });
        return updated;
      });
      
      console.log(`✅ AssignedTickets: Ticket ${ticketId} status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('❌ AssignedTickets: Failed to update ticket status:', err);
      throw err;
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
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Assigned Tickets</h1>
          <p className="text-gray-600 mt-2">Manage your assigned tickets</p>
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
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Assigned Tickets</h1>
            <p className="text-gray-600 mt-2">Manage your assigned tickets and track progress</p>
          </div>
        </div>
      </motion.div>


      {/* Filter and Tickets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="mb-6">
          <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab(TicketStatus.PENDING)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeTab === TicketStatus.PENDING
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setActiveTab(TicketStatus.IN_PROGRESS)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeTab === TicketStatus.IN_PROGRESS
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Progress ({stats.inProgress})
            </button>
            <button
              onClick={() => setActiveTab(TicketStatus.AT_SITE)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeTab === TicketStatus.AT_SITE
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              At Site ({stats.atSite})
            </button>
            <button
              onClick={() => setActiveTab(TicketStatus.WAITING_FOR_MATERIAL)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeTab === TicketStatus.WAITING_FOR_MATERIAL
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Waiting ({stats.waitingForMaterial})
            </button>
            <button
              onClick={() => setActiveTab(TicketStatus.RESOLVED)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeTab === TicketStatus.RESOLVED
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Resolved ({stats.resolved})
            </button>
            <button
              onClick={() => setActiveTab(TicketStatus.CLOSED)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                activeTab === TicketStatus.CLOSED
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Closed ({stats.closed})
            </button>
          </div>
        </div>

        {/* Tickets List */}
        <div className="mt-6 space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {assignedTickets.length === 0 
                  ? "No tickets have been assigned to you yet." 
                  : `No ${activeTab.toLowerCase()} tickets found.`}
              </p>
              {assignedTickets.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  Contact your administrator to assign tickets to you.
                </p>
              )}
            </div>
          ) : (
            filteredTickets.map((ticket, index) => (
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
                          <span>Created {formatTimeAgo(ticket.createdAt)}</span>
                        </div>
                        {ticket.resolvedAt && (
                          <div className="flex items-center space-x-1">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span>Resolved {formatTimeAgo(ticket.resolvedAt)}</span>
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
                          onClick={() => navigate(`/tickets/${ticket.ticketId}?from=assigned-tickets`)}
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
            ))
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

export default AssignedTickets;
