import { TicketComment } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}


class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
    console.log('ApiClient: Initialized with token:', this.token ? 'YES' : 'NO');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
    console.log('ApiClient: Token set to:', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        ...options.headers,
      },
      ...options,
    };

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      config.headers = {
        'Content-Type': 'application/json',
        ...config.headers,
      };
    }

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
      console.log('🔑 Request - Authorization header set:', `Bearer ${this.token.substring(0, 20)}...`);
    } else {
      console.log('❌ Request - No token available!');
    }

    try {
      console.log('🌐 Making request to:', url);
      console.log('🌐 Request headers:', config.headers);
      const response = await fetch(url, config);
      const data = await response.json();
      
      console.log('🌐 Response status:', response.status);
      console.log('🌐 Response data:', data);
      console.log('🌐 Response data type:', typeof data);

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(error.message, 500);
      }
      throw new ApiError('An unexpected error occurred', 500);
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    console.log('🔑 PUT Request - Token available:', !!this.token);
    console.log('🔑 PUT Request - Endpoint:', endpoint);
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      method: 'POST',
      body: formData,
      headers: {},
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
      console.log('API Upload: Token found, adding Authorization header');
    } else {
      console.log('API Upload: No token found!');
    }

    try {
      console.log('API Upload: Making request to:', url);
      console.log('API Upload: Headers:', config.headers);
      console.log('API Upload: Token from localStorage:', localStorage.getItem('token'));
      const response = await fetch(url, config);
      console.log('API Upload: Response status:', response.status);
      console.log('API Upload: Response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(error.message, 500);
      }
      throw new ApiError('Upload failed', 500);
    }
  }
}

class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { ApiError };

// Function to update the API client token
export const updateApiClientToken = (token: string | null) => {
  console.log('updateApiClientToken called with:', token ? 'TOKEN' : 'NULL');
  if (token) {
    apiClient.setToken(token);
  } else {
    apiClient.clearToken();
  }
};

// Dashboard API types
export interface StudentStats {
  totalTickets: number;
  pendingTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  rewardPoints: number;
}

export interface AdminStats {
  totalTickets: number;
  pendingTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  totalUsers: number;
  activeStaff: number;
}

export interface Ticket {
  id: number;
  ticketId: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    points: number;
  };
  photoUrl: string;
  roomNumber: string;
  floor: string;
  building: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  assignedTo?: {
    id: number;
    name: string;
    email: string;
    role: string;
    points: number;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// Dashboard API functions
export const dashboardApi = {
  // Student Dashboard APIs
  async getStudentStats(): Promise<ApiResponse<StudentStats>> {
    return apiClient.get<StudentStats>('/tickets/stats');
  },

  async getStudentTickets(): Promise<ApiResponse<Ticket[]>> {
    return apiClient.get<Ticket[]>('/tickets');
  },

  // Admin Dashboard APIs
  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    return apiClient.get<AdminStats>('/tickets/admin/stats');
  },

  async getAllTickets(): Promise<ApiResponse<Ticket[]>> {
    return apiClient.get<Ticket[]>('/tickets/active');
  },

  async getUnassignedTickets(): Promise<ApiResponse<Ticket[]>> {
    return apiClient.get<Ticket[]>('/tickets/unassigned');
  },

  async assignTicket(ticketId: number, assignedToId: number): Promise<ApiResponse<Ticket>> {
    return apiClient.put<Ticket>(`/tickets/${ticketId}/assign?assignedToId=${assignedToId}`);
  },

  // Staff Dashboard APIs
  async getStaffStats(): Promise<ApiResponse<Ticket[]>> {
    return apiClient.get<Ticket[]>('/tickets/assigned');
  },

  async getAssignedTickets(): Promise<ApiResponse<Ticket[]>> {
    return apiClient.get<Ticket[]>('/tickets/assigned');
  },

  async updateTicketStatus(ticketId: number, status: string): Promise<ApiResponse<Ticket>> {
    return apiClient.put<Ticket>(`/tickets/${ticketId}/status?status=${status}`);
  },

  // Common APIs
  async getTicketDetails(ticketId: string): Promise<ApiResponse<Ticket>> {
    const response = await apiClient.get<Ticket>(`/tickets/ticket/${ticketId}`);
    // Backend returns TicketResponse directly, not wrapped
    return response as any;
  },

  async addComment(ticketId: string, comment: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/tickets/comments/${ticketId}?comment=${comment}`);
  },

  async getTicketComments(ticketId: string): Promise<ApiResponse<TicketComment[]>> {
    return apiClient.get<TicketComment[]>(`/tickets/comments/${ticketId}`);
  },

  // Get staff members for assignment
  async getStaffMembers(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/users/staff');
  },

  // Create new staff member
  async createStaffMember(staffData: { name: string; email: string; password: string; role: string }): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/users', staffData);
  },

  // Update staff member
  async updateStaffMember(id: number, staffData: { name: string; email: string; password?: string; role: string }): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/users/${id}`, staffData);
  },

  // Delete staff member
  async deleteStaffMember(id: number): Promise<ApiResponse<any>> {
    return apiClient.delete<any>(`/users/${id}`);
  },

  // Change password
  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse<string>> {
    return apiClient.post<string>('/auth/change-password', passwordData);
  },

  // Student Management APIs
  async getStudents(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/users');
  },

  async createStudent(studentData: { name: string; email: string; password: string; role: string; points: number }): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/users', studentData);
  },

  async updateStudent(id: number, studentData: { name: string; email: string; password?: string; role: string; points: number }): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/users/${id}`, studentData);
  },

  async deleteStudent(id: number): Promise<ApiResponse<any>> {
    return apiClient.delete<any>(`/users/${id}`);
  }
};