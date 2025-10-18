import { apiClient, ApiResponse } from './api';

export interface Reward {
  id: number;
  userId: number;
  points: number;
  description: string;
  ticketId?: string;
  status: 'PENDING' | 'REDEEMED' | 'EXPIRED';
  createdAt: string;
  redeemedAt?: string;
}

export interface Voucher {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  discount: string;
  validUntil: string;
  category: string;
  isActive: boolean;
  maxRedemptions?: number;
  currentRedemptions?: number;
}

export interface VoucherRedemption {
  id: number;
  voucherId: number;
  userId: number;
  pointsUsed: number;
  redeemedAt: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
  expiryDate: string;
  usedAt?: string;
  voucherCode: string;
  voucherName?: string;
  voucherDescription?: string;
  discount?: string;
}

export interface RewardStats {
  totalPoints: number;
  availablePoints: number;
  redeemedPoints: number;
  totalRewards: number;
  totalVouchers: number;
  ticketsResolved: number;
  vouchersRedeemed: number;
  nextMilestone: number;
  pointsToNextMilestone: number;
}

export const rewardService = {
  // Rewards
  async getUserRewards(userId?: number): Promise<ApiResponse<Reward[]>> {
    const endpoint = userId ? `/rewards/user/${userId}` : '/rewards/my';
    return apiClient.get<Reward[]>(endpoint);
  },

  async createReward(userId: number, points: number, description: string, ticketId?: string): Promise<ApiResponse<Reward>> {
    return apiClient.post<Reward>('/rewards', {
      userId,
      points,
      description,
      ticketId
    });
  },

  async updateRewardStatus(rewardId: number, status: string): Promise<ApiResponse<Reward>> {
    return apiClient.put<Reward>(`/rewards/${rewardId}/status`, { status });
  },

  async deleteReward(rewardId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/rewards/${rewardId}`);
  },

  // Vouchers
  async getAvailableVouchers(): Promise<ApiResponse<Voucher[]>> {
    return apiClient.get<Voucher[]>('/rewards/vouchers/available');
  },

  async getAllVouchers(): Promise<ApiResponse<Voucher[]>> {
    return apiClient.get<Voucher[]>('/rewards/vouchers');
  },

  async getVoucherById(id: number): Promise<ApiResponse<Voucher>> {
    return apiClient.get<Voucher>(`/rewards/vouchers/${id}`);
  },

  async createVoucher(voucherData: Omit<Voucher, 'id'>): Promise<ApiResponse<Voucher>> {
    return apiClient.post<Voucher>('/rewards/vouchers', voucherData);
  },

  async updateVoucher(id: number, voucherData: Partial<Voucher>): Promise<ApiResponse<Voucher>> {
    return apiClient.put<Voucher>(`/rewards/vouchers/${id}`, voucherData);
  },

  async deleteVoucher(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/rewards/vouchers/${id}`);
  },

  async activateVoucher(id: number): Promise<ApiResponse<Voucher>> {
    return apiClient.put<Voucher>(`/rewards/vouchers/${id}/activate`);
  },

  async deactivateVoucher(id: number): Promise<ApiResponse<Voucher>> {
    return apiClient.put<Voucher>(`/rewards/vouchers/${id}/deactivate`);
  },

  // Voucher Redemptions
  async redeemVoucher(voucherId: number): Promise<ApiResponse<VoucherRedemption>> {
    return apiClient.post<VoucherRedemption>(`/rewards/vouchers/redeem?voucherId=${voucherId}`);
  },

  async getUserVoucherRedemptions(userId?: number): Promise<ApiResponse<VoucherRedemption[]>> {
    const endpoint = userId ? `/rewards/vouchers/redemptions/user/${userId}` : '/rewards/vouchers/redemptions/my';
    return apiClient.get<VoucherRedemption[]>(endpoint);
  },

  async getRedeemedVouchers(): Promise<ApiResponse<VoucherRedemption[]>> {
    return apiClient.get<VoucherRedemption[]>('/rewards/vouchers/redemptions/my');
  },

  async useVoucherRedemption(redemptionId: number): Promise<ApiResponse<VoucherRedemption>> {
    return apiClient.put<VoucherRedemption>(`/rewards/vouchers/redemptions/${redemptionId}/use`);
  },

  async cancelVoucherRedemption(redemptionId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/rewards/vouchers/redemptions/${redemptionId}`);
  },

  // Statistics and Analytics
  async getRewardStats(userId?: number): Promise<ApiResponse<RewardStats>> {
    const endpoint = userId ? `/rewards/stats/user/${userId}` : '/rewards/stats/my';
    return apiClient.get<RewardStats>(endpoint);
  },

  async getRewardLeaderboard(limit: number = 10): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/rewards/leaderboard?limit=${limit}`);
  },

  async getMyAchievements(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/rewards/achievements/my');
  },

  async getUserAchievements(userId: number): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/rewards/achievements/user/${userId}`);
  },

  async getVoucherUsageStats(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/vouchers/usage-stats');
  },

  async getMonthlyRewardStats(months: number = 12): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/rewards/monthly-stats?months=${months}`);
  },

  // Bulk operations (admin only)
  async bulkCreateRewards(rewards: Array<{ userId: number; points: number; description: string; ticketId?: string }>): Promise<ApiResponse<Reward[]>> {
    return apiClient.post<Reward[]>('/rewards/bulk', { rewards });
  },

  async bulkUpdateRewards(rewardIds: number[], updates: Partial<Reward>): Promise<ApiResponse<void>> {
    return apiClient.put<void>('/rewards/bulk', { rewardIds, updates });
  },

  async bulkDeleteRewards(rewardIds: number[]): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/rewards/bulk-delete', { rewardIds });
  },

  // Export data
  async exportRewards(format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/rewards/export?format=${format}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiClient['token']}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },

  async exportVouchers(format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/vouchers/export?format=${format}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiClient['token']}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },

  // Notification settings
  async getRewardNotifications(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/rewards/notifications');
  },

  async updateRewardNotifications(settings: any): Promise<ApiResponse<any>> {
    return apiClient.put<any>('/rewards/notifications', settings);
  },

  // Points management
  async adjustUserPoints(userId: number, points: number, reason: string): Promise<ApiResponse<Reward>> {
    return apiClient.post<Reward>('/rewards/adjust', { userId, points, reason });
  },

  async getUserPointsHistory(userId: number, limit: number = 50): Promise<ApiResponse<Reward[]>> {
    return apiClient.get<Reward[]>(`/rewards/history/${userId}?limit=${limit}`);
  },

  // Milestone rewards
  async getMilestoneRewards(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/rewards/milestones');
  },

  async checkMilestoneAchievements(userId: number): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/rewards/milestones/check/${userId}`);
  }
};
