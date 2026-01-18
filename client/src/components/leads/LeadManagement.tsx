import { useState, useEffect } from 'react';
import {
  Lead,
  LEAD_STATUS_COLORS,
  LEAD_STATUS_LABELS,
  LEAD_SOURCE_LABELS,
  PRIORITY_COLORS,
  ConversionStats
} from '../../types/lead';
import QuoteGenerator from './QuoteGenerator';
import './LeadManagement.css';

export default function LeadManagement() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ConversionStats | null>(null);

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [statusFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all'
        ? 'http://localhost:3001/api/leads'
        : `http://localhost:3001/api/leads?status=${statusFilter}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setLeads(data.leads);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load leads');
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/leads/stats/conversion');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        fetchLeads();
        if (selectedLead?._id === leadId) {
          setSelectedLead(data.lead);
        }
      }
    } catch (err) {
      console.error('Error updating lead status:', err);
    }
  };

  const convertToBooking = async (leadId: string) => {
    if (!confirm('Convert this lead to a confirmed booking?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/leads/${leadId}/convert`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        alert('Lead converted to booking successfully!');
        fetchLeads();
        fetchStats();
        setSelectedLead(null);
      } else {
        alert(`Conversion failed: ${data.message}`);
      }
    } catch (err) {
      console.error('Error converting lead:', err);
      alert('Failed to convert lead');
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/leads/${leadId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        fetchLeads();
        fetchStats();
        setSelectedLead(null);
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) return <div className="loading">Loading leads...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="lead-management">
      {/* Header with Stats */}
      <div className="dashboard-header">
        <div>
          <h1>Lead Management</h1>
          {stats && (
            <div className="stats-summary">
              <span>{stats.totalLeads} Total Leads</span>
              <span className="separator">•</span>
              <span>{stats.convertedLeads} Converted ({stats.leadConversionRate.toFixed(1)}%)</span>
              <span className="separator">•</span>
              <span>฿{stats.totalEstimatedRevenue.toLocaleString()} Revenue</span>
            </div>
          )}
        </div>
        <button onClick={fetchLeads} className="refresh-button">
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="filters">
        <label>
          Status Filter:
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Leads ({leads.length})</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="quote-sent">Quote Sent</option>
            <option value="negotiating">Negotiating</option>
            <option value="accepted">Accepted</option>
            <option value="converted">Converted</option>
            <option value="declined">Declined</option>
            <option value="lost">Lost</option>
          </select>
        </label>

        {stats && (
          <div className="conversion-metrics">
            <div className="metric">
              <span className="metric-label">Quote → Booking:</span>
              <span className="metric-value">{stats.quoteToBookingRate.toFixed(1)}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Avg Quote Value:</span>
              <span className="metric-value">฿{stats.averageQuoteValue.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Leads List */}
        <div className="leads-list">
          {leads.length === 0 ? (
            <div className="no-leads">
              <p>No leads found with the current filter.</p>
            </div>
          ) : (
            leads.map((lead) => (
              <div
                key={lead._id}
                className={`lead-card ${selectedLead?._id === lead._id ? 'selected' : ''}`}
                onClick={() => setSelectedLead(lead)}
              >
                <div className="lead-header">
                  <h3>{lead.customerName}</h3>
                  <div className="badges">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: LEAD_STATUS_COLORS[lead.status] }}
                    >
                      {LEAD_STATUS_LABELS[lead.status]}
                    </span>
                    {lead.priority !== 'medium' && (
                      <span
                        className="priority-badge"
                        style={{ backgroundColor: PRIORITY_COLORS[lead.priority] }}
                      >
                        {lead.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="lead-info">
                  <p>📧 {lead.customerEmail}</p>
                  <p>📅 {formatDate(lead.preferredStartDate)} ({lead.duration} days)</p>
                  <p>👥 {lead.numberOfAdults} adult{lead.numberOfAdults > 1 ? 's' : ''}{lead.numberOfChildren > 0 ? `, ${lead.numberOfChildren} child(ren)` : ''}</p>
                  {lead.finalQuotedPrice > 0 && (
                    <p className="quote-price">💰 Quoted: ฿{lead.finalQuotedPrice.toLocaleString()}</p>
                  )}
                </div>

                <div className="created-at">
                  {LEAD_SOURCE_LABELS[lead.source]} • {formatDate(lead.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Lead Details */}
        {selectedLead && (
          <div className="lead-details">
            <div className="details-header">
              <h2>Lead Details</h2>
              <button onClick={() => setSelectedLead(null)} className="close-button">
                ✕
              </button>
            </div>

            <div className="details-content">
              {/* Contact Information */}
              <section>
                <h3>Contact Information</h3>
                <p><strong>Name:</strong> {selectedLead.customerName}</p>
                <p><strong>Email:</strong> <a href={`mailto:${selectedLead.customerEmail}`}>{selectedLead.customerEmail}</a></p>
                <p><strong>Phone:</strong> <a href={`tel:${selectedLead.customerPhone}`}>{selectedLead.customerPhone}</a></p>
                <p><strong>Source:</strong> {LEAD_SOURCE_LABELS[selectedLead.source]}</p>
                {selectedLead.referralSource && (
                  <p><strong>Referral:</strong> {selectedLead.referralSource}</p>
                )}
              </section>

              {/* Trip Details */}
              <section>
                <h3>Trip Details</h3>
                <p><strong>Dates:</strong> {formatDate(selectedLead.preferredStartDate)} - {formatDate(selectedLead.preferredEndDate)}</p>
                <p><strong>Duration:</strong> {selectedLead.duration} days</p>
                <p><strong>Travelers:</strong> {selectedLead.numberOfAdults} adult(s){selectedLead.numberOfChildren > 0 ? `, ${selectedLead.numberOfChildren} child(ren)` : ''}</p>
                <p><strong>Hotel Level:</strong> {selectedLead.hotelLevel}</p>
                {typeof selectedLead.tourPackageId === 'object' && selectedLead.tourPackageId && (
                  <p><strong>Package:</strong> {selectedLead.tourPackageId.name}</p>
                )}
              </section>

              {/* Special Requests */}
              {selectedLead.specialRequests && (
                <section>
                  <h3>Special Requests</h3>
                  <p>{selectedLead.specialRequests}</p>
                </section>
              )}

              {/* Quote Information */}
              {selectedLead.quoteGenerated && (
                <section>
                  <h3>Quote Information</h3>
                  <p><strong>Estimated Cost:</strong> ฿{selectedLead.estimatedCost.toLocaleString()}</p>
                  <p><strong>Quoted Price:</strong> ฿{selectedLead.finalQuotedPrice.toLocaleString()}</p>
                  {selectedLead.quoteValidUntil && (
                    <p><strong>Valid Until:</strong> {formatDate(selectedLead.quoteValidUntil)}</p>
                  )}
                  {selectedLead.quoteSentAt && (
                    <p><strong>Sent:</strong> {formatDate(selectedLead.quoteSentAt)}</p>
                  )}
                </section>
              )}

              {/* Quote Generator */}
              {!selectedLead.convertedToBooking && selectedLead.tourPackageId && (
                <section>
                  <h3>Quote Management</h3>
                  <QuoteGenerator
                    lead={selectedLead}
                    onQuoteGenerated={fetchLeads}
                  />
                </section>
              )}

              {/* Status Management */}
              <section>
                <h3>Status Management</h3>
                <select
                  value={selectedLead.status}
                  onChange={(e) => updateLeadStatus(selectedLead._id, e.target.value)}
                  className="status-select"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="quote-sent">Quote Sent</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="accepted">Accepted</option>
                  <option value="converted">Converted</option>
                  <option value="declined">Declined</option>
                  <option value="lost">Lost</option>
                </select>

                <div className="activity-info">
                  <p><strong>Contact Attempts:</strong> {selectedLead.contactAttempts}</p>
                  <p><strong>Emails Sent:</strong> {selectedLead.emailsSent}</p>
                  {selectedLead.lastContactedAt && (
                    <p><strong>Last Contacted:</strong> {formatDate(selectedLead.lastContactedAt)}</p>
                  )}
                </div>
              </section>

              {/* Conversion */}
              {selectedLead.status === 'accepted' && !selectedLead.convertedToBooking && (
                <section>
                  <h3>Convert to Booking</h3>
                  <p>This lead has accepted the quote and is ready to be converted to a confirmed booking.</p>
                  <button
                    onClick={() => convertToBooking(selectedLead._id)}
                    className="convert-button"
                  >
                    Convert to Booking
                  </button>
                </section>
              )}

              {selectedLead.convertedToBooking && (
                <section className="converted-section">
                  <h3>✓ Converted to Booking</h3>
                  <p><strong>Converted:</strong> {selectedLead.convertedAt && formatDate(selectedLead.convertedAt)}</p>
                  {typeof selectedLead.bookingId === 'string' && (
                    <p><strong>Booking ID:</strong> {selectedLead.bookingId}</p>
                  )}
                </section>
              )}

              {/* Actions */}
              <div className="details-actions">
                <button
                  onClick={() => deleteLead(selectedLead._id)}
                  className="delete-button"
                  disabled={selectedLead.convertedToBooking}
                >
                  {selectedLead.convertedToBooking ? 'Cannot Delete (Converted)' : 'Delete Lead'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
