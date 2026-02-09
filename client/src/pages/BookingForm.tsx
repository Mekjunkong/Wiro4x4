import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Calendar,
  Users,
  MapPin,
  Car,
  User,
  MessageCircle,
  Loader2,
  Save,
} from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  TripDetailsStep,
  ServicesStep,
  DestinationsStep,
  ContactStep,
  BookingFormSuccess,
  DESTINATIONS,
  type FormData,
} from "@/components/booking";

const DRAFT_KEY = "wiro-booking-draft";

const defaultFormData: FormData = {
  // Contact
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  contactWhatsApp: "",
  agentName: "",

  // Trip Details
  arrivalDate: "",
  departureDate: "",
  numberOfAdults: 2,
  hasChildren: false,
  numberOfChildren: 0,
  childrenAges: "",

  // Services
  includesHotels: false,
  hotelPreferences: "",
  includesGuide: false,
  includesTrip: false,
  includesAttractions: false,
  selectedAttractions: [],
  includesFood: false,
  foodPreferences: "",
  needsShabbatHotel: false,
  shabbatHotel: "",

  // Logistics
  pickupPoint: "airport",
  customPickupLocation: "",
  dropoffPoint: "airport",
  customDropoffLocation: "",
  suggestedDestinations: [],

  // Additional
  specialRequests: "",
  budget: "",
};

export default function BookingForm() {
  const { language, t } = useLanguage();
  const isHebrew = language === "he";
  usePageMeta(
    "Book Your Tour",
    "Book your kosher off-road adventure in Chiang Mai with WIRO 4x4. Hebrew-speaking guides and Shabbat-friendly scheduling."
  );

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [bookingRef, setBookingRef] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  // N5: Load draft from localStorage on mount
  const [formData, setFormData] = useState<FormData>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultFormData, ...parsed };
      }
    } catch {
      /* ignore parse errors */
    }
    return defaultFormData;
  });

  // N5: Auto-save draft to localStorage (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      } catch {
        /* ignore storage errors */
      }
    }, 1000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [formData]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // contactName required, min 2 chars
    if (!formData.contactName || formData.contactName.trim().length < 2) {
      errors.contactName = t(
        "Name must be at least 2 characters",
        "השם חייב להכיל לפחות 2 תווים"
      );
    }

    // Email format validation
    if (formData.contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactEmail)) {
        errors.contactEmail = t(
          "Please enter a valid email address",
          "יש להזין כתובת מייל תקינה"
        );
      }
    }

    // Phone: digits, +, spaces, dashes, min 8 chars
    if (!formData.contactPhone || formData.contactPhone.trim().length < 8) {
      errors.contactPhone = t(
        "Phone number must be at least 8 characters",
        "יש להזין מספר טלפון עם לפחות 8 ספרות"
      );
    } else if (!/^[\d+\s\-()]+$/.test(formData.contactPhone.trim())) {
      errors.contactPhone = t(
        "Phone number can only contain digits, +, spaces, and dashes",
        "מספר טלפון יכול להכיל רק ספרות, פלוס, רווחים ומקפים"
      );
    }

    // arrivalDate must be at least 24 hours in the future
    if (!formData.arrivalDate) {
      errors.arrivalDate = t("Pickup date is required", "יש לבחור תאריך הגעה");
    } else {
      const arrival = new Date(formData.arrivalDate);
      const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      if (arrival < minDate) {
        errors.arrivalDate = t(
          "Pickup date must be at least 24 hours from now",
          "תאריך ההגעה חייב להיות לפחות 24 שעות מעכשיו"
        );
      }
    }

    // departureDate must be after arrivalDate
    if (!formData.departureDate) {
      errors.departureDate = t("End date is required", "יש לבחור תאריך עזיבה");
    } else if (
      formData.arrivalDate &&
      formData.departureDate <= formData.arrivalDate
    ) {
      errors.departureDate = t(
        "End date must be after pickup date",
        "תאריך העזיבה חייב להיות אחרי תאריך ההגעה"
      );
    }

    // numberOfChildren required if hasChildren is true
    if (
      formData.hasChildren &&
      (!formData.numberOfChildren || formData.numberOfChildren < 1)
    ) {
      errors.numberOfChildren = t(
        "Please specify the number of children",
        "יש לציין כמה ילדים"
      );
    }

    // At least one service must be selected
    const hasService =
      formData.includesHotels ||
      formData.includesGuide ||
      formData.includesTrip ||
      formData.includesAttractions ||
      formData.includesFood;
    if (!hasService) {
      errors.services = t(
        "Please select at least one service",
        "יש לבחור לפחות שירות אחד"
      );
    }

    // Consent must be given
    if (!consentGiven) {
      errors.consent = t(
        "You must agree to the Terms of Service and Privacy Policy",
        "יש לאשר את תנאי השירות ומדיניות הפרטיות"
      );
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error(
        t(
          "Please fix the errors in the form before submitting",
          "יש לתקן את השגיאות בטופס לפני השליחה"
        )
      );
      return false;
    }
    return true;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const createBooking = trpc.booking.create.useMutation({
    onSuccess: () => {
      setIsSubmitting(false);
      setBookingRef(`WIRO-${Date.now()}`);
      setSubmitSuccess(true);
      // N5: Clear draft on successful submission
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      toast.success(
        t("Booking submitted successfully!", "ההזמנה נשלחה בהצלחה!")
      );
      // Generate WhatsApp message
      const message = generateWhatsAppMessage();
      window.open(
        `https://wa.me/66929894495?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    },
    onError: error => {
      setIsSubmitting(false);
      toast.error(
        t(
          "Error submitting form. Please try again.",
          "שגיאה בשליחת הטופס. אפשר לנסות שוב."
        )
      );
      console.error(error);
    },
  });

  const generateWhatsAppMessage = () => {
    const destinations = formData.suggestedDestinations
      .map(
        (id: string) =>
          DESTINATIONS.find(d => d.id === id)?.[isHebrew ? "he" : "en"]
      )
      .filter(Boolean)
      .join(", ");

    if (isHebrew) {
      return `🚙 בקשת הזמנה חדשה - WIRO 4x4

👤 שם: ${formData.contactName}
📞 טלפון: ${formData.contactPhone}
📧 מייל: ${formData.contactEmail}

📅 תאריכים: ${formData.arrivalDate} עד ${formData.departureDate}
👥 מבוגרים: ${formData.numberOfAdults}
${formData.hasChildren ? `👶 ילדים: ${formData.numberOfChildren}` : ""}

🗺️ יעדים: ${destinations || "לא נבחרו"}

🛎️ שירותים:
${formData.includesHotels ? "✅ מלונות" : ""}
${formData.includesGuide ? "✅ מדריך" : ""}
${formData.includesTrip ? "✅ טיול 4x4" : ""}
${formData.includesAttractions ? "✅ אטרקציות" : ""}
${formData.includesFood ? "✅ אוכל כשר" : ""}
${formData.needsShabbatHotel ? '✅ מלון שבת ליד חב"ד' : ""}

${formData.specialRequests ? `📝 בקשות מיוחדות: ${formData.specialRequests}` : ""}
${formData.agentName ? `🏢 סוכן: ${formData.agentName}` : ""}`;
    } else {
      return `🚙 New Booking Request - WIRO 4x4

👤 Name: ${formData.contactName}
📞 Phone: ${formData.contactPhone}
📧 Email: ${formData.contactEmail}

📅 Dates: ${formData.arrivalDate} - ${formData.departureDate}
👥 Adults: ${formData.numberOfAdults}
${formData.hasChildren ? `👶 Children: ${formData.numberOfChildren}` : ""}

🗺️ Destinations: ${destinations || "None selected"}

Services:
${formData.includesHotels ? "✅ Hotels" : ""}
${formData.includesGuide ? "✅ Guide" : ""}
${formData.includesTrip ? "✅ 4x4 Trip" : ""}
${formData.includesAttractions ? "✅ Attractions" : ""}
${formData.includesFood ? "✅ Kosher Food" : ""}
${formData.needsShabbatHotel ? "✅ Shabbat Hotel near Chabad" : ""}

${formData.specialRequests ? `📝 Special Requests: ${formData.specialRequests}` : ""}
${formData.agentName ? `🏢 Agent: ${formData.agentName}` : ""}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      await createBooking.mutateAsync({
        ...formData,
        selectedAttractions: JSON.stringify(formData.selectedAttractions),
        suggestedDestinations: JSON.stringify(formData.suggestedDestinations),
        childrenAges: formData.childrenAges,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepProps = { formData, setFormData, formErrors, isHebrew, t };

  if (submitSuccess) {
    return (
      <BookingFormSuccess isHebrew={isHebrew} t={t} bookingRef={bookingRef} />
    );
  }

  return (
    <div
      className={`min-h-screen ${isHebrew ? "rtl" : "ltr"}`}
      dir={isHebrew ? "rtl" : "ltr"}
    >
      <Header />
      <main id="main-content">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-secondary to-secondary/85 py-16 md:py-20 text-center text-white mt-20">
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3 md:mb-4 px-4">
            {t("Tour Booking Form", "טופס הזמנת טיול")}
          </h1>
          <p className="text-lg md:text-xl opacity-90 px-4">
            {t(
              "Quick intake form for phone calls and personal meetings",
              "מלאו את הפרטים ונחזור אליכם בהקדם"
            )}
          </p>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl pb-24">
          {/* I3: Progress indicator showing form sections */}
          <div className="mb-8 overflow-x-auto scrollbar-hide">
            <div className="flex items-center justify-between min-w-[500px] px-2">
              {[
                { num: 1, label: t("Trip Details", "פרטי הטיול"), icon: Users },
                { num: 2, label: t("Dates", "תאריכים"), icon: Calendar },
                { num: 3, label: t("Services", "שירותים"), icon: Car },
                { num: 4, label: t("Destinations", "יעדים"), icon: MapPin },
                { num: 5, label: t("Contact", "פרטי קשר"), icon: User },
                { num: 6, label: t("Submit", "שליחה"), icon: MessageCircle },
              ].map((step, idx, arr) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.num}
                    className="flex items-center flex-1 last:flex-initial"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold border-2 border-primary/30">
                        <StepIcon className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <span className="text-[10px] md:text-xs text-muted-foreground font-medium text-center whitespace-nowrap">
                        {step.label}
                      </span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="flex-1 h-0.5 bg-primary/20 mx-1 md:mx-2 mt-[-16px]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 md:space-y-8"
            noValidate
          >
            <fieldset disabled={isSubmitting}>
              <div className="space-y-6 md:space-y-8">
                <TripDetailsStep {...stepProps} />
                <ServicesStep {...stepProps} />
                <DestinationsStep {...stepProps} />
                <ContactStep {...stepProps} />
              </div>
            </fieldset>

            {/* Draft saved indicator (N5) */}
            {draftSaved && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-fade-in">
                <Save className="w-4 h-4" />
                {t("Draft saved", "טיוטה נשמרה")}
              </div>
            )}

            {/* Consent Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consentGiven"
                checked={consentGiven}
                onChange={e => setConsentGiven(e.target.checked)}
                className={`w-5 h-5 mt-0.5 rounded border-border text-primary focus:ring-primary touch-manipulation shrink-0 ${formErrors.consent ? "border-red-500" : ""}`}
                aria-required="true"
                aria-invalid={!!formErrors.consent}
                aria-describedby={
                  formErrors.consent ? "error-consent" : undefined
                }
              />
              <label
                htmlFor="consentGiven"
                className="text-sm text-muted-foreground"
              >
                {t("I agree to the ", "אני מסכים/ה ל")}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  {t("Terms of Service", "תנאי השירות")}
                </a>
                {t(" and ", " ול")}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  {t("Privacy Policy", "מדיניות הפרטיות")}
                </a>
              </label>
            </div>
            {formErrors.consent && (
              <span
                id="error-consent"
                className="text-red-500 text-sm block"
                role="alert"
              >
                {formErrors.consent}
              </span>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 px-8 rounded-xl font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {t("Submitting...", "שולחים...")}
                </>
              ) : (
                <>
                  <MessageCircle className="w-6 h-6" />
                  {t("Submit & Send to WhatsApp", "שליחה דרך וואטסאפ")}
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
