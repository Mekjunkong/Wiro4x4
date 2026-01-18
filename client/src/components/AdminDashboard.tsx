import { useState, useEffect } from 'react';
import { Booking } from '../types/tourBooking';
import AgentAssignment from './agents/AgentAssignment';
import CostTrackingForm from './financial/CostTrackingForm';
import './AdminDashboard.css';

interface RevenueCommissionFormProps {
  booking: Booking;
  onCalculate: (bookingId: string, estimatedRevenue: number, actualRevenue: number) => void;
}

function RevenueCommissionForm({ booking, onCalculate }: RevenueCommissionFormProps) {
  const [estimatedRevenue, setEstimatedRevenue] = useState(booking.estimatedRevenue || 0);
  const [actualRevenue, setActualRevenue] = useState(booking.actualRevenue || 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getAgentInfo = () => {
    if (typeof booking.agentId === 'object' && booking.agentId !== null) {
      return booking.agentId;
    }
    return null;
  };

  const agent = getAgentInfo();

  if (!agent) {
    return (
      <div className="no-agent-warning">
        Please assign an agent first to calculate commission
      </div>
    );
  }

  return (
    <div className="revenue-commission-form">
      <div className="form-row">
        <div className="form-field">
          <label>Estimated Revenue (THB)</label>
          <input
            type="number"
            value={estimatedRevenue}
            onChange={(e) => setEstimatedRevenue(Number(e.target.value))}
            min="0"
            step="100"
          />
        </div>
        <div className="form-field">
          <label>Actual Revenue (THB)</label>
          <input
            type="number"
            value={actualRevenue}
            onChange={(e) => setActualRevenue(Number(e.target.value))}
            min="0"
            step="100"
          />
          <small>For completed bookings</small>
        </div>
      </div>

      <div className="commission-info">
        <div className="info-row">
          <span>Agent Commission Rate:</span>
          <strong>{agent.commissionRate}%</strong>
        </div>
        {booking.agentCommission > 0 && (
          <div className="info-row commission-amount">
            <span>Current Commission:</span>
            <strong>{formatCurrency(booking.agentCommission)}</strong>
          </div>
        )}
      </div>

      <button
        onClick={() => onCalculate(booking._id, estimatedRevenue, actualRevenue)}
        className="calculate-button"
        disabled={estimatedRevenue === 0 && actualRevenue === 0}
      >
        Calculate Commission
      </button>
    </div>
  );
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/bookings');
      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh bookings
        fetchBookings();
        alert('Booking status updated successfully');
      } else {
        alert('Failed to update booking status');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error updating booking status');
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        fetchBookings();
        setSelectedBooking(null);
        alert('Booking deleted successfully');
      } else {
        alert('Failed to delete booking');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error deleting booking');
    }
  };

  const getFilteredBookings = (): Booking[] => {
    if (statusFilter === 'all') {
      return bookings;
    }
    return bookings.filter(booking => booking.status === statusFilter);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateCommission = async (bookingId: string, estimatedRevenue: number, actualRevenue: number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/bookings/${bookingId}/commission`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ estimatedRevenue, actualRevenue })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`Commission calculated: ${formatCurrency(data.commission)}`);
        fetchBookings();
      } else {
        alert(data.message || 'Failed to calculate commission');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error calculating commission');
    }
  };

  const getAgentInfo = (booking: Booking) => {
    if (typeof booking.agentId === 'object' && booking.agentId !== null) {
      return booking.agentId;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error">{error}</div>
        <button onClick={fetchBookings} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Wiro 4x4 Tour - Admin Dashboard</h1>
        <button onClick={fetchBookings} className="refresh-button">
          Refresh
        </button>
      </header>

      <div className="filters">
        <label>
          Filter by Status:
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <span className="booking-count">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </span>
      </div>

      <div className="dashboard-content">
        <div className="bookings-list">
          {filteredBookings.length === 0 ? (
            <div className="no-bookings">No bookings found</div>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className={`booking-card ${selectedBooking?._id === booking._id ? 'selected' : ''}`}
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="booking-header">
                  <h3>{booking.contactName}</h3>
                  <div className="badges">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(booking.status) }}
                    >
                      {booking.status}
                    </span>
                    {getAgentInfo(booking) && (
                      <span className="agent-badge">
                        👤 {getAgentInfo(booking)!.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="booking-info">
                  <p>📧 {booking.contactEmail}</p>
                  <p>📞 {booking.contactPhone}</p>
                  <p>👥 {booking.numberOfAdults} adults
                    {booking.numberOfChildren ? `, ${booking.numberOfChildren} children` : ''}
                  </p>
                  <p>📅 {formatDate(booking.pickupDate)} - {formatDate(booking.endDate)}</p>
                  <p className="created-at">Created: {formatDate(booking.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedBooking && (
          <div className="booking-details">
            <div className="details-header">
              <h2>Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="close-button"
              >
                ✕
              </button>
            </div>

            <div className="details-content">
              <section>
                <h3>Contact Information</h3>
                <p><strong>Name:</strong> {selectedBooking.contactName}</p>
                <p><strong>Email:</strong> {selectedBooking.contactEmail}</p>
                <p><strong>Phone:</strong> {selectedBooking.contactPhone}</p>
              </section>

              <section>
                <h3>Group</h3>
                <p><strong>Adults:</strong> {selectedBooking.numberOfAdults}</p>
                {selectedBooking.numberOfChildren && (
                  <p><strong>Children:</strong> {selectedBooking.numberOfChildren}</p>
                )}
              </section>

              <section>
                <h3>Dates</h3>
                <p><strong>Pickup:</strong> {formatDate(selectedBooking.pickupDate)}</p>
                <p><strong>End:</strong> {formatDate(selectedBooking.endDate)}</p>
              </section>

              <section>
                <h3>Services</h3>
                <p><strong>Hotels:</strong> {selectedBooking.includesHotels ? 'Yes' : 'No'}</p>
                <p><strong>Guide:</strong> {selectedBooking.includesGuide ? 'Yes' : 'No'}</p>
                <p><strong>4x4 Trip:</strong> {selectedBooking.includesTrip ? 'Yes' : 'No'}</p>
              </section>

              {selectedBooking.suggestedDestinations.length > 0 && (
                <section>
                  <h3>Destinations</h3>
                  <ul>
                    {selectedBooking.suggestedDestinations.map((dest, idx) => (
                      <li key={idx}>{dest}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <h3>Status</h3>
                <select
                  value={selectedBooking.status}
                  onChange={(e) => updateBookingStatus(selectedBooking._id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </section>

              <section>
                <h3>Agent Assignment</h3>
                <AgentAssignment
                  bookingId={selectedBooking._id}
                  currentAgentId={typeof selectedBooking.agentId === 'object' && selectedBooking.agentId !== null ? selectedBooking.agentId._id : (typeof selectedBooking.agentId === 'string' ? selectedBooking.agentId : undefined)}
                  currentAgentName={getAgentInfo(selectedBooking)?.name}
                  onAssigned={fetchBookings}
                />
              </section>

              <section>
                <h3>Revenue & Commission</h3>
                <RevenueCommissionForm
                  booking={selectedBooking}
                  onCalculate={calculateCommission}
                />
              </section>

              <section>
                <h3>Cost Tracking</h3>
                <CostTrackingForm
                  booking={selectedBooking}
                  onUpdate={fetchBookings}
                />
              </section>

              {selectedBooking.profit !== undefined && selectedBooking.actualRevenue > 0 && (
                <section>
                  <h3>Financial Summary</h3>
                  <div className="financial-summary-box">
                    <div className="summary-item">
                      <span>Total Revenue:</span>
                      <strong>{formatCurrency(selectedBooking.actualRevenue)}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Total Costs:</span>
                      <strong>{formatCurrency(selectedBooking.totalCosts || 0)}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Agent Commission:</span>
                      <strong>{formatCurrency(selectedBooking.agentCommission)}</strong>
                    </div>
                    <div className="summary-item profit-item">
                      <span>Net Profit:</span>
                      <strong className={selectedBooking.profit >= 0 ? 'profit-positive' : 'profit-negative'}>
                        {formatCurrency(selectedBooking.profit)}
                      </strong>
                    </div>
                    <div className="summary-item">
                      <span>Profit Margin:</span>
                      <strong>{selectedBooking.profitMargin.toFixed(1)}%</strong>
                    </div>
                  </div>
                </section>
              )}

              <div className="details-actions">
                <button
                  onClick={() => deleteBooking(selectedBooking._id)}
                  className="delete-button"
                >
                  Delete Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
