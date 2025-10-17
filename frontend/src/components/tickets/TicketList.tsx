import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, TicketStatus } from '../../types';
import { dashboardApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatRelativeTime, formatDateOnly } from '../../utils/dateUtils';
import { 
  EyeIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  CameraIcon,
  FunnelIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminView = location.pathname.startsWith('/admin/tickets');

  // Fetch real tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        let response;
        
        // Use different API based on user role and route
        if (isAdminView && (user?.role === 'ADMIN' || user?.role === 'DEPARTMENT_HEAD')) {
          response = await dashboardApi.getAllTickets();
        } else {
          response = await dashboardApi.getStudentTickets();
        }
        
        const ticketsData = (response as any) || [];
        setTickets(ticketsData);
        setFilteredTickets(ticketsData);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
        setTickets([]);
        setFilteredTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isAdminView, user?.role]);

  // Filter tickets based on status and search term
  useEffect(() => {
    let filtered = tickets;

    if (filter !== 'ALL') {
      filtered = filtered.filter(ticket => {
        // Handle both string and enum status values
        const ticketStatus = typeof ticket.status === 'string' ? ticket.status : String(ticket.status);
        
        // Special handling for IN_PROGRESS filter to include AT_SITE and WAITING_FOR_MATERIAL
        if (filter === 'IN_PROGRESS') {
          return ['IN_PROGRESS', 'AT_SITE', 'WAITING_FOR_MATERIAL'].includes(ticketStatus);
        }
        
        // Special handling for RESOLVED filter to include both RESOLVED and CLOSED
        if (filter === 'RESOLVED') {
          return ['RESOLVED', 'CLOSED'].includes(ticketStatus);
        }
        
        return ticketStatus === filter;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by createdAt in descending order (most recent first)
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Most recent first
    });

    setFilteredTickets(filtered);
  }, [tickets, filter, searchTerm]);

  const getStatusColor = (status: TicketStatus | string) => {
    const statusStr = typeof status === 'string' ? status : String(status);
    switch (statusStr) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'AT_SITE':
        return 'bg-purple-100 text-purple-800';
      case 'WAITING_FOR_MATERIAL':
        return 'bg-orange-100 text-orange-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'REJECTED':
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

  const getStatusIcon = (status: TicketStatus | string) => {
    const statusStr = typeof status === 'string' ? status : String(status);
    switch (statusStr) {
      case 'PENDING':
        return <ClockIcon className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'AT_SITE':
        return <MapPinIcon className="h-4 w-4" />;
      case 'WAITING_FOR_MATERIAL':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'RESOLVED':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'CLOSED':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'REJECTED':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">{isAdminView ? 'All Tickets' : 'My Tickets'}</h1>
          <p className="text-gray-600 mt-2">{isAdminView ? 'View and manage all tickets in the system' : 'Manage and track your reported issues'}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">{isAdminView ? 'All Tickets' : 'My Tickets'}</h1>
            <p className="text-gray-600 mt-2">{isAdminView ? 'View and manage all tickets in the system' : 'Manage and track your reported issues'}</p>
          </div>
          {!isAdminView && (
            <Link
              to="/tickets/create"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create New Ticket
            </Link>
          )}
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <FunnelIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="flex gap-2">
            {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'All' : 
                 status === 'RESOLVED' ? 'RESOLVED & CLOSED' : 
                 status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm p-12 text-center"
          >
            <CameraIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'You haven\'t created any tickets yet'}
            </p>
            {!searchTerm && (
              <Link
                to="/tickets/create"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create Your First Ticket
              </Link>
            )}
          </motion.div>
        ) : (
          filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 card-hover"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Photo */}
                <div className="lg:w-48 flex-shrink-0">
                  <img
                    src={ticket.photoUrl}
                    alt="Issue"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {ticket.ticketId}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Room {ticket.roomNumber} • {ticket.floor} Floor • {ticket.building}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{ticket.description}</p>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>Category: {ticket.category}</span>
                      <span title={formatDateOnly(ticket.createdAt)}>
                        Created: {formatRelativeTime(ticket.createdAt)}
                      </span>
                      {ticket.resolvedAt && (
                        <span title={formatDateOnly(ticket.resolvedAt)}>
                          Resolved: {formatRelativeTime(ticket.resolvedAt)}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => navigate(`/tickets/${ticket.ticketId}`, { state: { fromAdmin: isAdminView } })}
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mt-2 sm:mt-0"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TicketList;
