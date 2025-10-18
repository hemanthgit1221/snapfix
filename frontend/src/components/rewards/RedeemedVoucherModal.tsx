import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, GiftIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { QRCodeSVG } from 'qrcode.react';
import { VoucherRedemption } from '../../services/rewardService';

interface RedeemedVoucherModalProps {
  redemption: VoucherRedemption | null;
  isOpen: boolean;
  onClose: () => void;
}

const RedeemedVoucherModal: React.FC<RedeemedVoucherModalProps> = ({
  redemption,
  isOpen,
  onClose
}) => {
  if (!isOpen || !redemption) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'USED':
        return 'bg-blue-100 text-blue-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'USED':
        return 'Used';
      case 'EXPIRED':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <GiftIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Voucher Details</h3>
                <p className="text-sm text-gray-500">Your redeemed voucher</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Voucher Details */}
            <div className="text-center">
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {redemption.voucherName || 'Voucher'}
              </h4>
              <p className="text-gray-600 mb-4">
                {redemption.voucherDescription || 'Voucher description not available'}
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4">
                <span className={`px-3 py-1 rounded-full ${getStatusColor(redemption.status)}`}>
                  {getStatusText(redemption.status)}
                </span>
              </div>

              {/* Discount Info */}
              {redemption.discount && (
                <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {redemption.discount} Discount
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                <QRCodeSVG
                  value={redemption.voucherCode}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
            </div>

            {/* Voucher Code */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Voucher Code:</p>
              <div className="bg-gray-100 rounded-lg p-3">
                <code className="text-lg font-mono font-bold text-gray-900">
                  {redemption.voucherCode}
                </code>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-4">
              {/* Points Used */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Points Used:</span>
                <span className="font-semibold text-gray-900">{redemption.pointsUsed} points</span>
              </div>

              {/* Redeemed Date */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Redeemed:</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatDate(redemption.redeemedAt)}
                </span>
              </div>

              {/* Expiry Date */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Expires:</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatDate(redemption.expiryDate)}
                </span>
              </div>

              {/* Used Date (if applicable) */}
              {redemption.usedAt && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Used:</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatDate(redemption.usedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
            <p className="text-xs text-gray-500 text-center">
              Show this QR code or voucher code to redeem your discount at participating locations.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RedeemedVoucherModal;
