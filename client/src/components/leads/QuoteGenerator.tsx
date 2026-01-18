import { useState } from 'react';
import { Lead, Quote } from '../../types/lead';
import './QuoteGenerator.css';

interface QuoteGeneratorProps {
  lead: Lead;
  onQuoteGenerated: () => void;
}

export default function QuoteGenerator({ lead, onQuoteGenerated }: QuoteGeneratorProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuote = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/leads/${lead._id}/generate-quote`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        setQuote(data.quote);
        onQuoteGenerated();
      } else {
        setError(data.message || 'Failed to generate quote');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Quote generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendQuote = async () => {
    if (!quote) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/leads/${lead._id}/send-quote`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        alert('Quote sent successfully to ' + lead.customerEmail);
        onQuoteGenerated();
        setQuote(null);
      } else {
        setError(data.message || 'Failed to send quote');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Quote sending error:', err);
    } finally {
      setSending(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `฿${amount.toLocaleString()}`;
  };

  const getSeasonLabel = (season: string) => {
    const labels: Record<string, string> = {
      peak: 'Peak Season (Nov-Feb)',
      shoulder: 'Shoulder Season (Mar-May, Sep-Oct)',
      low: 'Low Season (Jun-Aug)'
    };
    return labels[season] || season;
  };

  // Show existing quote if already generated
  if (lead.quoteGenerated && !quote) {
    return (
      <div className="quote-generator">
        <div className="quote-status">
          <p className="quote-generated-label">✓ Quote Generated</p>
          <p><strong>Quoted Price:</strong> {formatCurrency(lead.finalQuotedPrice)}</p>
          {lead.quoteSentAt && (
            <p className="quote-sent">Email sent on {new Date(lead.quoteSentAt).toLocaleDateString()}</p>
          )}
          {!lead.quoteSentAt && (
            <button
              onClick={sendQuote}
              disabled={sending}
              className="btn-send"
            >
              {sending ? 'Sending...' : 'Send Quote Email'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="quote-generator">
      {error && (
        <div className="error-message">{error}</div>
      )}

      {!quote ? (
        <button
          onClick={generateQuote}
          disabled={loading}
          className="btn-generate"
        >
          {loading ? 'Generating Quote...' : '📊 Generate Quote'}
        </button>
      ) : (
        <div className="quote-display">
          <div className="quote-header">
            <h4>📋 Quote Generated</h4>
            <span className="season-badge">{getSeasonLabel(quote.season)}</span>
          </div>

          <div className="quote-summary">
            <div className="quote-row">
              <span>Duration:</span>
              <strong>{quote.duration} days</strong>
            </div>
            <div className="quote-row">
              <span>Travelers:</span>
              <strong>{quote.numberOfAdults} adult(s){quote.numberOfChildren > 0 ? `, ${quote.numberOfChildren} child(ren)` : ''}</strong>
            </div>
            <div className="quote-row">
              <span>Hotel Level:</span>
              <strong>{quote.hotelLevel}</strong>
            </div>
          </div>

          <div className="cost-breakdown">
            <h5>Cost Breakdown:</h5>
            <div className="cost-item">
              <span>Accommodation</span>
              <span>{formatCurrency(quote.costs.accommodation)}</span>
            </div>
            <div className="cost-item">
              <span>Meals & Dining</span>
              <span>{formatCurrency(quote.costs.meals)}</span>
            </div>
            <div className="cost-item">
              <span>Professional Guide</span>
              <span>{formatCurrency(quote.costs.guide)}</span>
            </div>
            <div className="cost-item">
              <span>4x4 Transport</span>
              <span>{formatCurrency(quote.costs.transport)}</span>
            </div>
            <div className="cost-item">
              <span>Attractions & Activities</span>
              <span>{formatCurrency(quote.costs.attractions)}</span>
            </div>
            <div className="cost-item total-cost">
              <span>Total Costs</span>
              <span>{formatCurrency(quote.costs.total)}</span>
            </div>
          </div>

          <div className="quote-pricing">
            <div className="price-row">
              <span className="price-label">Quoted Price:</span>
              <span className="price-value">{formatCurrency(quote.quotedPrice)}</span>
            </div>
            <div className="profit-row">
              <span>Estimated Profit:</span>
              <span className={quote.estimatedProfit >= 0 ? 'profit-positive' : 'profit-negative'}>
                {formatCurrency(quote.estimatedProfit)}
              </span>
            </div>
            <div className="validity">
              Valid until: {new Date(quote.validUntil).toLocaleDateString()}
            </div>
          </div>

          <button
            onClick={sendQuote}
            disabled={sending}
            className="btn-send-quote"
          >
            {sending ? 'Sending Email...' : '✉️ Send Quote to Customer'}
          </button>
        </div>
      )}
    </div>
  );
}
