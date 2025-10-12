import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
  title?: string;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  alt = "Image",
  title = "View Image"
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full h-full max-w-7xl max-h-full flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Download Image"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          />
        </div>

        {/* Close on background click */}
        <div 
          className="absolute inset-0 -z-10" 
          onClick={onClose}
        />
      </motion.div>
    </div>
  );
};

export default ImageViewerModal;
