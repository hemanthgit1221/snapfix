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
        return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30';
      case 'IN_PROGRESS':
        return 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-500/30';
      case 'AT_SITE':
        return 'bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg shadow-purple-500/30';
      case 'WAITING_FOR_MATERIAL':
        return 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/30';
      case 'RESOLVED':
        return 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30';
      case 'CLOSED':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/30';
      case 'REJECTED':
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-3xl shadow-xl p-8 overflow-hidden"
        >
          <div className="relative z-10">
            <h1 className="text-3xl font-bold font-poppins">{isAdminView ? 'All Tickets' : 'My Tickets'}</h1>
            <p className="text-blue-100 mt-2">{isAdminView ? 'View and manage all tickets in the system' : 'Manage and track your reported issues'}</p>
          </div>
        </motion.div>
        
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl"></div>
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
            <h1 className="text-3xl font-bold font-poppins">{isAdminView ? 'All Tickets' : 'My Tickets'}</h1>
            <p className="text-blue-100 mt-2">{isAdminView ? 'View and manage all tickets in the system' : 'Manage and track your reported issues'}</p>
          </div>
          {!isAdminView && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/tickets/create"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-50"
              >
                <span>Create New Ticket</span>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
              />
              <FunnelIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((status) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(status)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  filter === status
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-white/60 text-gray-700 hover:bg-white/80 hover:shadow-md border border-gray-200'
                }`}
              >
                {status === 'ALL' ? 'All' : 
                 status === 'RESOLVED' ? 'RESOLVED & CLOSED' : 
                 status.replace('_', ' ')}
              </motion.button>
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
            className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-12 text-center border border-white/20"
          >
            <CameraIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'You haven\'t created any tickets yet'}
            </p>
            {!searchTerm && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/tickets/create"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create Your First Ticket
                </Link>
              </motion.div>
            )}
          </motion.div>
        ) : (
          filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Photo */}
                <div className="lg:w-48 flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative overflow-hidden rounded-xl shadow-lg"
                  >
                    <img
                      src={ticket.photoUrl}
                      alt="Issue"
                      className="w-full h-32 object-cover"
                    />
                  </motion.div>
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
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/tickets/${ticket.ticketId}`, { state: { fromAdmin: isAdminView } })}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 mt-2 sm:mt-0"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View Details
                    </motion.button>
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
