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
  MapPinIcon
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
      filtered = filtered.filter(ticket => ticket.status === filter);
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

  const filterTabs = [
    { key: 'ALL', label: 'All', count: tickets.length },
    { key: 'PENDING', label: 'Pending', count: tickets.filter(t => t.status === 'PENDING').length },
    { key: 'IN_PROGRESS', label: 'In Progress', count: tickets.filter(t => t.status === 'IN_PROGRESS').length },
    { key: 'RESOLVED', label: 'Resolved', count: tickets.filter(t => t.status === 'RESOLVED').length },
    { key: 'REJECTED', label: 'Rejected', count: tickets.filter(t => t.status === 'REJECTED').length },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Tickets</h1>
          <p className="text-gray-600 mt-2">View and manage all tickets in the system</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
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
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Tickets</h1>
            <p className="text-gray-600 mt-2">View and manage all tickets in the system</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Tickets</p>
            <p className="text-2xl font-bold text-primary-600">{tickets.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-6"
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
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                filter === tab.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
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
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <TicketIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filter !== 'ALL' ? 'No tickets found' : 'No tickets available'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filter !== 'ALL' 
                ? 'Try adjusting your search or filter criteria.'
                : 'There are no tickets in the system yet.'
              }
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
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
                    <div className="flex items-center space-x-3 mb-2">
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
                  <button
                    onClick={() => navigate(`/tickets/${ticket.ticketId}`, { state: { fromAdmin: true } })}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View Details
                  </button>
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
