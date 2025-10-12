import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TicketCategory } from '../../types';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../../services/api';

const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: '',
    building: '',
    category: TicketCategory.OTHERS,
    description: '',
    priority: 'MEDIUM'
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('roomNumber', formData.roomNumber);
      submitData.append('floor', formData.floor);
      submitData.append('building', formData.building);
      submitData.append('category', formData.category);
      submitData.append('description', formData.description);
      submitData.append('priority', formData.priority);
      
      if (photo) {
        submitData.append('photo', photo);
      }

      // Call the actual API
      console.log('Submitting ticket:', submitData);
      console.log('Current token:', localStorage.getItem('token'));
      const response = await apiClient.upload('/tickets', submitData);
      
      console.log('Ticket created successfully:', response);
      
      // Navigate to tickets list
      navigate('/tickets');
    } catch (err: any) {
      console.error('Failed to create ticket:', err);
      setError(err.message || 'Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">Create New Ticket</h1>
        <p className="text-gray-600 mt-2">Report a new issue with photo and details</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 101, A205"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Main Building, Science Block"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={TicketCategory.PLUMBING}>Plumbing</option>
                <option value={TicketCategory.ELECTRICAL}>Electrical</option>
                <option value={TicketCategory.HOUSEKEEPING}>Housekeeping</option>
                <option value={TicketCategory.AC_WATER}>AC/Water</option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Please provide a detailed description of the issue..."
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo (Required)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="mx-auto h-32 w-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label
                      htmlFor="photo"
                      className="cursor-pointer bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
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
                  <p className="text-sm text-gray-500 mt-2">
                    Upload a photo of the issue (Max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Ticket'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateTicket;
