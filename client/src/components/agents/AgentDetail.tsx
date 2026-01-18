import { useState, useEffect } from 'react';
import { Agent, AgentStats, AGENT_STATUS_COLORS, AGENT_STATUS_LABELS } from '../../types/agent';
import { Booking } from '../../types/tourBooking';
import './AgentDetail.css';

interface AgentDetailProps {
  agent: Agent;
  onEdit: () => void;
  onStatusChange: (agentId: string, newStatus: 'active' | 'inactive' | 'suspended') => void;
  onRefresh: () => void;
}

export default function AgentDetail({ agent, onEdit, onStatusChange, onRefresh }: AgentDetailProps) {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchBookings();
  }, [agent._id]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch(`http://localhost:3001/api/agents/${agent._id}/stats`);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching agent stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await fetch(`http://localhost:3001/api/agents/${agent._id}/bookings?limit=10`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching agent bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: '#f39c12',
      confirmed: '#3498db',
      'in-progress': '#9b59b6',
      completed: '#27ae60',
      cancelled: '#e74c3c'
    };
    return colors[status as keyof typeof colors] || '#95a5a6';
  };

  return (
    <div className="agent-detail">
      {/* Agent Header */}
      <div className="agent-detail-header">
        <div className="agent-info">
          <h2>{agent.name}</h2>
          <div className="agent-meta">
            <span
              className="status-badge"
              style={{ backgroundColor: AGENT_STATUS_COLORS[agent.status] }}
            >
              {AGENT_STATUS_LABELS[agent.status]}
            </span>
            {agent.company && <span className="company">{agent.company}</span>}
          </div>
        </div>
        <div className="agent-actions">
          <button onClick={onEdit} className="btn-edit">
            Edit Agent
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="agent-section">
        <h3>Contact Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Email:</label>
            <span>{agent.email}</span>
          </div>
          <div className="info-item">
            <label>Phone:</label>
            <span>{agent.phone}</span>
          </div>
          <div className="info-item">
            <label>Commission Rate:</label>
            <span>{agent.commissionRate}%</span>
          </div>
          <div className="info-item">
            <label>Joined:</label>
            <span>{formatDate(agent.createdAt)}</span>
          </div>
        </div>
        {agent.notes && (
          <div className="notes">
            <label>Notes:</label>
            <p>{agent.notes}</p>
          </div>
        )}
      </div>

      {/* Status Management */}
      <div className="agent-section">
        <h3>Status Management</h3>
        <div className="status-controls">
          <button
            onClick={() => onStatusChange(agent._id, 'active')}
            className={`status-btn ${agent.status === 'active' ? 'active' : ''}`}
            disabled={agent.status === 'active'}
          >
            Set Active
          </button>
          <button
            onClick={() => onStatusChange(agent._id, 'inactive')}
            className={`status-btn ${agent.status === 'inactive' ? 'active' : ''}`}
            disabled={agent.status === 'inactive'}
          >
            Set Inactive
          </button>
          <button
            onClick={() => onStatusChange(agent._id, 'suspended')}
            className={`status-btn ${agent.status === 'suspended' ? 'active' : ''}`}
            disabled={agent.status === 'suspended'}
          >
            Suspend
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="agent-section">
        <h3>Performance Metrics</h3>
        {loadingStats ? (
          <div className="loading">Loading statistics...</div>
        ) : stats ? (
          <>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-value">{stats.totalBookings}</div>
                <div className="metric-label">Total Bookings</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{formatCurrency(stats.totalRevenue)}</div>
                <div className="metric-label">Total Revenue</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{formatCurrency(stats.totalCommission)}</div>
                <div className="metric-label">Total Commission</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{formatCurrency(stats.averageBookingValue)}</div>
                <div className="metric-label">Avg Booking Value</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{stats.conversionRate.toFixed(1)}%</div>
                <div className="metric-label">Conversion Rate</div>
              </div>
            </div>

            <div className="booking-breakdown">
              <h4>Booking Status Breakdown</h4>
              <div className="breakdown-grid">
                <div className="breakdown-item">
                  <span className="breakdown-label">Completed:</span>
                  <span className="breakdown-value">{stats.completedBookings}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">In Progress:</span>
                  <span className="breakdown-value">{stats.inProgressBookings}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Confirmed:</span>
                  <span className="breakdown-value">{stats.confirmedBookings}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Pending:</span>
                  <span className="breakdown-value">{stats.pendingBookings}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Cancelled:</span>
                  <span className="breakdown-value">{stats.cancelledBookings}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="error">Failed to load statistics</div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="agent-section">
        <h3>Recent Bookings (Last 10)</h3>
        {loadingBookings ? (
          <div className="loading">Loading bookings...</div>
        ) : bookings.length > 0 ? (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-item">
                <div className="booking-info">
                  <div className="booking-name">{booking.contactName}</div>
                  <div className="booking-dates">
                    {formatDate(booking.pickupDate)} - {formatDate(booking.endDate)}
                  </div>
                  <div className="booking-details">
                    {booking.numberOfAdults} adult{booking.numberOfAdults !== 1 ? 's' : ''}
                    {booking.numberOfChildren ? ` + ${booking.numberOfChildren} child${booking.numberOfChildren !== 1 ? 'ren' : ''}` : ''}
                  </div>
                </div>
                <div className="booking-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(booking.status) }}
                  >
                    {booking.status}
                  </span>
                  {booking.agentCommission > 0 && (
                    <div className="commission">
                      Commission: {formatCurrency(booking.agentCommission)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No bookings assigned yet</div>
        )}
      </div>
    </div>
  );
}
