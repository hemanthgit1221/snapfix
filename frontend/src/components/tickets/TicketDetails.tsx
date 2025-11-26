import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  TagIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { Ticket, TicketComment, TicketStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardApi } from '../../services/api';
import { userManagementService } from '../../services/userManagementService';
import { formatRelativeTime, formatDateOnly } from '../../utils/dateUtils';
import StatusUpdateModal from '../staff/StatusUpdateModal';
import ImageViewerModal from '../common/ImageViewerModal';
import { FlagIcon } from '@heroicons/react/24/outline';

const TicketDetails: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isReviewMode = location.state?.reviewMode || false;
  const fromAdmin = location.state?.fromAdmin || false;
  const fromStaff = location.state?.fromStaff || false;
  const fromAssignedTickets = location.state?.fromAssignedTickets || searchParams.get('from') === 'assigned-tickets';
  const returnToReview = location.state?.returnToReview || false;
  const originalTicketId = location.state?.originalTicketId;
  
  // Determine where to navigate back to based on the source
  const getBackNavigation = () => {
    if (returnToReview && originalTicketId) {
      // Return to the review page of the original ticket
      return `/tickets/${originalTicketId}`;
    }
    if (fromAdmin) {
      // If coming from admin, return to admin dashboard (not admin/tickets)
      return '/admin';
    }
    if (fromStaff) {
      return '/staff';
    }
    if (fromAssignedTickets) {
      return '/assigned-tickets';
    }
    return '/tickets';
  };
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [selectedImageTitle, setSelectedImageTitle] = useState('');
  const [isFlagging, setIsFlagging] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showFlagOnRejectModal, setShowFlagOnRejectModal] = useState(false);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!ticketId) return;
      
      try {
        setLoading(true);
        const response = await dashboardApi.getTicketDetails(ticketId);
        // Handle both wrapped and direct response formats
        let ticketData = (response as any);
        // If response has data property, use it
        if (ticketData?.data) {
          ticketData = ticketData.data;
        }
        // If response has success property, extract data
        if (ticketData?.success && ticketData?.data) {
          ticketData = ticketData.data;
        }
        console.log('🔍 Ticket data received:', ticketData);
        console.log('🔍 Ticket user:', ticketData?.user);
        console.log('🔍 Ticket userIsFlagged:', ticketData?.userIsFlagged);
        console.log('🔍 Ticket userIsBlacklisted:', ticketData?.userIsBlacklisted);
        console.log('🔍 Full response:', response);
        console.log('🔍 isReviewMode:', isReviewMode);
        setTicket(ticketData);
        
        // Fetch comments for this ticket
        await fetchComments();
      } catch (error) {
        console.error('Failed to fetch ticket details:', error);
        setTicket(null);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [ticketId]);

  const handleStatusUpdate = async (ticketId: number, newStatus: TicketStatus) => {
    if (!ticket) return;
    
    try {
      setUpdatingStatus(true);
      await dashboardApi.updateTicketStatus(ticketId, newStatus);
      
      // Refresh ticket data
      const response = await dashboardApi.getTicketDetails(ticket.ticketId);
      const updatedTicket = (response as any);
      setTicket(updatedTicket);
      
      console.log(`Ticket status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleApproveTicket = async () => {
    if (!ticket || !ticketId) return;
    
    try {
      setUpdatingStatus(true);
      await dashboardApi.updateTicketStatus(ticket.id, TicketStatus.IN_PROGRESS);
      
      // Refresh ticket data
      const response = await dashboardApi.getTicketDetails(ticketId);
      const updatedTicket = (response as any);
      setTicket(updatedTicket);
      
      console.log('Ticket approved successfully');
      // Navigate back to admin dashboard
      navigate('/admin');
    } catch (error) {
      console.error('Failed to approve ticket:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRejectTicket = async () => {
    if (!ticket || !ticketId) return;
    
    // Always show flag confirmation when rejecting
    setShowFlagOnRejectModal(true);
  };

  const performReject = async (shouldFlag: boolean) => {
    if (!ticket || !ticketId) return;
    
    try {
      setUpdatingStatus(true);
      setShowFlagOnRejectModal(false);
      setShowRejectConfirm(false);
      
      // Flag user if requested
      if (shouldFlag && !ticket.userIsFlagged) {
        try {
          const userId = ticket.user?.id || (ticket as any).userId;
          if (userId) {
            await userManagementService.flagUser(userId);
          }
        } catch (error) {
          console.error('Failed to flag user:', error);
        }
      }
      
      await dashboardApi.updateTicketStatus(ticket.id, TicketStatus.REJECTED);
      
      // Refresh ticket data
      const response = await dashboardApi.getTicketDetails(ticketId);
      const updatedTicket = (response as any);
      setTicket(updatedTicket);
      
      // If user was flagged, they're now blacklisted
      if (ticket.userIsFlagged || shouldFlag) {
        alert('Ticket rejected. User has been moved to blacklist.');
      } else {
        console.log('Ticket rejected');
      }
      
      // Navigate back to admin dashboard
      navigate('/admin');
    } catch (error) {
      console.error('Failed to reject ticket:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleFlagUser = async () => {
    if (!ticket) return;
    const userId = ticket.user?.id || (ticket as any).userId;
    if (!userId) {
      console.error('User ID not found in ticket');
      alert('Unable to flag user: User information not available');
      return;
    }
    
    try {
      setIsFlagging(true);
      await userManagementService.flagUser(userId);
      
      // Refresh ticket data
      const response = await dashboardApi.getTicketDetails(ticketId!);
      const updatedTicket = (response as any);
      setTicket(updatedTicket);
      
      console.log('User flagged successfully');
      alert('User flagged successfully');
    } catch (error) {
      console.error('Failed to flag user:', error);
      alert('Failed to flag user. Please try again.');
    } finally {
      setIsFlagging(false);
    }
  };

  const handleUnflagUser = async () => {
    if (!ticket) return;
    const userId = ticket.user?.id || (ticket as any).userId;
    if (!userId) {
      console.error('User ID not found in ticket');
      alert('Unable to unflag user: User information not available');
      return;
    }
    
    try {
      setIsFlagging(true);
      await userManagementService.unflagUser(userId);
      
      // Refresh ticket data
      const response = await dashboardApi.getTicketDetails(ticketId!);
      const updatedTicket = (response as any);
      setTicket(updatedTicket);
      
      console.log('User unflagged successfully');
      alert('User unflagged successfully');
    } catch (error) {
      console.error('Failed to unflag user:', error);
      alert('Failed to unflag user. Please try again.');
    } finally {
      setIsFlagging(false);
    }
  };

  const fetchComments = async () => {
    if (!ticketId) {
      console.log('No ticketId available for fetching comments');
      return;
    }
    
    try {
      console.log('Fetching comments for ticketId:', ticketId);
      const response = await dashboardApi.getTicketComments(ticketId);
      if (response.success) {
        setComments(response.data || []);
        console.log('Comments fetched successfully:', response.data);
      } else {
        console.error('Failed to fetch comments:', response.message);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !ticketId) {
      console.log('Cannot add comment - missing newComment or ticketId:', { newComment: newComment.trim(), ticketId });
      return;
    }

    setSubmittingComment(true);
    try {
      console.log('Adding comment for ticketId:', ticketId, 'comment:', newComment);
      const response = await dashboardApi.addComment(ticketId, newComment);
      console.log('Add comment response:', response);
      if (response.success) {
        // Refresh comments after successful post
        await fetchComments();
        setNewComment('');
        console.log('Comment added successfully');
      } else {
        console.error('Failed to add comment:', response.message);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleImageClick = (imageUrl: string, ticketId: string) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageTitle(`Ticket ${ticketId} - Issue Photo`);
    setShowImageViewer(true);
  };

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

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PENDING:
        return <ClockIcon className="h-4 w-4" />;
      case TicketStatus.IN_PROGRESS:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case TicketStatus.AT_SITE:
        return <MapPinIcon className="h-4 w-4" />;
      case TicketStatus.WAITING_FOR_MATERIAL:
        return <ExclamationTriangleIcon className="h-4 w-4" />;
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

  if (loading) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-3xl shadow-xl p-8 overflow-hidden"
        >
          <div className="relative z-10 animate-pulse">
            <div className="h-8 bg-white/20 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
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

  if (!ticket) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-12 text-center border border-white/20"
        >
          <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-4">Ticket Not Found</h1>
          <p className="text-gray-600 mb-6">The requested ticket could not be found.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (returnToReview && originalTicketId) {
                navigate(`/tickets/${originalTicketId}`, { 
                  state: { 
                    reviewMode: true, 
                    fromAdmin: true 
                  } 
                });
              } else {
                navigate(getBackNavigation());
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
          >
            {returnToReview ? 'Back to Review' : 'Back to Tickets'}
          </motion.button>
        </motion.div>
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
        <div className="relative z-10 flex items-center justify-between mb-4">
          <motion.button
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (returnToReview && originalTicketId) {
                navigate(`/tickets/${originalTicketId}`, { 
                  state: { 
                    reviewMode: true, 
                    fromAdmin: true 
                  } 
                });
              } else {
                navigate(getBackNavigation());
              }
            }}
            className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl px-4 py-2 transition-all duration-300 shadow-lg font-semibold"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>{returnToReview ? 'Back to Review' : 'Back to Tickets'}</span>
          </motion.button>
          
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
              {getStatusIcon(ticket.status)}
              <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority}
            </span>
          </div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-poppins">{ticket.ticketId}</h1>
            <p className="text-blue-100 mt-1">Created by {ticket.user.name}</p>
          </div>
          <div className="text-right text-sm text-blue-100">
            <p title={formatDateOnly(ticket.createdAt)}>
              Created: {formatRelativeTime(ticket.createdAt)}
            </p>
            <p title={formatDateOnly(ticket.updatedAt)}>
              Updated: {formatRelativeTime(ticket.updatedAt)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Flagged User Warning Banner */}
      {ticket.userIsFlagged && (user?.role === 'ADMIN' || user?.role === 'DEPARTMENT_HEAD') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 font-poppins">⚠️ WARNING: Flagged User</h3>
              <p className="text-sm text-amber-800">This ticket was created by a flagged user. It may be false. Please review carefully.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Review Mode Banner */}
      {isReviewMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900">Review Mode</h3>
              <p className="text-sm text-blue-700">Please review the ticket details below and decide whether to approve or reject this request.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Duplicate Information for Review Mode */}
      {isReviewMode && ticket?.isDuplicate && ticket?.parentTicketId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 rounded-xl p-4"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-orange-900 mb-2">⚠️ Possible Duplicate Ticket</h3>
              <p className="text-sm text-orange-700 mb-3">
                This ticket appears to be a duplicate of an existing ticket. Please review the parent ticket details below.
              </p>
              <div className="bg-white rounded-lg p-3 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Parent Ticket: {ticket.parentTicketId}</p>
                    <p className="text-xs text-gray-600">This ticket was created as a duplicate of the above ticket</p>
                  </div>
                  <button
                    onClick={() => navigate(`/tickets/${ticket.parentTicketId}`, { 
                      state: { 
                        fromAdmin: true, 
                        reviewMode: false,
                        returnToReview: true,
                        originalTicketId: ticket.ticketId
                      } 
                    })}
                    className="px-3 py-1 text-xs font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Issue Photo</h2>
            <img
              src={ticket.photoUrl}
              alt="Issue"
              className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleImageClick(ticket.photoUrl, ticket.ticketId)}
            />
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">{ticket.description}</p>
          </motion.div>

          {/* Comments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <ChatBubbleLeftIcon className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Comments ({comments.length})</h2>
            </div>
            
            <div className="space-y-4 mb-6">
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex space-x-3"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">{comment.userName}</p>
                        <p className="text-xs text-gray-500">
                          <span title={formatDateOnly(comment.createdAt)}>
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                        </p>
                      </div>
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-primary-600" />
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || submittingComment}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingComment ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <PaperAirplaneIcon className="h-4 w-4" />
                    )}
                    <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Information</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">
                    Room {ticket.roomNumber}, {ticket.floor} Floor
                  </p>
                  <p className="text-sm text-gray-600">{ticket.building}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <TagIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Category</p>
                  <p className="text-sm text-gray-600">{ticket.category}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-sm text-gray-600">
                    <span title={formatDateOnly(ticket.createdAt)}>
                      {formatRelativeTime(ticket.createdAt)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Assigned To */}
          {ticket.assignedTo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned To</h2>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{ticket.assignedTo.name}</p>
                  <p className="text-sm text-gray-600">{ticket.assignedTo.email}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              {/* Admin/Department Head Actions */}
              {(user?.role === 'ADMIN' || user?.role === 'DEPARTMENT_HEAD') && (
                <>
                  {/* Review Mode - Approve/Reject */}
                  {isReviewMode && ticket?.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={handleApproveTicket}
                        disabled={updatingStatus}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold"
                      >
                        {updatingStatus ? 'Processing...' : '✅ Approve Ticket'}
                      </button>
                      <button 
                        onClick={handleRejectTicket}
                        disabled={updatingStatus}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-semibold"
                      >
                        {updatingStatus ? 'Processing...' : '❌ Reject Ticket'}
                      </button>
                      
                      {/* Flag/Unflag User Actions in Review Mode - Always show in review mode */}
                      {ticket && (
                        <>
                          {!ticket.userIsFlagged ? (
                            <button 
                              onClick={handleFlagUser}
                              disabled={isFlagging}
                              className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 font-semibold shadow-lg"
                            >
                              <FlagIcon className="h-5 w-5" />
                              <span>{isFlagging ? 'Flagging...' : '🚩 Flag User'}</span>
                            </button>
                          ) : (
                            <button 
                              onClick={handleUnflagUser}
                              disabled={isFlagging}
                              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 font-semibold shadow-lg"
                            >
                              <FlagIcon className="h-5 w-5" />
                              <span>{isFlagging ? 'Unflagging...' : '🚩 Unflag User'}</span>
                            </button>
                          )}
                        </>
                      )}
                    </>
                  )}
                  
                  {/* Normal Mode - Regular Actions */}
                  {!isReviewMode && ticket?.status === 'PENDING' && (
                    <button 
                      onClick={() => handleStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS)}
                      disabled={updatingStatus}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {updatingStatus ? 'Updating...' : 'Approve & Assign to Staff'}
                    </button>
                  )}
                  
                  {ticket?.status === 'RESOLVED' && (
                    <button 
                      onClick={() => handleStatusUpdate(ticket.id, TicketStatus.CLOSED)}
                      disabled={updatingStatus}
                      className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {updatingStatus ? 'Updating...' : 'Close Ticket'}
                    </button>
                  )}
                </>
              )}
              
              {/* Staff Actions */}
              {(user?.role === 'STAFF') && (
                <>
                  {(ticket?.status === 'IN_PROGRESS' || ticket?.status === 'AT_SITE' || ticket?.status === 'WAITING_FOR_MATERIAL') && (
                    <button 
                      onClick={() => setShowStatusModal(true)}
                      disabled={updatingStatus}
                      className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                      <span>{updatingStatus ? 'Updating...' : 'Update Status'}</span>
                    </button>
                  )}
                </>
              )}
              
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Download Report
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && ticket && (
        <StatusUpdateModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          ticketId={ticket.id}
          currentStatus={ticket.status as TicketStatus}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        imageUrl={selectedImageUrl}
        title={selectedImageTitle}
        alt="Ticket Issue Photo"
      />

      {/* Flag on Reject Modal */}
      {showFlagOnRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full border-2 border-red-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900">Reject Ticket & Flag User?</h3>
            </div>
            <p className="text-gray-700 mb-4">
              You are about to reject this ticket. Would you like to flag this user?
            </p>
            {ticket?.userIsFlagged && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> This user is already flagged. Rejecting will automatically move them to blacklist.
                </p>
              </div>
            )}
            {!ticket?.userIsFlagged && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Flagging:</strong> If you flag this user and they create another false ticket, they will be automatically blacklisted.
                </p>
              </div>
            )}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFlagOnRejectModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              {!ticket?.userIsFlagged ? (
                <>
                  <button
                    onClick={() => performReject(false)}
                    disabled={updatingStatus}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-semibold"
                  >
                    {updatingStatus ? 'Processing...' : 'Reject Only'}
                  </button>
                  <button
                    onClick={() => performReject(true)}
                    disabled={updatingStatus}
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 font-semibold"
                  >
                    {updatingStatus ? 'Processing...' : 'Reject & Flag'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => performReject(false)}
                  disabled={updatingStatus}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-semibold"
                >
                  {updatingStatus ? 'Processing...' : 'Reject & Blacklist'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Confirmation Modal for Flagged Users (Legacy - keeping for safety) */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900">Confirm Rejection</h3>
            </div>
            <p className="text-gray-700 mb-6">
              This user is flagged. Rejecting this ticket will move them to blacklist. Are you sure you want to continue?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRejectConfirm(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => performReject(false)}
                disabled={updatingStatus}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-semibold"
              >
                {updatingStatus ? 'Processing...' : 'Reject & Blacklist'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;
