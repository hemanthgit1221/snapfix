import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GiftIcon, 
  TrophyIcon, 
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface Reward {
  id: number;
  points: number;
  description: string;
  ticketId: string;
  status: 'PENDING' | 'REDEEMED' | 'EXPIRED';
  createdAt: string;
  redeemedAt?: string;
}

interface Voucher {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  discount: string;
  validUntil: string;
  category: string;
}

const Rewards: React.FC = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  useEffect(() => {
    const fetchRewardsData = async () => {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock rewards data
      setRewards([
        {
          id: 1,
          points: 50,
          description: 'Ticket SF2024001 resolved',
          ticketId: 'SF2024001',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 2,
          points: 75,
          description: 'Ticket SF2024002 resolved',
          ticketId: 'SF2024002',
          status: 'REDEEMED',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          redeemedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          points: 100,
          description: 'Ticket SF2024003 resolved',
          ticketId: 'SF2024003',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 259200000).toISOString()
        }
      ]);

      // Mock vouchers data
      setVouchers([
        {
          id: 1,
          name: 'Cafeteria Voucher',
          description: '20% off on any meal',
          pointsRequired: 100,
          discount: '20%',
          validUntil: '2024-12-31',
          category: 'Food'
        },
        {
          id: 2,
          name: 'Bookstore Discount',
          description: '15% off on textbooks',
          pointsRequired: 150,
          discount: '15%',
          validUntil: '2024-12-31',
          category: 'Education'
        },
        {
          id: 3,
          name: 'Printing Credits',
          description: '50 free printing pages',
          pointsRequired: 75,
          discount: '50 pages',
          validUntil: '2024-12-31',
          category: 'Services'
        },
        {
          id: 4,
          name: 'Gym Access',
          description: '1 month free gym membership',
          pointsRequired: 200,
          discount: '1 month',
          validUntil: '2024-12-31',
          category: 'Fitness'
        }
      ]);

      setLoading(false);
    };

    fetchRewardsData();
  }, []);

  const handleRedeemVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setShowRedeemModal(true);
  };

  const confirmRedeem = () => {
    if (selectedVoucher) {
      // TODO: Implement actual redemption logic
      console.log('Redeeming voucher:', selectedVoucher);
      setShowRedeemModal(false);
      setSelectedVoucher(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REDEEMED':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="h-4 w-4" />;
      case 'REDEEMED':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'EXPIRED':
        return <XMarkIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Food':
        return 'bg-orange-100 text-orange-800';
      case 'Education':
        return 'bg-blue-100 text-blue-800';
      case 'Services':
        return 'bg-green-100 text-green-800';
      case 'Fitness':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Rewards</h1>
          <p className="text-gray-600 mt-2">Track your points and redeem vouchers</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Points Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl shadow-sm p-6 text-white"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-poppins">Rewards Center</h1>
            <p className="mt-2 opacity-90">Track your points and redeem vouchers</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-8 w-8" />
              <div>
                <p className="text-3xl font-bold">{user?.points || 0}</p>
                <p className="text-sm opacity-90">Total Points</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Points Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 font-poppins">Points Progress</h2>
          <div className="flex items-center space-x-2">
            <TrophyIcon className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600">Next milestone: 500 points</span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className="bg-gradient-to-r from-primary-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((user?.points || 0) / 500) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">
          {user?.points || 0} / 500 points to next milestone
        </p>
      </motion.div>

      {/* Available Vouchers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 font-poppins mb-4">Available Vouchers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.map((voucher, index) => (
            <motion.div
              key={voucher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{voucher.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{voucher.description}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(voucher.category)}`}>
                  {voucher.category}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <GiftIcon className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {voucher.pointsRequired} points
                  </span>
                </div>
                
                <button
                  onClick={() => handleRedeemVoucher(voucher)}
                  disabled={(user?.points || 0) < voucher.pointsRequired}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    (user?.points || 0) >= voucher.pointsRequired
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {(user?.points || 0) >= voucher.pointsRequired ? 'Redeem' : 'Insufficient Points'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Rewards History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 font-poppins mb-4">Rewards History</h2>
        <div className="space-y-4">
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <StarIcon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">+{reward.points} points</p>
                  <p className="text-sm text-gray-600">{reward.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(reward.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reward.status)}`}>
                {getStatusIcon(reward.status)}
                <span className="ml-1">{reward.status}</span>
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Redeem Modal */}
      {showRedeemModal && selectedVoucher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <GiftIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Redeem Voucher
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to redeem <strong>{selectedVoucher.name}</strong> for {selectedVoucher.pointsRequired} points?
              </p>
              <p className="text-xs text-gray-500 mb-6">
                This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRedeemModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRedeem}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Confirm Redeem
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Rewards;
