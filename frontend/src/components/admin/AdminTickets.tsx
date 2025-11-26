import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, TicketStatus } from '../../types';
import { dashboardApi } from '../../services/api';
// import { useAuth } from '../../contexts/AuthContext'; // Not used in this component
import { formatRelativeTime, formatDateOnly } from '../../utils/dateUtils';
import { 
  EyeIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  TicketIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  FlagIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

const AdminTickets: React.FC = () => {
  console.log('🎯 AdminTickets component is rendering!');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  // const { user } = useAuth(); // Not used in this component
  const navigate = useNavigate();

  // Fetch all tickets from API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getAllTickets();
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
  }, []);

  // Filter tickets based on search term and status filter
  useEffect(() => {
    let filtered = tickets;

    // Apply status filter
    if (filter !== 'ALL') {
      filtered = filtered.filter(ticket => {
        // Special handling for IN_PROGRESS filter to include AT_SITE and WAITING_FOR_MATERIAL
        if (filter === 'IN_PROGRESS') {
          return ['IN_PROGRESS', 'AT_SITE', 'WAITING_FOR_MATERIAL'].includes(ticket.status);
        }
        
        // Special handling for RESOLVED filter to include both RESOLVED and CLOSED
        if (filter === 'RESOLVED') {
          return ['RESOLVED', 'CLOSED'].includes(ticket.status);
        }
        
        return ticket.status === filter;
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    const statusStr = typeof status === 'string' ? status : status;
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

  const getStatusIcon = (status: TicketStatus | string) => {
    const statusStr = typeof status === 'string' ? status : status;
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

  const filterTabs = [
    { key: 'ALL', label: 'All', count: tickets.length },
    { key: 'PENDING', label: 'Pending', count: tickets.filter(t => t.status === 'PENDING').length },
    { key: 'IN_PROGRESS', label: 'In Progress', count: tickets.filter(t => ['IN_PROGRESS', 'AT_SITE', 'WAITING_FOR_MATERIAL'].includes(t.status)).length },
    { key: 'RESOLVED', label: 'RESOLVED & CLOSED', count: tickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status)).length },
    { key: 'REJECTED', label: 'Rejected', count: tickets.filter(t => t.status === 'REJECTED').length },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-3xl shadow-xl p-8 overflow-hidden"
        >
          <div className="relative z-10">
            <h1 className="text-3xl font-bold font-poppins">Tickets</h1>
            <p className="text-blue-100 mt-2">View and manage all tickets in the system</p>
          </div>
        </motion.div>
        
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl"></div>
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
            <h1 className="text-3xl font-bold font-poppins">Tickets</h1>
            <p className="text-blue-100 mt-2">View and manage all tickets in the system</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Total Tickets</p>
            <p className="text-3xl font-bold">{tickets.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20"
      >
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets by ID, room number, description, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                filter === tab.key
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white/60 text-gray-700 hover:bg-white/80 hover:shadow-md border border-gray-200'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                filter === tab.key
                  ? 'bg-white/30 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Tickets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {filteredTickets.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-12 text-center border border-white/20">
            <TicketIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filter !== 'ALL' ? 'No tickets found' : 'No tickets available'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filter !== 'ALL' 
                ? 'Try adjusting your search or filter criteria.'
                : 'There are no tickets in the system yet.'
              }
            </p>
            {!(searchTerm || filter !== 'ALL') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/tickets/create')}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create First Ticket
              </motion.button>
            )}
          </div>
        ) : (
          filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01, y: -4 }}
              className={`bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border transition-all duration-300 ${
                ticket.userIsFlagged 
                  ? 'border-amber-300 bg-amber-50/50' 
                  : ticket.userIsBlacklisted 
                  ? 'border-red-300 bg-red-50/50' 
                  : 'border-white/20'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start space-x-4">
                  {/* Ticket Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={ticket.photoUrl}
                      alt="Ticket"
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  </div>

                  {/* Ticket Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {ticket.ticketId}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      {ticket.isDuplicate && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          ⚠️ Possible Duplicate
                        </span>
                      )}
                      {ticket.userIsFlagged && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                          <FlagIcon className="h-3 w-3 mr-1" />
                          Flagged User
                        </span>
                      )}
                      {ticket.userIsBlacklisted && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                          <ShieldExclamationIcon className="h-3 w-3 mr-1" />
                          Blacklisted
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {ticket.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>Room: {ticket.roomNumber}</span>
                      <span>Floor: {ticket.floor}</span>
                      <span>Building: {ticket.building}</span>
                      <span>Category: {ticket.category}</span>
                      <span>By: {ticket.user.name}</span>
                      {ticket.assignedTo && (
                        <span>Assigned to: {ticket.assignedTo.name}</span>
                      )}
                      {ticket.isDuplicate && ticket.parentTicketId && (
                        <span className="text-orange-600 font-medium">
                          Duplicate of: {ticket.parentTicketId}
                        </span>
                      )}
                      <span title={formatDateOnly(ticket.createdAt)}>
                        Created: {formatRelativeTime(ticket.createdAt)}
                      </span>
                      {ticket.resolvedAt && (
                        <span title={formatDateOnly(ticket.resolvedAt)}>
                          Resolved: {formatRelativeTime(ticket.resolvedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/tickets/${ticket.ticketId}`, { state: { fromAdmin: true } })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-40 justify-center"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View Details
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default AdminTickets;
