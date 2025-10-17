import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  XMarkIcon,
  UserIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { dashboardApi } from '../../services/api';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  assignedTickets?: number;
}

interface AssignTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (staffId: number) => void;
  ticketId: string;
  currentAssignedTo?: StaffMember | null;
  onStaffUpdate?: () => void; // Callback to refresh staff data
}

const AssignTicketModal: React.FC<AssignTicketModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  ticketId,
  currentAssignedTo,
  onStaffUpdate
}) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Function to fetch staff data
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getStaffMembers();
      const staffData = (response as any) || []; // Handle direct data return
      
      // Transform API data to match StaffMember interface
      const transformedStaff: StaffMember[] = staffData.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: true, // Assume all users are active
        assignedTickets: user.assignedTickets || 0 // Use assignedTickets field from backend
      }));
      
      setStaff(transformedStaff);
      console.log('✅ Staff data fetched:', transformedStaff);
    } catch (error) {
      console.error('❌ Failed to fetch staff data:', error);
      // Fallback to empty array on error
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchStaff();
    }
  }, [isOpen]);

  // Reset selected staff when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedStaff(null);
      setSearchTerm('');
      setAssigning(false);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const filteredStaff = staff.filter(member => 
    member.isActive && (
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAssign = async () => {
    if (selectedStaff && !assigning) {
      setAssigning(true);
      setSuccessMessage(null);
      try {
        await onAssign(selectedStaff.id);
        
        // Show success message
        setSuccessMessage(`Ticket successfully assigned to ${selectedStaff.name}!`);
        
        // Refresh staff data to update workload counts
        await fetchStaff();
        if (onStaffUpdate) {
          onStaffUpdate();
        }
        
        // Close modal after a short delay to show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (error) {
        console.error('Failed to assign ticket:', error);
        setSuccessMessage('Failed to assign ticket. Please try again.');
        // Keep modal open on error so user can retry
      } finally {
        setAssigning(false);
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'DEPARTMENT_HEAD':
        return 'bg-purple-100 text-purple-800';
      case 'STAFF':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkloadColor = (tickets: number) => {
    if (tickets === 0) return 'text-green-600';
    if (tickets <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-2xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Assign Ticket</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">Select a staff member to assign ticket {ticketId}</p>
            {currentAssignedTo && (
              <p className="text-xs sm:text-sm text-blue-600 mt-1">
                Currently assigned to: {currentAssignedTo.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search and Refresh */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <button
              onClick={fetchStaff}
              disabled={loading}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Refresh staff data"
            >
              <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Success/Error Message */}
        {successMessage && (
          <div className={`p-4 sm:p-6 border-b border-gray-200 ${
            successMessage.includes('successfully') 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`flex items-center gap-2 ${
              successMessage.includes('successfully') 
                ? 'text-green-800' 
                : 'text-red-800'
            }`}>
              {successMessage.includes('successfully') ? (
                <CheckIcon className="h-5 w-5" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Staff List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="p-4 sm:p-6">
              <div className="animate-pulse space-y-3 sm:space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 sm:h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-4 sm:p-6 text-center">
              <UserIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
              {filteredStaff.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedStaff?.id === member.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedStaff(member)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        selectedStaff?.id === member.id ? 'bg-primary-100' : 'bg-gray-100'
                      }`}>
                        <UserIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          selectedStaff?.id === member.id ? 'text-primary-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{member.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{member.email}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            {member.role.replace('_', ' ')}
                          </span>
                          <span className={`text-xs font-medium ${getWorkloadColor(member.assignedTickets || 0)}`}>
                            {member.assignedTickets || 0} active tickets
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedStaff?.id === member.id && (
                      <div className="flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 bg-primary-600 rounded-full flex-shrink-0 ml-2">
                        <CheckIcon className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedStaff || assigning}
            className="px-4 sm:px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {assigning ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Assigning...</span>
              </>
            ) : selectedStaff ? (
              <span className="truncate">
                Assign to {selectedStaff.name.length > 15 ? `${selectedStaff.name.substring(0, 15)}...` : selectedStaff.name}
              </span>
            ) : (
              'Select Staff Member'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AssignTicketModal;
