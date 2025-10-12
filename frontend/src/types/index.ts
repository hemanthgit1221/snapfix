export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  points: number;
  supabaseUserId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum UserRole {
  STUDENT = 'STUDENT',
  FACULTY = 'FACULTY',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD'
}

export interface Ticket {
  id: number;
  ticketId: string;
  user: User;
  photoUrl: string;
  roomNumber: string;
  floor?: string;
  building?: string;
  category: TicketCategory;
  description: string;
  status: TicketStatus;
  assignedTo?: User;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  comments?: TicketComment[];
}

export enum TicketCategory {
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  HOUSEKEEPING = 'HOUSEKEEPING',
  AC_WATER = 'AC_WATER',
  OTHERS = 'OTHERS'
}

export enum TicketStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  AT_SITE = 'AT_SITE',
  WAITING_FOR_MATERIAL = 'WAITING_FOR_MATERIAL',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface TicketComment {
  id: number;
  ticket: Ticket;
  user: User;
  comment: string;
  createdAt: string;
}

export interface Reward {
  id: number;
  user: User;
  ticket: Ticket;
  points: number;
  voucherStatus: VoucherStatus;
  voucherCode?: string;
  redeemedAt?: string;
  createdAt: string;
}

export enum VoucherStatus {
  PENDING = 'PENDING',
  REDEEMED = 'REDEEMED',
  EXPIRED = 'EXPIRED'
}

export interface CreateTicketRequest {
  photo: File;
  roomNumber: string;
  floor?: string;
  building?: string;
  category: TicketCategory;
  description: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface DashboardStats {
  totalTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  totalPoints: number;
  recentTickets: Ticket[];
}

export interface AnalyticsData {
  ticketsByCategory: { [key in TicketCategory]: number };
  ticketsByStatus: { [key in TicketStatus]: number };
  ticketsByMonth: { month: string; count: number }[];
  averageResolutionTime: number;
  topPerformers: { user: User; resolvedCount: number }[];
}
