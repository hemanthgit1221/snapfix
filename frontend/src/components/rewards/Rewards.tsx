import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GiftIcon, 
  TrophyIcon, 
  SparklesIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { rewardService, Voucher, VoucherRedemption } from '../../services/rewardService';
import VoucherRedemptionModal from './VoucherRedemptionModal';
import RedeemedVoucherModal from './RedeemedVoucherModal';

const Rewards: React.FC = () => {
  const { userPoints, refreshUserPoints } = useAuth();
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [redeemedVouchers, setRedeemedVouchers] = useState<VoucherRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [selectedRedemption, setSelectedRedemption] = useState<VoucherRedemption | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showRedeemedModal, setShowRedeemedModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'redeemed'>('available');

  useEffect(() => {
    fetchVoucherData();
  }, []);

  const fetchVoucherData = async () => {
    setLoading(true);
    try {
      const [availableResponse, redeemedResponse] = await Promise.all([
        rewardService.getAvailableVouchers(),
        rewardService.getRedeemedVouchers()
      ]);
      
      if (availableResponse.success) {
        // Sort available vouchers by points required (ascending)
        const sortedVouchers = availableResponse.data.sort((a, b) => a.pointsRequired - b.pointsRequired);
        setAvailableVouchers(sortedVouchers);
      }
      
      if (redeemedResponse.success) {
        setRedeemedVouchers(redeemedResponse.data);
      }
    } catch (error) {
      console.error('Error fetching voucher data:', error);
    }
    
    setLoading(false);
  };

  const handleRedeemVoucher = (voucher: Voucher) => {
    if (userPoints >= voucher.pointsRequired) {
      setSelectedVoucher(voucher);
      setShowRedeemModal(true);
    }
  };

  const handleViewRedeemedVoucher = (redemption: VoucherRedemption) => {
    setSelectedRedemption(redemption);
    setShowRedeemedModal(true);
  };

  const confirmRedeem = async () => {
    if (selectedVoucher) {
      try {
        const response = await rewardService.redeemVoucher(selectedVoucher.id);
        if (response.success) {
          // Refresh user points and voucher data
          await refreshUserPoints();
          await fetchVoucherData();
        } else {
          throw new Error(response.message || 'Redemption failed');
        }
      } catch (error) {
        console.error('Error redeeming voucher:', error);
        throw error; // Re-throw to handle in modal
      }
    }
  };

  const canRedeemVoucher = (voucher: Voucher) => {
    return userPoints >= voucher.pointsRequired;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl shadow-sm p-6 text-white"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-poppins">🎁 Voucher Center</h1>
            <p className="mt-2 opacity-90">Redeem your points for amazing rewards</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-8 w-8" />
              <div>
                <p className="text-3xl font-bold">{userPoints}</p>
                <p className="text-sm opacity-90">Available Points</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'available'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Available Vouchers ({availableVouchers.length})
        </button>
        <button
          onClick={() => setActiveTab('redeemed')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'redeemed'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Vouchers ({redeemedVouchers.length})
        </button>
      </div>

      {/* Available Vouchers */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableVouchers.map((voucher) => (
            <motion.div
              key={voucher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <GiftIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{voucher.pointsRequired}</p>
                    <p className="text-sm text-gray-500">points</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{voucher.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{voucher.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {voucher.discount}
                  </span>
                  <span className="text-sm text-gray-500">{voucher.category}</span>
                </div>

                <button
                  onClick={() => handleRedeemVoucher(voucher)}
                  disabled={!canRedeemVoucher(voucher)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    canRedeemVoucher(voucher)
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canRedeemVoucher(voucher) ? 'Redeem Now' : 'Insufficient Points'}
                </button>
              </div>
            </motion.div>
          ))}

          {availableVouchers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <GiftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vouchers available</h3>
              <p className="text-gray-500">Check back later for new rewards!</p>
            </div>
          )}
        </div>
      )}

      {/* Redeemed Vouchers */}
      {activeTab === 'redeemed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {redeemedVouchers.map((redemption) => (
            <motion.div
              key={redemption.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrophyIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(redemption.status)}`}>
                    {getStatusText(redemption.status)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {redemption.voucherName || 'Voucher'}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {redemption.voucherDescription || 'Voucher description not available'}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Code: {redemption.voucherCode}</span>
                  <span className="text-sm font-medium text-gray-900">{redemption.pointsUsed} pts</span>
                </div>

                <button
                  onClick={() => handleViewRedeemedVoucher(redemption)}
                  className="w-full py-2 px-4 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>View Details</span>
                </button>
              </div>
            </motion.div>
          ))}

          {redeemedVouchers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <TrophyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vouchers redeemed yet</h3>
              <p className="text-gray-500">Start earning points and redeem your first voucher!</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <VoucherRedemptionModal
        voucher={selectedVoucher}
        isOpen={showRedeemModal}
        onClose={() => {
          setShowRedeemModal(false);
          setSelectedVoucher(null);
        }}
        onConfirm={confirmRedeem}
      />

      <RedeemedVoucherModal
        redemption={selectedRedemption}
        isOpen={showRedeemedModal}
        onClose={() => {
          setShowRedeemedModal(false);
          setSelectedRedemption(null);
        }}
      />
    </div>
  );
};

export default Rewards;