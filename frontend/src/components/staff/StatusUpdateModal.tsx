import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  MapPinIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { TicketStatus } from '../../types';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  currentStatus: TicketStatus;
  onStatusUpdate: (ticketId: number, newStatus: TicketStatus) => void;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  ticketId,
  currentStatus,
  onStatusUpdate
}) => {
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset selected status when modal opens with a new ticket
  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus);
    }
  }, [isOpen, currentStatus]);

  const statusOptions = [
    {
      status: TicketStatus.IN_PROGRESS,
      label: 'In Progress',
      description: 'Work is actively being done on this ticket',
      icon: <ExclamationTriangleIcon className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      hoverColor: 'hover:bg-blue-200'
    },
    {
      status: TicketStatus.AT_SITE,
      label: 'At Site',
      description: 'Staff member is currently at the location',
      icon: <MapPinIcon className="h-5 w-5" />,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      hoverColor: 'hover:bg-purple-200'
    },
    {
      status: TicketStatus.WAITING_FOR_MATERIAL,
      label: 'Waiting for Material',
      description: 'Work is pending due to material requirements',
      icon: <TruckIcon className="h-5 w-5" />,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      hoverColor: 'hover:bg-orange-200'
    },
    {
      status: TicketStatus.RESOLVED,
      label: 'Resolved',
      description: 'Issue has been fixed and verified',
      icon: <CheckCircleIcon className="h-5 w-5" />,
      color: 'bg-green-100 text-green-800 border-green-200',
      hoverColor: 'hover:bg-green-200'
    },
    {
      status: TicketStatus.CLOSED,
      label: 'Closed',
      description: 'Ticket is closed and no further action needed',
      icon: <CheckCircleIcon className="h-5 w-5" />,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      hoverColor: 'hover:bg-gray-200'
    }
  ];

  const handleUpdateStatus = async () => {
    if (selectedStatus === currentStatus) {
      console.log('🔄 StatusUpdateModal: No change needed, closing modal');
      onClose();
      return;
    }

    console.log(`🔄 StatusUpdateModal: Updating ticket ${ticketId} from ${currentStatus} to ${selectedStatus}`);
    setIsUpdating(true);
    try {
      await onStatusUpdate(ticketId, selectedStatus);
      console.log(`✅ StatusUpdateModal: Status update successful for ticket ${ticketId}`);
      onClose();
    } catch (error) {
      console.error('❌ StatusUpdateModal: Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-sm w-full max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 font-poppins">
            Update Ticket Status
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Current Status */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Current Status:</p>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <ClockIcon className="h-4 w-4 mr-1" />
            {currentStatus.replace('_', ' ')}
          </div>
        </div>

        {/* Status Options - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <p className="text-sm text-gray-600 mb-4">Select new status:</p>
            <div className="space-y-2 sm:space-y-3">
              {statusOptions.map((option) => (
                <button
                  key={option.status}
                  onClick={() => setSelectedStatus(option.status)}
                  className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    selectedStatus === option.status
                      ? `${option.color} border-current`
                      : 'border-gray-200 hover:border-gray-300'
                  } ${option.hoverColor}`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base">{option.label}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 bg-white">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateStatus}
            disabled={isUpdating || selectedStatus === currentStatus}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 order-1 sm:order-2"
          >
            {isUpdating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : (
              <span>Update Status</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StatusUpdateModal;
