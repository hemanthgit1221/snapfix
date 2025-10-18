import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ClockIcon, GiftIcon } from '@heroicons/react/24/outline';
import { QRCodeSVG } from 'qrcode.react';
import { Voucher } from '../../services/rewardService';

interface VoucherRedemptionModalProps {
  voucher: Voucher | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const VoucherRedemptionModal: React.FC<VoucherRedemptionModalProps> = ({
  voucher,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [countdown, setCountdown] = useState(10);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [qrValue, setQrValue] = useState<string>('');

  const handleAutoRedeem = useCallback(async () => {
    if (!isRedeeming) {
      setIsRedeeming(true);
      try {
        await onConfirm();
        onClose();
      } catch (error) {
        console.error('Redemption failed:', error);
        setIsRedeeming(false);
      }
    }
  }, [isRedeeming, onConfirm, onClose]);

  useEffect(() => {
    if (isOpen && voucher) {
      setCountdown(10);
      setIsRedeeming(false);
      // Generate unique QR code value that includes user info and voucher details
      const uniqueId = `${voucher.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setQrValue(`VOUCHER:${voucher.id}:${uniqueId}:${voucher.name}`);
    }
  }, [isOpen, voucher]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleAutoRedeem();
    }
  }, [countdown, handleAutoRedeem]);

  if (!isOpen || !voucher) return null;

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
              <div className="p-2 bg-purple-100 rounded-lg">
                <GiftIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Redeem Voucher</h3>
                <p className="text-sm text-gray-500">Complete your redemption</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isRedeeming}
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Voucher Details */}
            <div className="text-center">
              <h4 className="text-xl font-bold text-gray-900 mb-2">{voucher.name}</h4>
              <p className="text-gray-600 mb-4">{voucher.description}</p>
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {voucher.discount} Discount
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                <QRCodeSVG
                  value={qrValue}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <ClockIcon className="h-5 w-5 text-orange-500" />
                <span className="text-lg font-semibold text-gray-900">
                  Auto-redeeming in {countdown}s
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  initial={{ width: "100%" }}
                  animate={{ width: `${(countdown / 10) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>
            </div>

            {/* Status Message */}
            <div className="text-center">
              {isRedeeming ? (
                <div className="flex items-center justify-center space-x-2 text-purple-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-sm font-medium">Processing redemption...</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Your voucher will be automatically redeemed. Please wait...
                </p>
              )}
            </div>

            {/* Points Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Points Required:</span>
                <span className="font-semibold text-gray-900">{voucher.pointsRequired} points</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
            <p className="text-xs text-gray-500 text-center">
              This voucher will be added to your account and can be used at participating locations.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoucherRedemptionModal;
