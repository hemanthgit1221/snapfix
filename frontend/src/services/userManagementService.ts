import { apiClient, ApiResponse } from './api';

export interface UserStatus {
  isFlagged: boolean;
  isBlacklisted: boolean;
  flaggedAt?: string;
  blacklistedAt?: string;
}

export const userManagementService = {
  async flagUser(userId: number): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>(`/admin/users/${userId}/flag`);
  },

  async unflagUser(userId: number): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>(`/admin/users/${userId}/unflag`);
  },

  async blacklistUser(userId: number): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>(`/admin/users/${userId}/blacklist`);
  },

  async unblacklistUser(userId: number): Promise<ApiResponse<{ message: string }>> {
    return apiClient.put<{ message: string }>(`/admin/users/${userId}/unblacklist`);
  },

  async getUserStatus(userId: number): Promise<ApiResponse<UserStatus>> {
    return apiClient.get<UserStatus>(`/admin/users/${userId}/status`);
  }
};








