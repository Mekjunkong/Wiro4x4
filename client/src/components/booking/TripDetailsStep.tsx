import { Users, Calendar } from "lucide-react";
import { type FormStepProps, getTodayISO } from "./types";

export function TripDetailsStep({
  formData,
  setFormData,
  formErrors,
  t,
}: FormStepProps) {
  return (
    <>
      {/* Trip Details Section */}
      <fieldset className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-dashed border-primary/30">
        <legend className="text-xl md:text-2xl font-heading font-normal text-primary flex items-center gap-2 px-2">
          <Users className="w-6 h-6" />
          {t("Trip Details", "פרטי הטיול")}
        </legend>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mt-4">
          {/* Number of Adults */}
          <div>
            <label
              htmlFor="numberOfAdults"
              className="block text-sm font-medium mb-2"
            >
              {t("Number of Adults", "מספר מבוגרים")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="numberOfAdults"
              name="numberOfAdults"
              type="number"
              min="1"
              value={formData.numberOfAdults}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  numberOfAdults: parseInt(e.target.value) || 1,
                }))
              }
              className="w-full px-4 py-3 md:py-3 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation"
              required
              aria-required="true"
            />
          </div>

          {/* Has Children */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="hasChildren"
              name="hasChildren"
              checked={formData.hasChildren}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  hasChildren: e.target.checked,
                }))
              }
              className="w-6 h-6 md:w-5 md:h-5 rounded border-border text-primary focus:ring-primary touch-manipulation"
            />
            <label htmlFor="hasChildren" className="text-sm font-medium">
              {t("Has Children", "מגיעים עם ילדים")}
            </label>
          </div>

          {formData.hasChildren && (
            <>
              <div>
                <label
                  htmlFor="numberOfChildren"
                  className="block text-sm font-medium mb-2"
                >
                  {t("Number of Children", "מספר ילדים")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="numberOfChildren"
                  name="numberOfChildren"
                  type="number"
                  min="0"
                  value={formData.numberOfChildren}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      numberOfChildren: parseInt(e.target.value) || 0,
                    }))
                  }
                  className={`w-full px-4 py-3 md:py-3 text-base border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation ${formErrors.numberOfChildren ? "border-red-500" : "border-border"}`}
                  required
                  aria-required="true"
                  aria-invalid={!!formErrors.numberOfChildren}
                  aria-describedby={
                    formErrors.numberOfChildren
                      ? "error-numberOfChildren"
                      : undefined
                  }
                />
                {formErrors.numberOfChildren && (
                  <span
                    id="error-numberOfChildren"
                    className="text-red-500 text-sm mt-1 block"
                    role="alert"
                  >
                    {formErrors.numberOfChildren}
                  </span>
                )}
              </div>
              <div>
                <label
                  htmlFor="childrenAges"
                  className="block text-sm font-medium mb-2"
                >
                  {t("Children Ages", "גילאי הילדים")}
                </label>
                <input
                  id="childrenAges"
                  name="childrenAges"
                  type="text"
                  placeholder={t("e.g., 5, 8, 12", "לדוגמה: 5, 8, 12")}
                  value={formData.childrenAges}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      childrenAges: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 md:py-3 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation"
                />
              </div>
            </>
          )}
        </div>
      </fieldset>

      {/* Dates & Logistics Section */}
      <fieldset className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-dashed border-primary/30">
        <legend className="text-xl md:text-2xl font-heading font-normal text-primary flex items-center gap-2 px-2">
          <Calendar className="w-6 h-6" />
          {t("Dates & Logistics", "תאריכים ולוגיסטיקה")}
        </legend>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mt-4">
          {/* Pickup Date */}
          <div>
            <label
              htmlFor="arrivalDate"
              className="block text-sm font-medium mb-2"
            >
              {t("Pickup Date", "תאריך הגעה")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="arrivalDate"
              name="arrivalDate"
              type="date"
              min={getTodayISO()}
              value={formData.arrivalDate}
              onChange={e =>
                setFormData(prev => ({ ...prev, arrivalDate: e.target.value }))
              }
              className={`w-full px-4 py-3 md:py-3 text-base border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation ${formErrors.arrivalDate ? "border-red-500" : "border-border"}`}
              required
              aria-required="true"
              aria-invalid={!!formErrors.arrivalDate}
              aria-describedby={
                formErrors.arrivalDate ? "error-arrivalDate" : undefined
              }
            />
            {formErrors.arrivalDate && (
              <span
                id="error-arrivalDate"
                className="text-red-500 text-sm mt-1 block"
                role="alert"
              >
                {formErrors.arrivalDate}
              </span>
            )}
          </div>

          {/* Pickup Point */}
          <fieldset>
            <legend className="block text-sm font-medium mb-2">
              {t("Pickup Point", "נקודת איסוף")}
            </legend>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pickupPoint"
                  value="airport"
                  checked={formData.pickupPoint === "airport"}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      pickupPoint: e.target.value,
                    }))
                  }
                  className="w-5 h-5 md:w-4 md:h-4 text-primary focus:ring-primary touch-manipulation"
                />
                {t("Airport", "שדה תעופה")}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pickupPoint"
                  value="hotel"
                  checked={formData.pickupPoint === "hotel"}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      pickupPoint: e.target.value,
                    }))
                  }
                  className="w-5 h-5 md:w-4 md:h-4 text-primary focus:ring-primary touch-manipulation"
                />
                {t("Hotel", "מלון")}
              </label>
            </div>
          </fieldset>

          {/* End Date */}
          <div>
            <label
              htmlFor="departureDate"
              className="block text-sm font-medium mb-2"
            >
              {t("End Date", "תאריך עזיבה")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="departureDate"
              name="departureDate"
              type="date"
              min={formData.arrivalDate || getTodayISO()}
              value={formData.departureDate}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  departureDate: e.target.value,
                }))
              }
              className={`w-full px-4 py-3 md:py-3 text-base border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation ${formErrors.departureDate ? "border-red-500" : "border-border"}`}
              required
              aria-required="true"
              aria-invalid={!!formErrors.departureDate}
              aria-describedby={
                formErrors.departureDate ? "error-departureDate" : undefined
              }
            />
            {formErrors.departureDate && (
              <span
                id="error-departureDate"
                className="text-red-500 text-sm mt-1 block"
                role="alert"
              >
                {formErrors.departureDate}
              </span>
            )}
          </div>

          {/* Dropoff Point */}
          <fieldset>
            <legend className="block text-sm font-medium mb-2">
              {t("Dropoff Point", "נקודת פיזור")}
            </legend>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="dropoffPoint"
                  value="airport"
                  checked={formData.dropoffPoint === "airport"}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      dropoffPoint: e.target.value,
                    }))
                  }
                  className="w-5 h-5 md:w-4 md:h-4 text-primary focus:ring-primary touch-manipulation"
                />
                {t("Airport", "שדה תעופה")}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="dropoffPoint"
                  value="hotel"
                  checked={formData.dropoffPoint === "hotel"}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      dropoffPoint: e.target.value,
                    }))
                  }
                  className="w-5 h-5 md:w-4 md:h-4 text-primary focus:ring-primary touch-manipulation"
                />
                {t("Hotel", "מלון")}
              </label>
            </div>
          </fieldset>
        </div>
      </fieldset>
    </>
  );
}
