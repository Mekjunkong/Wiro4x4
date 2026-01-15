import { useForm } from 'react-hook-form';
import { TourBookingFormData, ATTRACTIONS, DESTINATIONS, SHABBAT_HOTELS } from '../types/tourBooking';
import './TourBookingForm.css';

export default function TourBookingForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<TourBookingFormData>({
    defaultValues: {
      numberOfAdults: 1,
      hasChildren: false,
      includesHotels: false,
      includesGuide: false,
      includesTrip: false,
      includesAttractions: false,
      includesFood: false,
      needsShabbatHotel: false,
      pickupPoint: 'airport',
      dropoffPoint: 'airport',
      suggestedDestinations: []
    }
  });

  // Watch conditional fields
  const hasChildren = watch('hasChildren');
  const pickupPoint = watch('pickupPoint');
  const dropoffPoint = watch('dropoffPoint');
  const includesHotels = watch('includesHotels');
  const includesTrip = watch('includesTrip');
  const includesAttractions = watch('includesAttractions');
  const includesFood = watch('includesFood');
  const needsShabbatHotel = watch('needsShabbatHotel');
  const shabbatHotel = watch('shabbatHotel');

  const onSubmit = async (data: TourBookingFormData) => {
    try {
      const response = await fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert('Booking submitted successfully! We will contact you soon.');
        // Optionally reset form or redirect
      } else {
        alert('Error submitting booking. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting booking. Please check your connection.');
    }
  };

  return (
    <div className="tour-booking-container">
      <h1>Wiro 4x4 Tour - Booking Form</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="tour-booking-form">

        {/* Contact Information */}
        <section className="form-section">
          <h2>Contact Information</h2>

          <div className="form-group">
            <label htmlFor="contactName">Full Name *</label>
            <input
              id="contactName"
              type="text"
              {...register('contactName', { required: 'Name is required' })}
            />
            {errors.contactName && <span className="error">{errors.contactName.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contactEmail">Email *</label>
            <input
              id="contactEmail"
              type="email"
              {...register('contactEmail', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.contactEmail && <span className="error">{errors.contactEmail.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contactPhone">Phone Number *</label>
            <input
              id="contactPhone"
              type="tel"
              {...register('contactPhone', { required: 'Phone number is required' })}
            />
            {errors.contactPhone && <span className="error">{errors.contactPhone.message}</span>}
          </div>
        </section>

        {/* Group Size */}
        <section className="form-section">
          <h2>Group Information</h2>

          <div className="form-group">
            <label htmlFor="numberOfAdults">Number of Adults *</label>
            <input
              id="numberOfAdults"
              type="number"
              min="1"
              {...register('numberOfAdults', {
                required: 'Number of adults is required',
                min: { value: 1, message: 'At least 1 adult required' }
              })}
            />
            {errors.numberOfAdults && <span className="error">{errors.numberOfAdults.message}</span>}
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" {...register('hasChildren')} />
              Children in the group
            </label>
          </div>

          {hasChildren && (
            <div className="form-group conditional-field">
              <label htmlFor="numberOfChildren">Number of Children *</label>
              <select
                id="numberOfChildren"
                {...register('numberOfChildren', {
                  required: hasChildren ? 'Please select number of children' : false
                })}
              >
                <option value="">Select...</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              {errors.numberOfChildren && <span className="error">{errors.numberOfChildren.message}</span>}
            </div>
          )}
        </section>

        {/* Dates */}
        <section className="form-section">
          <h2>Tour Dates</h2>

          <div className="form-group">
            <label htmlFor="pickupDate">Pick-up Date *</label>
            <input
              id="pickupDate"
              type="date"
              {...register('pickupDate', { required: 'Pick-up date is required' })}
            />
            {errors.pickupDate && <span className="error">{errors.pickupDate.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date *</label>
            <input
              id="endDate"
              type="date"
              {...register('endDate', { required: 'End date is required' })}
            />
            {errors.endDate && <span className="error">{errors.endDate.message}</span>}
          </div>
        </section>

        {/* Pickup Location */}
        <section className="form-section">
          <h2>Pick-up Location</h2>

          <div className="form-group">
            <label>Pick-up Point *</label>
            <div className="radio-group">
              <label>
                <input type="radio" value="airport" {...register('pickupPoint')} />
                Airport
              </label>
              <label>
                <input type="radio" value="hotel" {...register('pickupPoint')} />
                Hotel
              </label>
            </div>
          </div>

          {pickupPoint === 'hotel' && (
            <div className="form-group conditional-field">
              <label htmlFor="pickupHotelName">Hotel Name *</label>
              <input
                id="pickupHotelName"
                type="text"
                placeholder="Enter hotel name"
                {...register('pickupHotelName', {
                  required: pickupPoint === 'hotel' ? 'Hotel name is required' : false
                })}
              />
              {errors.pickupHotelName && <span className="error">{errors.pickupHotelName.message}</span>}
            </div>
          )}
        </section>

        {/* Drop-off Location */}
        <section className="form-section">
          <h2>Drop-off Location</h2>

          <div className="form-group">
            <label>Drop-off Point *</label>
            <div className="radio-group">
              <label>
                <input type="radio" value="airport" {...register('dropoffPoint')} />
                Airport
              </label>
              <label>
                <input type="radio" value="hotel" {...register('dropoffPoint')} />
                Hotel
              </label>
            </div>
          </div>

          {dropoffPoint === 'hotel' && (
            <div className="form-group conditional-field">
              <label htmlFor="dropoffHotelName">Hotel Name *</label>
              <input
                id="dropoffHotelName"
                type="text"
                placeholder="Enter hotel name"
                {...register('dropoffHotelName', {
                  required: dropoffPoint === 'hotel' ? 'Hotel name is required' : false
                })}
              />
              {errors.dropoffHotelName && <span className="error">{errors.dropoffHotelName.message}</span>}
            </div>
          )}
        </section>

        {/* Hotels */}
        <section className="form-section">
          <h2>Accommodation</h2>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" {...register('includesHotels')} />
              Include hotels in package
            </label>
          </div>

          {includesHotels && (
            <div className="form-group conditional-field">
              <label htmlFor="hotelLevel">Hotel Level *</label>
              <select
                id="hotelLevel"
                {...register('hotelLevel', {
                  required: includesHotels ? 'Please select hotel level' : false
                })}
              >
                <option value="">Select level...</option>
                <option value="budget">Budget</option>
                <option value="standard">Standard</option>
                <option value="luxury">Luxury</option>
                <option value="premium">Premium</option>
              </select>
              {errors.hotelLevel && <span className="error">{errors.hotelLevel.message}</span>}
            </div>
          )}
        </section>

        {/* Guide */}
        <section className="form-section">
          <h2>Tour Services</h2>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" {...register('includesGuide')} />
              Include a tour guide
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" {...register('includesTrip')} />
              Include trip and 4x4 driving
            </label>
          </div>

          {includesTrip && (
            <div className="form-group conditional-field checkbox-group">
              <label>
                <input type="checkbox" {...register('allowsSelfDriving')} />
                Allow self-driving option
              </label>
            </div>
          )}
        </section>

        {/* Attractions */}
        <section className="form-section">
          <h2>Attractions</h2>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" {...register('includesAttractions')} />
              Include attractions along the way
            </label>
          </div>

          {includesAttractions && (
            <div className="form-group conditional-field">
              <label>Select Attractions</label>
              <div className="checkbox-list">
                {ATTRACTIONS.map((attraction) => (
                  <label key={attraction}>
                    <input
                      type="checkbox"
                      value={attraction}
                      {...register('selectedAttractions')}
                    />
                    {attraction}
                  </label>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Food Preferences */}
        <section className="form-section">
          <h2>Food Preferences</h2>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" {...register('includesFood')} />
              Include food in package
            </label>
          </div>

          {includesFood && (
            <div className="conditional-field">
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" {...register('foodPreferences.kosher')} />
                  Kosher
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" {...register('foodPreferences.vegetarian')} />
                  Vegetarian
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" {...register('foodPreferences.vegan')} />
                  Vegan
                </label>
              </div>
              <div className="form-group">
                <label htmlFor="foodSensitivities">Allergies or Sensitivities</label>
                <textarea
                  id="foodSensitivities"
                  rows={3}
                  placeholder="Please describe any food allergies or sensitivities..."
                  {...register('foodPreferences.sensitivities')}
                />
              </div>
            </div>
          )}
        </section>

        {/* Suggested Destinations */}
        <section className="form-section">
          <h2>Suggested Destinations</h2>

          <div className="form-group">
            <label>Select destinations you'd like to visit</label>
            <div className="checkbox-list">
              {DESTINATIONS.map((destination) => (
                <label key={destination}>
                  <input
                    type="checkbox"
                    value={destination}
                    {...register('suggestedDestinations')}
                  />
                  {destination}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Shabbat */}
        <section className="form-section">
          <h2>Shabbat Accommodation</h2>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" {...register('needsShabbatHotel')} />
              Need hotel near Chabad for Shabbat
            </label>
          </div>

          {needsShabbatHotel && (
            <div className="form-group conditional-field">
              <label htmlFor="shabbatHotel">Select Shabbat Hotel *</label>
              <select
                id="shabbatHotel"
                {...register('shabbatHotel', {
                  required: needsShabbatHotel ? 'Please select a hotel' : false
                })}
              >
                <option value="">Select hotel...</option>
                {SHABBAT_HOTELS.map((hotel) => (
                  <option key={hotel.value} value={hotel.value}>
                    {hotel.label}
                  </option>
                ))}
              </select>
              {errors.shabbatHotel && <span className="error">{errors.shabbatHotel.message}</span>}
            </div>
          )}

          {shabbatHotel === 'other' && (
            <div className="form-group conditional-field">
              <label htmlFor="otherShabbatHotel">Specify Hotel Name *</label>
              <input
                id="otherShabbatHotel"
                type="text"
                placeholder="Enter hotel name"
                {...register('otherShabbatHotel', {
                  required: shabbatHotel === 'other' ? 'Hotel name is required' : false
                })}
              />
              {errors.otherShabbatHotel && <span className="error">{errors.otherShabbatHotel.message}</span>}
            </div>
          )}
        </section>

        <button type="submit" className="submit-button">
          Submit Booking Request
        </button>
      </form>
    </div>
  );
}
