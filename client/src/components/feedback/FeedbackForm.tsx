import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  FeedbackFormData,
  FEEDBACK_RATING_CATEGORIES,
  RATING_CATEGORY_LABELS
} from '../../types/feedback';
import './FeedbackForm.css';

interface FeedbackFormProps {
  bookingId?: string; // Optional - can be passed from URL param
}

export default function FeedbackForm({ bookingId: initialBookingId }: FeedbackFormProps) {
  const [bookingId, setBookingId] = useState(initialBookingId || '');
  const [bookingValid, setBookingValid] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FeedbackFormData>({
    defaultValues: {
      overallRating: 5,
      wouldRecommend: true,
      willingToProvideTestimonial: false,
      allowPublicDisplay: true,
      ratings: {}
    }
  });

  const overallRating = watch('overallRating');
  const wouldRecommend = watch('wouldRecommend');

  // Check if booking exists and hasn't submitted feedback yet
  useEffect(() => {
    if (bookingId) {
      checkBooking();
    }
  }, [bookingId]);

  const checkBooking = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/feedback/booking/${bookingId}`);
      const data = await response.json();

      if (data.success) {
        if (data.exists) {
          setAlreadySubmitted(true);
        } else {
          setBookingValid(true);
        }
      }
    } catch (err) {
      console.error('Error checking booking:', err);
    }
  };

  const onSubmit = async (data: FeedbackFormData) => {
    setLoading(true);
    setError(null);

    try {
      const feedbackData = {
        ...data,
        bookingId
      };

      const response = await fetch('http://localhost:3001/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.message || 'Failed to submit feedback');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Feedback submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, onSelect?: (rating: number) => void) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${onSelect ? 'clickable' : ''}`}
            onClick={() => onSelect && onSelect(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Already submitted screen
  if (alreadySubmitted) {
    return (
      <div className="feedback-form-container">
        <div className="info-message">
          <h2>Feedback Already Submitted</h2>
          <p>Thank you! You've already submitted feedback for this booking.</p>
          <p>We appreciate you taking the time to share your experience with us.</p>
        </div>
      </div>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <div className="feedback-form-container">
        <div className="success-message">
          <div className="success-icon">⭐</div>
          <h2>Thank You for Your Feedback!</h2>
          <p>Your review has been submitted successfully.</p>
          <p>We truly appreciate you taking the time to share your experience with us.</p>
          {overallRating >= 4 && (
            <div className="testimonial-note">
              <p>✨ Your positive review may be featured on our website to help inspire future adventurers!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Booking ID input screen
  if (!bookingValid) {
    return (
      <div className="feedback-form-container">
        <div className="booking-id-prompt">
          <h1>📝 Share Your Experience</h1>
          <p>Please enter your booking ID to get started</p>
          <div className="booking-input-group">
            <input
              type="text"
              placeholder="Enter Booking ID"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="booking-id-input"
            />
            <button
              onClick={checkBooking}
              disabled={!bookingId}
              className="btn-continue"
            >
              Continue
            </button>
          </div>
          <small>You can find your booking ID in the confirmation email we sent you.</small>
        </div>
      </div>
    );
  }

  // Main feedback form
  return (
    <div className="feedback-form-container">
      <div className="feedback-header">
        <h1>⭐ How Was Your Adventure?</h1>
        <p>We'd love to hear about your experience with Wiro 4x4 Tour!</p>
      </div>

      {error && (
        <div className="error-banner">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="feedback-form">

        {/* Overall Rating */}
        <section className="form-section">
          <h3>Overall Experience</h3>

          <div className="form-group">
            <label>Overall Rating *</label>
            <div className="overall-rating">
              {renderStars(overallRating, (rating) => setValue('overallRating', rating))}
              <span className="rating-text">
                {overallRating === 5 && '⭐ Excellent!'}
                {overallRating === 4 && '😊 Great!'}
                {overallRating === 3 && '👍 Good'}
                {overallRating === 2 && '😐 Fair'}
                {overallRating === 1 && '👎 Poor'}
              </span>
            </div>
            <input
              type="hidden"
              {...register('overallRating', { required: true, min: 1, max: 5 })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="comments">Tell us about your experience *</label>
            <textarea
              id="comments"
              {...register('comments', {
                required: 'Please share your experience',
                minLength: { value: 10, message: 'Please write at least 10 characters' }
              })}
              rows={5}
              placeholder="What did you love about the tour? What could be improved?"
            />
            {errors.comments && <span className="error">{errors.comments.message}</span>}
          </div>
        </section>

        {/* Detailed Ratings */}
        <section className="form-section">
          <h3>Rate Specific Aspects</h3>

          {FEEDBACK_RATING_CATEGORIES.map((category) => (
            <div key={category} className="form-group">
              <label>{RATING_CATEGORY_LABELS[category]}</label>
              {renderStars(
                watch(`ratings.${category}`) || 0,
                (rating) => setValue(`ratings.${category}`, rating)
              )}
              <input
                type="hidden"
                {...register(`ratings.${category}` as any, { min: 0, max: 5 })}
              />
            </div>
          ))}
        </section>

        {/* Additional Feedback */}
        <section className="form-section">
          <h3>Additional Feedback</h3>

          <div className="form-group">
            <label htmlFor="highlights">What were the highlights of your tour?</label>
            <textarea
              id="highlights"
              {...register('highlights')}
              rows={3}
              placeholder="Favorite moments, places, or experiences..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="suggestions">Any suggestions for improvement?</label>
            <textarea
              id="suggestions"
              {...register('suggestions')}
              rows={3}
              placeholder="How can we make the experience even better?"
            />
          </div>
        </section>

        {/* Recommendation */}
        <section className="form-section">
          <h3>Recommendation</h3>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                {...register('wouldRecommend')}
              />
              <span>I would recommend Wiro 4x4 Tour to friends and family</span>
            </label>
          </div>

          {wouldRecommend && (
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  {...register('willingToProvideTestimonial')}
                />
                <span>I'm willing to provide a detailed testimonial</span>
              </label>
            </div>
          )}
        </section>

        {/* Privacy */}
        <section className="form-section">
          <h3>Display Preferences</h3>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                {...register('allowPublicDisplay')}
              />
              <span>Allow my review to be displayed publicly on your website</span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="displayName">How should we display your name? (Optional)</label>
            <input
              id="displayName"
              type="text"
              {...register('displayName')}
              placeholder="e.g., John D. from USA"
            />
            <small className="help-text">
              Leave blank to use your full name, or provide a preferred format
            </small>
          </div>
        </section>

        {/* Submit */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
          <p className="privacy-note">
            Your feedback helps us improve and helps future travelers make informed decisions. Thank you!
          </p>
        </div>
      </form>
    </div>
  );
}
