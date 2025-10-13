import React, { useState, useEffect } from 'react';
import { Ticket, DuplicateCheckResponse } from '../../types';
import TicketDetailsModal from './TicketDetailsModal';

interface DuplicateWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateData: DuplicateCheckResponse;
  onProceedAnyway: () => void;
  onViewTicket: (ticketId: string) => void;
  onWithdraw: () => void;
  onCreateAsDuplicate: (parentTicketId: string) => void;
}

const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  isOpen,
  onClose,
  duplicateData,
  onProceedAnyway,
  onViewTicket,
  onWithdraw,
  onCreateAsDuplicate
}) => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketDetails(true);
  };

  const handleCloseTicketDetails = () => {
    setShowTicketDetails(false);
    setSelectedTicket(null);
  };

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatSimilarityScore = (score: number) => {
    return Math.round(score * 100);
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.9) return 'text-red-600';
    if (score >= 0.8) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const getSimilarityLabel = (score: number) => {
    if (score >= 0.9) return 'Very High';
    if (score >= 0.8) return 'High';
    return 'Medium';
  };

  return (
    <div className="modal-backdrop">
      <div className="flex items-center justify-center min-h-full p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] z-[10000] relative" style={{ overflowY: 'scroll', scrollbarWidth: 'thin' }}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Similar Complaint Found
                </h2>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                  {duplicateData.potentialDuplicates.length} Similar
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-4 text-gray-600">
              We found {duplicateData.potentialDuplicates.length} similar complaint(s) in the same location and category. 
              You can either withdraw your complaint or create it as a duplicate of the existing one.
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {duplicateData.potentialDuplicates.map((ticket, index) => (
                <div key={ticket.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {ticket.ticketId}
                      </h3>
                      <div className="flex space-x-2">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          ticket.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          ticket.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                          ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          ticket.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${getSimilarityColor(duplicateData.maxSimilarityScore)}`}>
                        {formatSimilarityScore(duplicateData.maxSimilarityScore)}% similar
                      </div>
                      <div className="text-sm text-gray-500">
                        {getSimilarityLabel(duplicateData.maxSimilarityScore)} match
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Location Information</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Room:</strong> {ticket.roomNumber}</p>
                        {ticket.floor && <p><strong>Floor:</strong> {ticket.floor}</p>}
                        {ticket.building && <p><strong>Building:</strong> {ticket.building}</p>}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Details</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Category:</strong> {ticket.category.replace('_', ' ')}</p>
                        <p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</p>
                        {ticket.assignedTo && (
                          <p><strong>Assigned to:</strong> {ticket.assignedTo.name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900">Description</h4>
                      <button
                        onClick={() => handleViewTicket(ticket)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                    <p className="text-sm text-gray-700">{ticket.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="space-y-6">
              {duplicateData.suggestedParentTicket && (
                <div className={`border rounded-lg p-6 ${
                  duplicateData.maxSimilarityScore >= 0.9 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <h3 className={`text-xl font-bold mb-4 ${
                    duplicateData.maxSimilarityScore >= 0.9 
                      ? 'text-red-900' 
                      : 'text-blue-900'
                  }`}>
                    {duplicateData.maxSimilarityScore >= 0.9 ? '⚠️ High Duplicate Risk' : 'Recommended Action'}
                  </h3>
                  <p className={`text-base mb-6 ${
                    duplicateData.maxSimilarityScore >= 0.9 
                      ? 'text-red-700' 
                      : 'text-blue-700'
                  }`}>
                    The most similar complaint is <strong>{duplicateData.suggestedParentTicket.ticketId}</strong> 
                    ({formatSimilarityScore(duplicateData.maxSimilarityScore)}% similar).
                    {duplicateData.maxSimilarityScore >= 0.9 
                      ? ' This appears to be a duplicate. We strongly recommend withdrawing your complaint.' 
                      : ' We recommend creating your complaint as a duplicate of this one.'}
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={onWithdraw}
                      className={`px-6 py-3 text-base font-medium rounded-md transition-colors ${
                        duplicateData.maxSimilarityScore >= 0.9
                          ? 'text-white bg-green-600 hover:bg-green-700'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {duplicateData.maxSimilarityScore >= 0.9 ? '✅ Withdraw (Recommended)' : 'Withdraw Complaint'}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="text-base text-gray-600">
                  <p className="font-semibold">What would you like to do?</p>
                  <p className="text-sm mt-2">
                    {duplicateData.maxSimilarityScore >= 0.9 
                      ? 'Due to high similarity, we recommend withdrawing your complaint to avoid duplicates.'
                      : 'You can create it as a separate ticket if needed.'}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={onProceedAnyway}
                    className={`px-6 py-3 text-base font-medium border border-transparent rounded-md transition-colors ${
                      duplicateData.maxSimilarityScore >= 0.9
                        ? 'text-orange-700 bg-orange-100 hover:bg-orange-200'
                        : 'text-white bg-orange-600 hover:bg-orange-700'
                    }`}
                  >
                    {duplicateData.maxSimilarityScore >= 0.9 ? '⚠️ Continue Anyway' : 'Create Separate Ticket'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Details Modal */}
      <TicketDetailsModal
        isOpen={showTicketDetails}
        onClose={handleCloseTicketDetails}
        ticket={selectedTicket}
      />
    </div>
  );
};

export default DuplicateWarningModal;




