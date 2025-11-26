import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TicketCategory, TicketPriority, DuplicateCheckResponse } from '../../types';
import { CameraIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../contexts/AuthContext';
import DuplicateWarningModal from './DuplicateWarningModal';

const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: '',
    building: '',
    category: TicketCategory.OTHERS,
    description: '',
    priority: TicketPriority.MEDIUM
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [duplicateData, setDuplicateData] = useState<DuplicateCheckResponse | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [isCreatingDuplicate, setIsCreatingDuplicate] = useState(false);
  const isBlacklisted = user?.isBlacklisted || false;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const checkForDuplicates = async () => {
    if (!formData.roomNumber || !formData.category || !formData.description) {
      return false;
    }

    setIsCheckingDuplicates(true);
    try {
      const duplicateRequest = {
        roomNumber: formData.roomNumber,
        floor: formData.floor,
        building: formData.building,
        category: formData.category,
        description: formData.description,
        photo: photo || new File([], '')
      };

      const response = await ticketService.checkDuplicates(duplicateRequest);
      
      if (response && response.hasDuplicates) {
        setDuplicateData(response);
        setShowDuplicateModal(true);
        return true; // Duplicates found
      }
      return false; // No duplicates
    } catch (err) {
      console.error('Error checking duplicates:', err);
      return false; // Continue with creation if check fails
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is blacklisted
    if (isBlacklisted) {
      setError('Your access has been revoked. Contact your admin.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      // First check for duplicates
      const hasDuplicates = await checkForDuplicates();
      if (hasDuplicates) {
        setIsSubmitting(false);
        return; // Stop here, modal will handle the rest
      }

      // No duplicates found, proceed with creation
      await createTicket(false);
    } catch (err: any) {
      console.error('Failed to create ticket:', err);
      const errorMessage = err.message || 'Failed to create ticket. Please try again.';
      if (errorMessage.includes('access has been revoked')) {
        setError('Your access has been revoked. Contact your admin.');
      } else {
        setError(errorMessage);
      }
      setIsSubmitting(false);
    }
  };

  const createTicket = async (forceCreate: boolean, parentTicketId?: string) => {
    try {
      const ticketData = {
        roomNumber: formData.roomNumber,
        floor: formData.floor,
        building: formData.building,
        category: formData.category,
        description: formData.description,
        priority: formData.priority as TicketPriority,
        photo: photo || new File([], '')
      };

      const response = await ticketService.createTicket(ticketData, forceCreate, parentTicketId);
      
      // The backend returns TicketResponse directly, not wrapped in success object
      if (response) {
        console.log('Ticket created successfully:', response);
        navigate('/tickets');
      } else {
        throw new Error('Failed to create ticket');
      }
    } catch (err: any) {
      console.error('Failed to create ticket:', err);
      setError(err.message || 'Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedAnyway = () => {
    setShowDuplicateModal(false);
    // If there's a suggested parent ticket, create as duplicate, otherwise force create
    const parentTicketId = duplicateData?.suggestedParentTicket?.ticketId;
    createTicket(true, parentTicketId); // Force create with optional parent ticket
  };

  const handleWithdraw = () => {
    setShowDuplicateModal(false);
    // Reset form and close modal
    setFormData({
      roomNumber: '',
      floor: '',
      building: '',
      category: TicketCategory.PLUMBING,
      description: '',
      priority: TicketPriority.MEDIUM
    });
    setPhoto(null);
    setPhotoPreview(null);
    setError('');
  };

  const handleCreateAsDuplicate = async (parentTicketId: string) => {
    setIsCreatingDuplicate(true);
    setShowDuplicateModal(false);
    
    try {
      const ticketData = {
        roomNumber: formData.roomNumber,
        floor: formData.floor || '',
        building: formData.building || '',
        category: formData.category,
        description: formData.description,
        priority: formData.priority as TicketPriority,
        photo: photo
      };

      const response = await ticketService.createTicket(ticketData, false, parentTicketId);
      
      // The backend returns TicketResponse directly, not wrapped in success object
      if (response) {
        // Show success message
        alert('Complaint created as duplicate successfully!');
        // Reset form
        setFormData({
          roomNumber: '',
          floor: '',
          building: '',
          category: TicketCategory.PLUMBING,
          description: '',
          priority: TicketPriority.MEDIUM
        });
        setPhoto(null);
        setPhotoPreview(null);
        setError('');
      }
    } catch (err) {
      console.error('Error creating duplicate ticket:', err);
      setError('Failed to create duplicate ticket. Please try again.');
    } finally {
      setIsCreatingDuplicate(false);
    }
  };

  const handleViewTicket = (ticketId: string) => {
    navigate(`/tickets/ticket/${ticketId}`);
  };

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
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-poppins">Create New Ticket</h1>
          <p className="text-blue-100 mt-2">Report a new issue with photo and details</p>
        </div>
      </motion.div>

      {/* Blacklist Warning Banner */}
      {isBlacklisted && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-3xl shadow-xl p-6 border-2 border-red-300"
        >
          <div className="flex items-center gap-4">
            <ExclamationTriangleIcon className="h-8 w-8 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold font-poppins mb-1">Access Revoked</h3>
              <p className="text-red-100">Your access has been revoked. Contact your admin.</p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20 ${isBlacklisted ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm shadow-md"
            >
              {error}
            </motion.div>
          )}

          {/* Room Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Room Number *
              </label>
              <input
                type="text"
                id="roomNumber"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
                placeholder="e.g., 101, 302, 201...."
              />
            </div>
            
            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-2">
                Floor
              </label>
              <input
                type="text"
                id="floor"
                name="floor"
                value={formData.floor}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
                placeholder="e.g., 1st, Ground"
              />
            </div>
            
            <div>
              <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-2">
                Building
              </label>
              <input
                type="text"
                id="building"
                name="building"
                value={formData.building}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
                placeholder="e.g., ICT, CRL...."
              />
            </div>
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
              >
                <option value={TicketCategory.PLUMBING}>Plumbing</option>
                <option value={TicketCategory.ELECTRICAL}>Electrical</option>
                <option value={TicketCategory.HOUSEKEEPING}>Housekeeping</option>
                <option value={TicketCategory.AC_WATER}>AC</option>
                <option value={TicketCategory.OTHERS}>Others</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
              >
                <option value={TicketPriority.LOW}>Low</option>
                <option value={TicketPriority.MEDIUM}>Medium</option>
                <option value={TicketPriority.HIGH}>High</option>
                <option value={TicketPriority.URGENT}>Urgent</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 backdrop-blur-sm"
              placeholder="Please provide a detailed description of the issue..."
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo (Required)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gradient-to-br from-gray-50 to-blue-50/30 hover:border-indigo-400 transition-all duration-300">
              {photoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="mx-auto h-40 w-40 object-cover rounded-xl shadow-lg"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </motion.button>
                </div>
              ) : (
                <div>
                  <CameraIcon className="mx-auto h-16 w-16 text-gray-400" />
                  <div className="mt-4">
                    <label
                      htmlFor="photo"
                      className="cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Choose Photo
                    </label>
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Upload a photo of the issue (Max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tickets')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all duration-300"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={isSubmitting || isCheckingDuplicates || isCreatingDuplicate || isBlacklisted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              {isCheckingDuplicates ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Checking for duplicates...</span>
                </div>
              ) : isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </div>
              ) : isCreatingDuplicate ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating duplicate...</span>
                </div>
              ) : (
                'Create Ticket'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Duplicate Warning Modal */}
      {duplicateData && (
        <DuplicateWarningModal
          isOpen={showDuplicateModal}
          onClose={() => setShowDuplicateModal(false)}
          duplicateData={duplicateData}
          onProceedAnyway={handleProceedAnyway}
          onViewTicket={handleViewTicket}
          onWithdraw={handleWithdraw}
          onCreateAsDuplicate={handleCreateAsDuplicate}
        />
      )}
    </div>
  );
};

export default CreateTicket;
