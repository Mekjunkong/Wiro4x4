export type AgentStatus = 'active' | 'inactive' | 'suspended';

export interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: AgentStatus;
  commissionRate: number;
  totalBookings: number;
  totalRevenue: number;
  totalCommission: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  commissionRate: number;
  notes?: string;
}

export interface AgentStats {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  inProgressBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalCommission: number;
  averageBookingValue: number;
  conversionRate: number;
}

// Status colors for UI
export const AGENT_STATUS_COLORS: Record<AgentStatus, string> = {
  active: '#27ae60',
  inactive: '#95a5a6',
  suspended: '#e74c3c'
};

// Status labels for UI
export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended'
};
