import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { LeadFormData, HOTEL_LEVELS, LEAD_SOURCES } from '../../types/lead';
import './InquiryForm.css';

interface TourPackageOption {
  _id: string;
  name: string;
  code: string;
  duration: number;
  basePricePerPerson: number;
}

export default function InquiryForm() {
  const [packages, setPackages] = useState<TourPackageOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<LeadFormData>({
    defaultValues: {
      numberOfAdults: 2,
      numberOfChildren: 0,
      hotelLevel: 'standard',
      source: 'web-form',
      interests: []
    }
  });

  const startDate = watch('preferredStartDate');
  const selectedPackageId = watch('tourPackageId');
  const selectedPackage = packages.find(p => p._id === selectedPackageId);

  // Fetch available tour packages
  useEffect(() => {
    fetch('http://localhost:3001/api/packages?status=active')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPackages(data.packages);
        }
      })
      .catch(err => console.error('Failed to load packages:', err));
  }, []);

  // Auto-calculate end date based on package duration
  useEffect(() => {
    if (startDate && selectedPackage) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + selectedPackage.duration);
      const endDateStr = end.toISOString().split('T')[0];

      // Update the form value
      const endDateInput = document.querySelector<HTMLInputElement>('input[name="preferredEndDate"]');
      if (endDateInput) {
        endDateInput.value = endDateStr;
      }
    }
  }, [startDate, selectedPackage]);

  const onSubmit = async (data: LeadFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        reset();
      } else {
        setError(result.message || 'Failed to submit inquiry');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Inquiry submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="inquiry-form-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Thank You for Your Inquiry!</h2>
          <p>We've received your request and will get back to you within 24 hours with a personalized quote.</p>
          <p>Please check your email for a confirmation message.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="btn-secondary"
          >
            Submit Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inquiry-form-container">
      <div className="inquiry-header">
        <h1>🚙 Plan Your 4x4 Adventure</h1>
        <p>Tell us about your dream tour and we'll create a personalized experience just for you!</p>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="inquiry-form">

        {/* Contact Information */}
        <section className="form-section">
          <h3>Your Contact Information</h3>

          <div className="form-group">
            <label htmlFor="customerName">Full Name *</label>
            <input
              id="customerName"
              type="text"
              {...register('customerName', { required: 'Name is required' })}
              placeholder="John Doe"
            />
            {errors.customerName && <span className="error">{errors.customerName.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customerEmail">Email Address *</label>
              <input
                id="customerEmail"
                type="email"
                {...register('customerEmail', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="john@example.com"
              />
              {errors.customerEmail && <span className="error">{errors.customerEmail.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="customerPhone">Phone Number *</label>
              <input
                id="customerPhone"
                type="tel"
                {...register('customerPhone', { required: 'Phone is required' })}
                placeholder="+66 12 345 6789"
              />
              {errors.customerPhone && <span className="error">{errors.customerPhone.message}</span>}
            </div>
          </div>
        </section>

        {/* Tour Package Selection */}
        <section className="form-section">
          <h3>Choose Your Adventure (Optional)</h3>

          <div className="form-group">
            <label htmlFor="tourPackageId">Select a Tour Package</label>
            <select id="tourPackageId" {...register('tourPackageId')}>
              <option value="">I'm flexible - help me choose</option>
              {packages.map(pkg => (
                <option key={pkg._id} value={pkg._id}>
                  {pkg.name} ({pkg.duration} days) - from ฿{pkg.basePricePerPerson.toLocaleString()}/person
                </option>
              ))}
            </select>
            {selectedPackage && (
              <small className="help-text">
                Duration: {selectedPackage.duration} days • Starting from ฿{selectedPackage.basePricePerPerson.toLocaleString()} per person
              </small>
            )}
          </div>
        </section>

        {/* Trip Details */}
        <section className="form-section">
          <h3>Trip Details</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preferredStartDate">Preferred Start Date *</label>
              <input
                id="preferredStartDate"
                type="date"
                {...register('preferredStartDate', { required: 'Start date is required' })}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.preferredStartDate && <span className="error">{errors.preferredStartDate.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="preferredEndDate">Preferred End Date *</label>
              <input
                id="preferredEndDate"
                type="date"
                {...register('preferredEndDate', { required: 'End date is required' })}
                min={startDate || new Date().toISOString().split('T')[0]}
              />
              {errors.preferredEndDate && <span className="error">{errors.preferredEndDate.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numberOfAdults">Number of Adults *</label>
              <input
                id="numberOfAdults"
                type="number"
                min="1"
                max="20"
                {...register('numberOfAdults', {
                  required: 'Number of adults is required',
                  min: { value: 1, message: 'At least 1 adult required' }
                })}
              />
              {errors.numberOfAdults && <span className="error">{errors.numberOfAdults.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="numberOfChildren">Number of Children</label>
              <input
                id="numberOfChildren"
                type="number"
                min="0"
                max="10"
                {...register('numberOfChildren')}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="hotelLevel">Accommodation Preference *</label>
            <select id="hotelLevel" {...register('hotelLevel', { required: true })}>
              {HOTEL_LEVELS.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Special Requests */}
        <section className="form-section">
          <h3>Tell Us More</h3>

          <div className="form-group">
            <label htmlFor="specialRequests">Special Requests or Questions</label>
            <textarea
              id="specialRequests"
              {...register('specialRequests')}
              rows={4}
              placeholder="Any dietary restrictions, mobility concerns, specific interests, or questions you'd like us to know about..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="referralSource">How did you hear about us?</label>
            <input
              id="referralSource"
              type="text"
              {...register('referralSource')}
              placeholder="Google, friend referral, social media, etc."
            />
          </div>
        </section>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Get Your Free Quote'}
          </button>
          <p className="privacy-note">
            By submitting this form, you agree to receive emails from Wiro 4x4 Tour. We respect your privacy and won't share your information with third parties.
          </p>
        </div>
      </form>
    </div>
  );
}
