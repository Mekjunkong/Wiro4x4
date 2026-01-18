export interface FinancialSummary {
  totalRevenue: number;
  totalCosts: number;
  totalCommissions: number;
  totalProfit: number;
  totalBookings: number;
  completedBookings: number;
  averageRevenue: number;
  averageProfit: number;
  profitMargin: number;
}

export interface MonthlyFinancialData {
  year: number;
  month: number;
  totalRevenue: number;
  totalCosts: number;
  totalCommissions: number;
  totalProfit: number;
  totalBookings: number;
  profitMargin: number;
  bookingsByStatus: {
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
  };
  costBreakdown: {
    guideFees: number;
    transport: number;
    accommodation: number;
    attractions: number;
    food: number;
    other: number;
  };
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  company?: string;
  totalBookings: number;
  totalRevenue: number;
  totalCosts: number;
  totalCommissions: number;
  totalProfit: number;
  averageProfit: number;
  profitMargin: number;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
