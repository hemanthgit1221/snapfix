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
import { formatRelativeTime, formatDateOnly } from '../../utils/dateUtils';
import StatusUpdateModal from '../staff/StatusUpdateModal';
import ImageViewerModal from '../common/ImageViewerModal';

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

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!ticketId) return;
      
      try {
        setLoading(true);
        const response = await dashboardApi.getTicketDetails(ticketId);
        const ticketData = (response as any);
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
    
    try {
      setUpdatingStatus(true);
      await dashboardApi.updateTicketStatus(ticket.id, TicketStatus.REJECTED);
      
      // Refresh ticket data
      const response = await dashboardApi.getTicketDetails(ticketId);
      const updatedTicket = (response as any);
      setTicket(updatedTicket);
      
      console.log('Ticket rejected');
      // Navigate back to admin dashboard
      navigate('/admin');
    } catch (error) {
      console.error('Failed to reject ticket:', error);
    } finally {
      setUpdatingStatus(false);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
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

  if (!ticket) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Ticket Not Found</h1>
          <p className="text-gray-600 mt-2">The requested ticket could not be found.</p>
          <button
            onClick={() => {
              if (returnToReview && originalTicketId) {
                // Return to the review page of the original ticket with review mode
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
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {returnToReview ? 'Back to Review' : 'Back to Tickets'}
          </button>
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
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              if (returnToReview && originalTicketId) {
                // Return to the review page of the original ticket with review mode
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
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>{returnToReview ? 'Back to Review' : 'Back to Tickets'}</span>
          </button>
          
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
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">{ticket.ticketId}</h1>
            <p className="text-gray-600 mt-1">Created by {ticket.user.name}</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p title={formatDateOnly(ticket.createdAt)}>
              Created: {formatRelativeTime(ticket.createdAt)}
            </p>
            <p title={formatDateOnly(ticket.updatedAt)}>
              Updated: {formatRelativeTime(ticket.updatedAt)}
            </p>
          </div>
        </div>
      </motion.div>

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
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {updatingStatus ? 'Processing...' : '✅ Approve Ticket'}
                      </button>
                      <button 
                        onClick={handleRejectTicket}
                        disabled={updatingStatus}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {updatingStatus ? 'Processing...' : '❌ Reject Ticket'}
                      </button>
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
    </div>
  );
};

export default TicketDetails;
