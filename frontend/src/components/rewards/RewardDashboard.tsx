import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  TrophyIcon, 
  StarIcon,
  GiftIcon,
  SparklesIcon,
  FireIcon,
  AcademicCapIcon,
  HeartIcon,
  BoltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { rewardService } from '../../services/rewardService';

interface RewardStats {
  totalPoints: number;
  availablePoints: number;
  redeemedPoints: number;
  totalRewards: number;
  totalVouchers: number;
  nextMilestone: number;
  pointsToNextMilestone: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
  category?: string;
}

interface LeaderboardUser {
  userId: number;
  userName: string;
  userEmail: string;
  totalPoints: number;
  totalRewards: number;
  userRole: string;
  rank?: number;
}

const RewardDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<RewardStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard'>('overview');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, achievementsResponse, leaderboardResponse] = await Promise.all([
        rewardService.getRewardStats(),
        rewardService.getMyAchievements(),
        rewardService.getRewardLeaderboard(10)
      ]);
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      
      if (achievementsResponse.success) {
        console.log('Achievements loaded:', achievementsResponse.data);
        setAchievements(achievementsResponse.data);
      } else {
        console.log('Achievements API failed:', achievementsResponse);
      }
      
      if (leaderboardResponse.success) {
        setLeaderboard(leaderboardResponse.data.map((user, index) => ({
          ...user,
          rank: index + 1
        })));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getLevelFromPoints = (points: number) => {
    if (points >= 1000) return { level: 'Grand Master', color: 'text-purple-600', icon: '👑' };
    if (points >= 500) return { level: 'Expert', color: 'text-blue-600', icon: '🏆' };
    if (points >= 250) return { level: 'Advanced', color: 'text-green-600', icon: '⭐' };
    if (points >= 100) return { level: 'Intermediate', color: 'text-yellow-600', icon: '🎯' };
    return { level: 'Beginner', color: 'text-gray-600', icon: '🌱' };
  };

  const getAchievementColor = (category: string) => {
    switch (category) {
      case 'points': return 'bg-yellow-100 text-yellow-800';
      case 'tickets': return 'bg-blue-100 text-blue-800';
      case 'special': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
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

  const userLevel = getLevelFromPoints(stats?.totalPoints || 0);

  return (
    <div className="space-y-6">
      {/* Header with User Level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl shadow-sm p-6 text-white"
      >
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold font-poppins">🏆 Reward Dashboard</h1>
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="mt-2 opacity-90">Track your progress and achievements</p>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{userLevel.icon}</span>
                <div>
                  <p className="text-lg font-semibold">{userLevel.level}</p>
                  <p className="text-sm opacity-90">{stats?.totalPoints || 0} points</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-8 w-8" />
              <div>
                <p className="text-3xl font-bold">{stats?.totalPoints || 0}</p>
                <p className="text-sm opacity-90">Total Points</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Points</p>
              <p className="text-2xl font-bold text-green-600">{stats?.availablePoints || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <GiftIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tickets Resolved</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.totalRewards || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrophyIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vouchers Redeemed</p>
              <p className="text-2xl font-bold text-purple-600">{stats?.totalVouchers || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Milestone</p>
              <p className="text-2xl font-bold text-orange-600">{stats?.nextMilestone || 100}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FireIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 font-poppins">Progress to Next Level</h2>
          <span className="text-sm font-medium text-gray-600">
            {stats?.pointsToNextMilestone || 0} points to go
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min(100, ((stats?.totalPoints || 0) % 100) / 100 * 100)}%` 
            }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">
          Level {Math.floor((stats?.totalPoints || 0) / 100) + 1} - {userLevel.level}
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'achievements'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Achievements ({achievements.filter(a => a.unlocked).length})
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Leaderboard
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrophyIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Ticket Resolved</p>
                      <p className="text-xs text-gray-600">+50 points earned</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <StarIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Achievement Unlocked</p>
                      <p className="text-xs text-gray-600">First Ticket Resolved</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/rewards/vouchers')}
                    className="w-full flex items-center justify-between p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <GiftIcon className="h-5 w-5 text-primary-600" />
                      <span className="text-sm font-medium text-primary-900">Redeem Vouchers</span>
                    </div>
                    <span className="text-xs text-primary-600">{stats?.availablePoints || 0} points</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('achievements')}
                    className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <TrophyIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">View Achievements</span>
                    </div>
                    <span className="text-xs text-green-600">{achievements.filter(a => a.unlocked).length} unlocked</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {achievements.length === 0 ? (
              <div className="text-center py-8">
                <TrophyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No achievements unlocked yet</p>
                <p className="text-sm text-gray-400 mt-2">Complete tasks to unlock achievements!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                    {achievement.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                    <p className="text-xs text-gray-600">+{achievement.points} points</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">{achievement.description}</p>
                {achievement.unlocked && achievement.unlockedAt && (
                  <p className="text-xs text-gray-500">
                    Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {leaderboard.map((leaderboardUser, index) => (
              <motion.div
                key={leaderboardUser.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  leaderboardUser.userId === user?.id
                    ? 'bg-primary-50 border-2 border-primary-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {leaderboardUser.userName}
                      {leaderboardUser.userId === user?.id && <span className="ml-2 text-primary-600">(You)</span>}
                    </p>
                    <p className="text-sm text-gray-600">{leaderboardUser.userRole}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{leaderboardUser.totalPoints} points</p>
                  <p className="text-sm text-gray-600">{leaderboardUser.totalRewards} tickets</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RewardDashboard;
