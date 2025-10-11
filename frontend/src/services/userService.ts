import { apiClient, ApiResponse } from './api';
import { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  role?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  // Authentication
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.data.token) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  },

  async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/register', credentials);
    
    if (response.data.token) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  },

  async logout(): Promise<ApiResponse<void>> {
    const response = await apiClient.post<void>('/auth/logout');
    apiClient.clearToken();
    return response;
  },

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ token: string }>('/auth/refresh', {
      refreshToken
    });

    if (response.data.token) {
      apiClient.setToken(response.data.token);
    }

    return response;
  },

  // User management
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/auth/me');
  },

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>('/users');
  },

  async getUserById(id: number): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`/users/${id}`);
  },

  async updateUser(id: number, userData: UserUpdateData): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/users/${id}`, userData);
  },

  async updateProfile(userData: UserUpdateData): Promise<ApiResponse<User>> {
    return apiClient.put<User>('/users/profile', userData);
  },

  async changePassword(passwordData: PasswordChangeData): Promise<ApiResponse<void>> {
    return apiClient.put<void>('/users/change-password', passwordData);
  },

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/users/${id}`);
  },

  // User roles and permissions
  async getUsersByRole(role: string): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>(`/users/role/${role}`);
  },

  async updateUserRole(id: number, role: string): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/users/${id}/role`, { role });
  },

  // User statistics
  async getUserStats(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/users/stats');
  },

  async getUserTicketStats(userId: number): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/users/${userId}/stats`);
  },

  // User search
  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
  },

  // User activation/deactivation
  async activateUser(id: number): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/users/${id}/activate`);
  },

  async deactivateUser(id: number): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`/users/${id}/deactivate`);
  },

  // Password reset
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/reset-password', { token, newPassword });
  },

  // Email verification
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/verify-email', { token });
  },

  async resendVerificationEmail(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/resend-verification', { email });
  },

  // Bulk operations (admin only)
  async bulkUpdateUsers(userIds: number[], updates: UserUpdateData): Promise<ApiResponse<void>> {
    return apiClient.put<void>('/users/bulk', { userIds, updates });
  },

  async bulkDeleteUsers(userIds: number[]): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('/users/bulk', { body: JSON.stringify({ userIds }) });
  },

  // Export users (admin only)
  async exportUsers(format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/users/export?format=${format}`, {
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

  // User preferences
  async getUserPreferences(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/users/preferences');
  },

  async updateUserPreferences(preferences: any): Promise<ApiResponse<any>> {
    return apiClient.put<any>('/users/preferences', preferences);
  }
};
