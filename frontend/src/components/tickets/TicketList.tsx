import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, TicketStatus, TicketCategory } from '../../types';
import { 
  EyeIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  CameraIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockTickets: Ticket[] = [
        {
          id: 1,
          ticketId: 'SF2024001',
          user: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'STUDENT' as any, points: 150 },
          photoUrl: '/api/placeholder/300/200',
          roomNumber: '101',
          floor: '1st',
          building: 'Main Building',
          category: TicketCategory.ELECTRICAL,
          description: 'Light not working in room 101',
          status: TicketStatus.PENDING,
          priority: 'MEDIUM' as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          ticketId: 'SF2024002',
          user: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'STUDENT' as any, points: 150 },
          photoUrl: '/api/placeholder/300/200',
          roomNumber: '205',
          floor: '2nd',
          building: 'Science Block',
          category: TicketCategory.PLUMBING,
          description: 'Leaky faucet in laboratory',
          status: TicketStatus.IN_PROGRESS,
          priority: 'HIGH' as any,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 3,
          ticketId: 'SF2024003',
          user: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'STUDENT' as any, points: 150 },
          photoUrl: '/api/placeholder/300/200',
          roomNumber: '301',
          floor: '3rd',
          building: 'Main Building',
          category: TicketCategory.AC_WATER,
          description: 'AC not cooling properly',
          status: TicketStatus.RESOLVED,
          priority: 'LOW' as any,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          resolvedAt: new Date(Date.now() - 86400000).toISOString(),
        }
      ];
      
      setTickets(mockTickets);
      setFilteredTickets(mockTickets);
      setLoading(false);
    };

    fetchTickets();
  }, []);

  // Filter tickets based on status and search term
  useEffect(() => {
    let filtered = tickets;

    if (filter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTickets(filtered);
  }, [tickets, filter, searchTerm]);

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

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PENDING:
        return <ClockIcon className="h-4 w-4" />;
      case TicketStatus.IN_PROGRESS:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case TicketStatus.RESOLVED:
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">My Tickets</h1>
          <p className="text-gray-600 mt-2">Manage and track your reported issues</p>
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
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">My Tickets</h1>
            <p className="text-gray-600 mt-2">Manage and track your reported issues</p>
          </div>
          <Link
            to="/tickets/create"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create New Ticket
          </Link>
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
            {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'All' : status.replace('_', ' ')}
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
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      {ticket.resolvedAt && (
                        <span>Resolved: {new Date(ticket.resolvedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mt-2 sm:mt-0"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View Details
                    </Link>
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
