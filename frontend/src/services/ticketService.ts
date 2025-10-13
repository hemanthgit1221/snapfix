import { apiClient, ApiResponse } from './api';
import { Ticket, CreateTicketRequest, TicketComment, DuplicateCheckResponse } from '../types';

export interface TicketFilters {
  status?: string;
  category?: string;
  priority?: string;
  assignedTo?: number;
  userId?: number;
  search?: string;
  page?: number;
  size?: number;
}

export interface TicketStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface AnalyticsData {
  ticketsByCategory: Record<string, number>;
  ticketsByStatus: Record<string, number>;
  ticketsByMonth: Array<{ month: string; count: number }>;
  averageResolutionTime: number;
  topPerformers: Array<{ name: string; resolvedCount: number }>;
}

export const ticketService = {
  // Get all tickets with optional filtering
  async getTickets(filters: TicketFilters = {}): Promise<ApiResponse<Ticket[]>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const endpoint = params.toString() ? `/tickets?${params.toString()}` : '/tickets';
    return apiClient.get<Ticket[]>(endpoint);
  },

  // Get tickets for a specific user
  async getTicketsByUser(userId: number): Promise<ApiResponse<Ticket[]>> {
    return apiClient.get<Ticket[]>(`/tickets/user/${userId}`);
  },

  // Get assigned tickets for staff
  async getAssignedTickets(staffId: number): Promise<ApiResponse<Ticket[]>> {
    return apiClient.get<Ticket[]>(`/tickets/assigned/${staffId}`);
  },

  // Get a specific ticket by ID
  async getTicketById(id: number): Promise<ApiResponse<Ticket>> {
    return apiClient.get<Ticket>(`/tickets/${id}`);
  },

  // Get a ticket by ticket ID (e.g., SF2024001)
  async getTicketByTicketId(ticketId: string): Promise<ApiResponse<Ticket>> {
    return apiClient.get<Ticket>(`/tickets/ticket/${ticketId}`);
  },

  // Check for duplicate tickets
  async checkDuplicates(ticketData: CreateTicketRequest): Promise<DuplicateCheckResponse> {
    const response = await apiClient.post<DuplicateCheckResponse>('/tickets/check-duplicate', ticketData);
    // The backend returns DuplicateCheckResponse directly, not wrapped in ApiResponse
    return response as any;
  },

  // Create a new ticket
  async createTicket(ticketData: CreateTicketRequest, forceCreate: boolean = false, parentTicketId?: string): Promise<ApiResponse<Ticket>> {
    const formData = new FormData();
    formData.append('roomNumber', ticketData.roomNumber);
    if (ticketData.floor) formData.append('floor', ticketData.floor);
    if (ticketData.building) formData.append('building', ticketData.building);
    formData.append('category', ticketData.category);
    formData.append('description', ticketData.description);
    if (ticketData.photo) formData.append('photo', ticketData.photo);
    formData.append('forceCreate', forceCreate.toString());
    if (parentTicketId) formData.append('parentTicketId', parentTicketId);

    return apiClient.post<Ticket>('/tickets', formData);
  },

  // Update ticket status
  async updateTicketStatus(id: number, status: string): Promise<ApiResponse<Ticket>> {
    return apiClient.put<Ticket>(`/tickets/${id}/status`, { status });
  },

  // Assign ticket to staff
  async assignTicket(id: number, staffId: number): Promise<ApiResponse<Ticket>> {
    return apiClient.put<Ticket>(`/tickets/${id}/assign`, { assignedTo: staffId });
  },

  // Add comment to ticket
  async addComment(ticketId: number, comment: string): Promise<ApiResponse<TicketComment>> {
    return apiClient.post<TicketComment>(`/tickets/${ticketId}/comments`, { comment });
  },

  // Get ticket comments
  async getTicketComments(ticketId: number): Promise<ApiResponse<TicketComment[]>> {
    return apiClient.get<TicketComment[]>(`/tickets/${ticketId}/comments`);
  },

  // Upload ticket photo
  async uploadTicketPhoto(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload<{ url: string }>('/tickets/upload', formData);
  },

  // Get ticket statistics
  async getTicketStats(): Promise<ApiResponse<TicketStats>> {
    return apiClient.get<TicketStats>('/tickets/stats');
  },

  // Get analytics data
  async getAnalytics(timeRange: string = '30d'): Promise<ApiResponse<AnalyticsData>> {
    return apiClient.get<AnalyticsData>(`/tickets/analytics?range=${timeRange}`);
  },

  // Delete a ticket (admin only)
  async deleteTicket(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/tickets/${id}`);
  },

  // Update ticket priority
  async updateTicketPriority(id: number, priority: string): Promise<ApiResponse<Ticket>> {
    return apiClient.put<Ticket>(`/tickets/${id}/priority`, { priority });
  },

  // Get tickets by category
  async getTicketsByCategory(category: string): Promise<ApiResponse<Ticket[]>> {
    return apiClient.get<Ticket[]>(`/tickets/category/${category}`);
  },

  // Get tickets by status
  async getTicketsByStatus(status: string): Promise<ApiResponse<Ticket[]>> {
    return apiClient.get<Ticket[]>(`/tickets/status/${status}`);
  },

  // Export tickets (admin only)
  async exportTickets(format: 'csv' | 'pdf' = 'csv'): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/tickets/export?format=${format}`, {
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

  // Get dashboard data for different user roles
  async getDashboardData(role: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/dashboard/${role}`);
  },

  // Search tickets
  async searchTickets(query: string): Promise<ApiResponse<Ticket[]>> {
    return apiClient.get<Ticket[]>(`/tickets/search?q=${encodeURIComponent(query)}`);
  },

  // Get ticket timeline/activity
  async getTicketTimeline(ticketId: number): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/tickets/${ticketId}/timeline`);
  },

  // Bulk update tickets (admin only)
  async bulkUpdateTickets(ticketIds: number[], updates: Partial<Ticket>): Promise<ApiResponse<void>> {
    return apiClient.put<void>('/tickets/bulk', { ticketIds, updates });
  },

  // Get unassigned tickets (admin/staff only)
  async getUnassignedTickets(): Promise<ApiResponse<Ticket[]>> {
    return apiClient.get<Ticket[]>('/tickets/unassigned');
  },

  // Get overdue tickets
  async getOverdueTickets(): Promise<ApiResponse<Ticket[]>> {
    return apiClient.get<Ticket[]>('/tickets/overdue');
  }
};
