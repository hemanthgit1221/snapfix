import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [analyticsData] = useState({
    ticketsByCategory: {
      PLUMBING: 45,
      ELECTRICAL: 32,
      HOUSEKEEPING: 28,
      AC_WATER: 19,
      OTHERS: 12
    },
    ticketsByStatus: {
      PENDING: 23,
      IN_PROGRESS: 12,
      RESOLVED: 89,
      CLOSED: 32
    },
    ticketsByMonth: [
      { month: 'Jan', count: 15 },
      { month: 'Feb', count: 23 },
      { month: 'Mar', count: 18 },
      { month: 'Apr', count: 31 },
      { month: 'May', count: 28 },
      { month: 'Jun', count: 35 }
    ],
    averageResolutionTime: 2.5,
    topPerformers: [
      { name: 'John Smith', resolvedCount: 24 },
      { name: 'Sarah Johnson', resolvedCount: 19 },
      { name: 'Mike Davis', resolvedCount: 16 },
      { name: 'Lisa Wilson', resolvedCount: 14 }
    ]
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    };

    fetchAnalytics();
  }, [timeRange]);

  const categoryColors = {
    PLUMBING: 'bg-blue-500',
    ELECTRICAL: 'bg-yellow-500',
    HOUSEKEEPING: 'bg-green-500',
    AC_WATER: 'bg-purple-500',
    OTHERS: 'bg-gray-500'
  };

  const statusColors = {
    PENDING: 'bg-yellow-500',
    IN_PROGRESS: 'bg-blue-500',
    RESOLVED: 'bg-green-500',
    CLOSED: 'bg-gray-500'
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-3xl shadow-xl p-8 overflow-hidden"
        >
          <div className="relative z-10">
            <h1 className="text-3xl font-bold font-poppins">Analytics Dashboard</h1>
            <p className="text-blue-100 mt-2">View ticket trends and performance metrics</p>
          </div>
        </motion.div>
        
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-poppins">Analytics Dashboard</h1>
            <p className="text-blue-100 mt-2">View ticket trends and performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2.5 border-2 border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/20 backdrop-blur-sm text-white font-semibold"
            >
              <option value="7d" className="text-gray-900">Last 7 days</option>
              <option value="30d" className="text-gray-900">Last 30 days</option>
              <option value="90d" className="text-gray-900">Last 90 days</option>
              <option value="1y" className="text-gray-900">Last year</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg font-semibold"
            >
              <CalendarIcon className="h-5 w-5" />
              Export
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="relative bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="relative bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Avg Resolution Time</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.averageResolutionTime} days</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/30">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="relative bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Resolution Rate</p>
              <p className="text-2xl font-bold text-gray-900">78%</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05, y: -4 }}
          className="relative bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Active Staff</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl shadow-lg shadow-orange-500/30">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Category</h2>
          <div className="space-y-4">
            {Object.entries(analyticsData.ticketsByCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${categoryColors[category as keyof typeof categoryColors]}`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {category.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${categoryColors[category as keyof typeof categoryColors]}`}
                      style={{ width: `${(count / 136) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tickets by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Status</h2>
          <div className="space-y-4">
            {Object.entries(analyticsData.ticketsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${statusColors[status as keyof typeof statusColors]}`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`}
                      style={{ width: `${(count / 156) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Monthly Trends and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h2>
          <div className="space-y-3">
            {analyticsData.ticketsByMonth.map((item, index) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 w-12">{item.month}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${(item.count / 35) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/20"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h2>
          <div className="space-y-4">
            {analyticsData.topPerformers.map((performer, index) => (
              <div key={performer.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">#{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{performer.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(performer.resolvedCount / 24) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{performer.resolvedCount}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-800">High Resolution Rate</p>
            <p className="text-xs text-green-600 mt-1">78% of tickets resolved within SLA</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <ClockIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-800">Fast Response Time</p>
            <p className="text-xs text-blue-600 mt-1">Average 2.5 days to resolution</p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-yellow-800">Attention Needed</p>
            <p className="text-xs text-yellow-600 mt-1">23 pending tickets require assignment</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
