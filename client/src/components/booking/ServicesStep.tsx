import { Car, Hotel, User, Mountain, Utensils } from "lucide-react";
import { type FormStepProps, SHABBAT_HOTELS } from "./types";

export function ServicesStep({
  formData,
  setFormData,
  formErrors,
  isHebrew,
  t,
}: FormStepProps) {
  return (
    <fieldset
      className="bg-card rounded-2xl p-4 md:p-6 shadow-lg border-2 border-dashed border-primary/30"
      aria-describedby={formErrors.services ? "error-services" : undefined}
    >
      <legend className="text-xl md:text-2xl font-heading font-normal text-primary flex items-center gap-2 px-2">
        <Car className="w-6 h-6" />
        {t("Required Services", "מה לכלול בטיול?")}{" "}
        <span className="text-red-500 text-base">*</span>
      </legend>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {[
          {
            key: "includesHotels",
            icon: Hotel,
            en: "Includes Hotels?",
            he: "כולל מלונות?",
          },
          {
            key: "includesGuide",
            icon: User,
            en: "Includes Guide?",
            he: "כולל מדריך?",
          },
          {
            key: "includesTrip",
            icon: Car,
            en: "Includes 4x4 Trip?",
            he: "כולל טיול 4x4?",
          },
          {
            key: "includesAttractions",
            icon: Mountain,
            en: "Includes Attractions?",
            he: "כולל אטרקציות?",
          },
          {
            key: "includesFood",
            icon: Utensils,
            en: "Includes Food (Kosher/Vegan)?",
            he: "כולל ארוחות? (כשר / צמחוני / טבעוני)",
          },
          {
            key: "needsShabbatHotel",
            icon: Hotel,
            en: "Shabbat Hotel near Chabad?",
            he: 'שבת - צריך מלון ליד חב"ד?',
          },
          {
            key: "selfDriving4x4",
            icon: Car,
            en: "Self-Driving 4x4 Rental ($100-150/day)?",
            he: "השכרת רכב 4x4 לנהיגה עצמית ($100-150 ליום)?",
          },
        ].map(({ key, icon: Icon, en, he }) => (
          <label
            key={key}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              name={key}
              checked={formData[key as keyof typeof formData] as boolean}
              onChange={e =>
                setFormData(prev => ({ ...prev, [key]: e.target.checked }))
              }
              className="w-6 h-6 md:w-5 md:h-5 rounded border-border text-primary focus:ring-primary touch-manipulation"
            />
            <Icon className="w-5 h-5 text-primary" />
            <span className="font-medium">{t(en, he)}</span>
          </label>
        ))}
      </div>
      {formErrors.services && (
        <span
          id="error-services"
          className="text-red-500 text-sm mt-2 block"
          role="alert"
        >
          {formErrors.services}
        </span>
      )}

      {formData.needsShabbatHotel && (
        <div className="mt-4">
          <label
            htmlFor="shabbatHotel"
            className="block text-sm font-medium mb-2"
          >
            {t("Select Shabbat Hotel", "בחרו מלון לשבת")}
          </label>
          <select
            id="shabbatHotel"
            name="shabbatHotel"
            value={formData.shabbatHotel}
            onChange={e =>
              setFormData(prev => ({ ...prev, shabbatHotel: e.target.value }))
            }
            className="w-full px-4 py-3 md:py-3 text-base border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation"
          >
            <option value="">{t("Select...", "בחרו...")}</option>
            {SHABBAT_HOTELS.map(hotel => (
              <option key={hotel.id} value={hotel.id}>
                {isHebrew ? hotel.he : hotel.en}
              </option>
            ))}
          </select>
        </div>
      )}
    </fieldset>
  );
}
