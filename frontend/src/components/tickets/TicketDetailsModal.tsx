import React from 'react';
import { Ticket } from '../../types';
import { formatRelativeTime, formatDateOnly } from '../../utils/dateUtils';
import { 
  XMarkIcon,
  MapPinIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface TicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  isOpen,
  onClose,
  ticket
}) => {
  if (!isOpen || !ticket) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'AT_SITE': return 'bg-purple-100 text-purple-800';
      case 'WAITING_FOR_MATERIAL': return 'bg-orange-100 text-orange-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {ticket.ticketId}
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              {/* Location Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  Location Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Room:</strong> {ticket.roomNumber}</p>
                  {ticket.floor && <p><strong>Floor:</strong> {ticket.floor}</p>}
                  {ticket.building && <p><strong>Building:</strong> {ticket.building}</p>}
                </div>
              </div>

              {/* Category Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <TagIcon className="w-5 h-5 mr-2" />
                  Category Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Category:</strong> {ticket.category.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-2 text-gray-500" />
                    <span><strong>Created:</strong> {formatRelativeTime(ticket.createdAt)}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-6" title={formatDateOnly(ticket.createdAt)}>
                    {formatDateOnly(ticket.createdAt)}
                  </div>
                  {ticket.resolvedAt && (
                    <>
                      <div className="flex items-center">
                        <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                        <span><strong>Resolved:</strong> {formatRelativeTime(ticket.resolvedAt)}</span>
                      </div>
                      <div className="text-xs text-gray-500 ml-6" title={formatDateOnly(ticket.resolvedAt)}>
                        {formatDateOnly(ticket.resolvedAt)}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Assignment Information */}
              {ticket.assignedTo && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2" />
                    Assignment
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Assigned to:</strong> {ticket.assignedTo.name}</p>
                    <p><strong>Email:</strong> {ticket.assignedTo.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Description and Photo */}
            <div className="space-y-6">
              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {ticket.description}
                </p>
              </div>

              {/* Photo */}
              {ticket.photoUrl && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Photo
                  </h3>
                  <div className="flex justify-center">
                    <img
                      src={ticket.photoUrl}
                      alt="Ticket"
                      className="max-w-full h-auto rounded-lg shadow-md max-h-64"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* User Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Submitted by
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {ticket.user.name}</p>
                  <p><strong>Email:</strong> {ticket.user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700 transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;
