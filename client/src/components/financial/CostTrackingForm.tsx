import { useState } from 'react';
import { Booking, BookingCosts } from '../../types/tourBooking';
import './CostTrackingForm.css';

interface CostTrackingFormProps {
  booking: Booking;
  onUpdate: () => void;
}

export default function CostTrackingForm({ booking, onUpdate }: CostTrackingFormProps) {
  const [costs, setCosts] = useState<BookingCosts>(booking.costs || {
    guideFee: 0,
    transportCost: 0,
    accommodationCost: 0,
    attractionsCost: 0,
    foodCost: 0,
    otherCosts: 0
  });
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotal = () => {
    return (
      costs.guideFee +
      costs.transportCost +
      costs.accommodationCost +
      costs.attractionsCost +
      costs.foodCost +
      costs.otherCosts
    );
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/bookings/${booking._id}/costs`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ costs })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Costs updated successfully!');
        onUpdate();
      } else {
        alert(data.message || 'Failed to update costs');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating costs');
    } finally {
      setLoading(false);
    }
  };

  const totalCosts = calculateTotal();

  return (
    <div className="cost-tracking-form">
      <div className="cost-grid">
        <div className="cost-field">
          <label>Guide Fee (THB)</label>
          <input
            type="number"
            value={costs.guideFee}
            onChange={(e) => setCosts({ ...costs, guideFee: Number(e.target.value) })}
            min="0"
            step="100"
            disabled={loading}
          />
        </div>

        <div className="cost-field">
          <label>Transport (THB)</label>
          <input
            type="number"
            value={costs.transportCost}
            onChange={(e) => setCosts({ ...costs, transportCost: Number(e.target.value) })}
            min="0"
            step="100"
            disabled={loading}
          />
        </div>

        <div className="cost-field">
          <label>Accommodation (THB)</label>
          <input
            type="number"
            value={costs.accommodationCost}
            onChange={(e) => setCosts({ ...costs, accommodationCost: Number(e.target.value) })}
            min="0"
            step="100"
            disabled={loading}
          />
        </div>

        <div className="cost-field">
          <label>Attractions (THB)</label>
          <input
            type="number"
            value={costs.attractionsCost}
            onChange={(e) => setCosts({ ...costs, attractionsCost: Number(e.target.value) })}
            min="0"
            step="100"
            disabled={loading}
          />
        </div>

        <div className="cost-field">
          <label>Food (THB)</label>
          <input
            type="number"
            value={costs.foodCost}
            onChange={(e) => setCosts({ ...costs, foodCost: Number(e.target.value) })}
            min="0"
            step="100"
            disabled={loading}
          />
        </div>

        <div className="cost-field">
          <label>Other Costs (THB)</label>
          <input
            type="number"
            value={costs.otherCosts}
            onChange={(e) => setCosts({ ...costs, otherCosts: Number(e.target.value) })}
            min="0"
            step="100"
            disabled={loading}
          />
        </div>
      </div>

      <div className="cost-summary">
        <div className="summary-row">
          <span>Total Costs:</span>
          <strong>{formatCurrency(totalCosts)}</strong>
        </div>
        {booking.actualRevenue > 0 && (
          <>
            <div className="summary-row">
              <span>Revenue:</span>
              <strong>{formatCurrency(booking.actualRevenue)}</strong>
            </div>
            <div className="summary-row">
              <span>Commission:</span>
              <strong>{formatCurrency(booking.agentCommission)}</strong>
            </div>
            <div className="summary-row profit-row">
              <span>Estimated Profit:</span>
              <strong className={booking.actualRevenue - totalCosts - booking.agentCommission >= 0 ? 'positive' : 'negative'}>
                {formatCurrency(booking.actualRevenue - totalCosts - booking.agentCommission)}
              </strong>
            </div>
            <div className="summary-row">
              <span>Profit Margin:</span>
              <strong>
                {booking.actualRevenue > 0
                  ? ((booking.actualRevenue - totalCosts - booking.agentCommission) / booking.actualRevenue * 100).toFixed(1)
                  : 0}%
              </strong>
            </div>
          </>
        )}
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading}
        className="update-costs-button"
      >
        {loading ? 'Updating...' : 'Update Costs'}
      </button>
    </div>
  );
}
