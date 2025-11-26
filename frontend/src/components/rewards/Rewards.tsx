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
        return 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30';
      case 'USED':
        return 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg shadow-blue-500/30';
      case 'EXPIRED':
        return 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg shadow-red-500/30';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/30';
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
        className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-3xl shadow-xl p-8 overflow-hidden text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="relative z-10 flex justify-between items-center">
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
      <div className="flex space-x-2 bg-white/80 backdrop-blur-md p-1 rounded-xl shadow-lg border border-white/20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'available'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Available Vouchers ({availableVouchers.length})
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('redeemed')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'redeemed'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          My Vouchers ({redeemedVouchers.length})
        </motion.button>
      </div>

      {/* Available Vouchers */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableVouchers.map((voucher) => (
            <motion.div
              key={voucher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30">
                    <GiftIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{voucher.pointsRequired}</p>
                    <p className="text-sm text-gray-500">points</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{voucher.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{voucher.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-md">
                    {voucher.discount}
                  </span>
                  <span className="text-sm text-gray-500">{voucher.category}</span>
                </div>

                <motion.button
                  whileHover={{ scale: canRedeemVoucher(voucher) ? 1.05 : 1 }}
                  whileTap={{ scale: canRedeemVoucher(voucher) ? 0.95 : 1 }}
                  onClick={() => handleRedeemVoucher(voucher)}
                  disabled={!canRedeemVoucher(voucher)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    canRedeemVoucher(voucher)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canRedeemVoucher(voucher) ? 'Redeem Now' : 'Insufficient Points'}
                </motion.button>
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
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/30">
                    <TrophyIcon className="h-6 w-6 text-white" />
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

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewRedeemedVoucher(redemption)}
                  className="w-full py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>View Details</span>
                </motion.button>
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