import { useState, useEffect, useRef, useMemo } from "react";
import { trackEvent, FUNNEL } from "@/lib/analytics";
import { getStoredUtm } from "@/lib/utm";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_NUMBER } from "@/const";
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
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Button } from "@/components/ui/button";
import { GoldDivider } from "@/components/GoldDivider";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  TripDetailsStep,
  ServicesStep,
  DestinationsStep,
  ContactStep,
  BookingFormSuccess,
  PricingSummary,
  DESTINATIONS,
  type FormData,
} from "@/components/booking";
import {
  calculateTripTotal,
  type TripConfig,
  type PriceBreakdown,
} from "@shared/pricing";

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
  selfDriving4x4: false,
};

export default function BookingForm() {
  const { language, t } = useLanguage();
  const isHebrew = language === "he";
  usePageMeta(
    "Book Your Tour",
    "Book your kosher off-road adventure in Chiang Mai with WIRO 4x4. Hebrew-speaking guides and Shabbat-friendly scheduling."
  );

  useEffect(() => {
    trackEvent(FUNNEL.BOOKING_STARTED);
  }, []);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [bookingRef, setBookingRef] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  // Read URL params once on mount
  const [tokenParam] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token");
  });
  const [toursParam] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tours");
  });

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

  // Server-side token query (runs after localStorage restore; server data takes priority)
  const { data: serverDraft } = trpc.bookingDraft.getByToken.useQuery(
    { token: tokenParam! },
    { enabled: !!tokenParam }
  );

  useEffect(() => {
    if (serverDraft?.formData) {
      try {
        const restored = JSON.parse(serverDraft.formData);
        setFormData(prev => ({ ...prev, ...restored }));
        toast.info(
          t(
            "Welcome back! Your booking draft was restored.",
            "\u05D1\u05E8\u05D5\u05DB\u05D9\u05DD \u05D4\u05E9\u05D1\u05D9\u05DD! \u05D8\u05D9\u05D5\u05D8\u05EA \u05D4\u05D4\u05D6\u05DE\u05E0\u05D4 \u05E9\u05DC\u05DB\u05DD \u05E9\u05D5\u05D7\u05D6\u05E8\u05D4."
          )
        );
      } catch {
        /* ignore parse errors */
      }
    }
  }, [serverDraft]);

  // Pre-fill from ?tours= query param (package booking flow)
  const preSelectedSlugs = useMemo(
    () =>
      toursParam
        ? toursParam
            .split(",")
            .map(s => s.trim())
            .filter(Boolean)
        : [],
    [toursParam]
  );
  const { data: allTours } = trpc.tour.list.useQuery(undefined, {
    enabled: preSelectedSlugs.length > 0,
  });
  const [toursApplied, setToursApplied] = useState(false);
  useEffect(() => {
    if (toursApplied || preSelectedSlugs.length === 0 || !allTours) return;
    const matched = allTours.filter(t => preSelectedSlugs.includes(t.slug));
    if (matched.length === 0) return;

    // Map tour slugs to destination region IDs where possible
    const SLUG_TO_DEST: Record<string, string> = {
      "doi-inthanon-roof-of-thailand": "doi-inthanon",
    };
    const destIds = Array.from(
      new Set(
        matched
          .map(t => SLUG_TO_DEST[t.slug])
          .filter((id): id is string => !!id)
      )
    );
    // Always include chiang-mai since all tours are Chiang Mai area
    if (!destIds.includes("chiang-mai")) destIds.push("chiang-mai");

    const tourNames = matched.map(t => t.name).join(", ");
    setFormData(prev => ({
      ...prev,
      suggestedDestinations: Array.from(
        new Set([...prev.suggestedDestinations, ...destIds])
      ),
      specialRequests: prev.specialRequests
        ? prev.specialRequests
        : `Package tours: ${tourNames}`,
      includesTrip: true,
    }));
    setToursApplied(true);
  }, [allTours, preSelectedSlugs, toursApplied]);

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

  // Unsaved changes warning — only when form has been modified
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(defaultFormData);
  }, [formData]);

  // Live pricing estimate from form data
  const priceBreakdown = useMemo((): PriceBreakdown | null => {
    try {
      if (!formData.arrivalDate || !formData.departureDate) return null;

      const arrival = new Date(formData.arrivalDate);
      const departure = new Date(formData.departureDate);
      if (isNaN(arrival.getTime()) || isNaN(departure.getTime())) return null;
      if (departure <= arrival) return null;

      // Parse children ages from comma-separated string
      const children: { age: number }[] = [];
      if (formData.hasChildren && formData.childrenAges) {
        formData.childrenAges.split(",").forEach(a => {
          const age = parseInt(a.trim(), 10);
          if (!isNaN(age) && age >= 0) children.push({ age });
        });
      }

      // Use number of selected destinations as tours, default to 1
      const numTours = Math.max(formData.suggestedDestinations.length, 1);
      const tours = Array.from({ length: numTours }, (_, i) => ({
        slug: `tour-${i + 1}`,
        nameEn: `Tour ${i + 1}`,
        nameHe: `\u05D8\u05D9\u05D5\u05DC ${i + 1}`,
        basePrice: 4500,
        bookingCount: 0,
      }));

      const config: TripConfig = {
        tours,
        group: { adults: formData.numberOfAdults, children },
        arrivalDate: arrival,
        departureDate: departure,
        services: {
          includesHotels: formData.includesHotels,
          includesFood: formData.includesFood,
          includesAttractions: formData.includesAttractions,
          attractionCount: formData.selectedAttractions.length,
        },
        needsShabbatHotel: formData.needsShabbatHotel,
      };

      return calculateTripTotal(config);
    } catch {
      return null;
    }
  }, [formData]);

  // Ref for scrolling to error summary
  const errorSummaryRef = useRef<HTMLDivElement>(null);

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
      // Scroll to error summary
      setTimeout(() => {
        errorSummaryRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
      return false;
    }
    return true;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Unsaved changes warning — prevent accidental navigation
  useEffect(() => {
    if (!hasUnsavedChanges || submitSuccess) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges, submitSuccess]);

  const createBooking = trpc.booking.create.useMutation({
    onSuccess: data => {
      trackEvent(FUNNEL.BOOKING_COMPLETED);
      setIsSubmitting(false);
      setBookingRef(`WIRO-${data.bookingId || Date.now()}`);
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
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
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

    const services: string[] = [];
    if (isHebrew) {
      if (formData.includesHotels) services.push("🏨 מלונות");
      if (formData.includesGuide) services.push("🧭 מדריך");
      if (formData.includesTrip) services.push("🚙 טיול 4x4");
      if (formData.includesAttractions) services.push("🎯 אטרקציות");
      if (formData.includesFood) services.push("🍽️ אוכל כשר");
      if (formData.needsShabbatHotel) services.push('🕯️ מלון שבת ליד חב"ד');
    } else {
      if (formData.includesHotels) services.push("🏨 Hotels");
      if (formData.includesGuide) services.push("🧭 Guide");
      if (formData.includesTrip) services.push("🚙 4x4 Trip");
      if (formData.includesAttractions) services.push("🎯 Attractions");
      if (formData.includesFood) services.push("🍽️ Kosher Food");
      if (formData.needsShabbatHotel)
        services.push("🕯️ Shabbat Hotel near Chabad");
    }

    const extras: string[] = [];
    if (formData.hasChildren && formData.numberOfChildren) {
      extras.push(
        isHebrew
          ? `👶 ילדים: ${formData.numberOfChildren}${formData.childrenAges ? ` (גילאים: ${formData.childrenAges})` : ""}`
          : `👶 Children: ${formData.numberOfChildren}${formData.childrenAges ? ` (ages: ${formData.childrenAges})` : ""}`
      );
    }
    if (formData.pickupPoint) {
      const pickup =
        formData.pickupPoint === "custom"
          ? formData.customPickupLocation
          : formData.pickupPoint;
      extras.push(isHebrew ? `📍 איסוף: ${pickup}` : `📍 Pickup: ${pickup}`);
    }
    if (formData.dropoffPoint) {
      const dropoff =
        formData.dropoffPoint === "custom"
          ? formData.customDropoffLocation
          : formData.dropoffPoint;
      extras.push(isHebrew ? `📍 הורדה: ${dropoff}` : `📍 Dropoff: ${dropoff}`);
    }
    if (formData.budget) {
      extras.push(
        isHebrew
          ? `💰 תקציב: ${formData.budget}`
          : `💰 Budget: ${formData.budget}`
      );
    }
    if (formData.specialRequests) {
      extras.push(
        isHebrew
          ? `📝 בקשות מיוחדות: ${formData.specialRequests}`
          : `📝 Special Requests: ${formData.specialRequests}`
      );
    }
    if (formData.agentName) {
      extras.push(
        isHebrew
          ? `🏢 סוכן: ${formData.agentName}`
          : `🏢 Agent: ${formData.agentName}`
      );
    }

    const lines = [
      isHebrew ? "━━━━━━━━━━━━━━━━━━━━" : "━━━━━━━━━━━━━━━━━━━━",
      isHebrew
        ? "🚙 *בקשת הזמנה חדשה - WIRO 4x4*"
        : "🚙 *New Booking Request - WIRO 4x4*",
      isHebrew ? "━━━━━━━━━━━━━━━━━━━━" : "━━━━━━━━━━━━━━━━━━━━",
      "",
      isHebrew
        ? `👤 *שם:* ${formData.contactName}`
        : `👤 *Name:* ${formData.contactName}`,
      isHebrew
        ? `📞 *טלפון:* ${formData.contactPhone}`
        : `📞 *Phone:* ${formData.contactPhone}`,
      formData.contactEmail
        ? isHebrew
          ? `📧 *מייל:* ${formData.contactEmail}`
          : `📧 *Email:* ${formData.contactEmail}`
        : "",
      formData.contactWhatsApp
        ? isHebrew
          ? `💬 *וואטסאפ:* ${formData.contactWhatsApp}`
          : `💬 *WhatsApp:* ${formData.contactWhatsApp}`
        : "",
      "",
      isHebrew
        ? `📅 *תאריכים:* ${formData.arrivalDate} ➜ ${formData.departureDate}`
        : `📅 *Dates:* ${formData.arrivalDate} ➜ ${formData.departureDate}`,
      isHebrew
        ? `👥 *מבוגרים:* ${formData.numberOfAdults}`
        : `👥 *Adults:* ${formData.numberOfAdults}`,
      ...extras.slice(0, 1), // children line if exists
      "",
      destinations
        ? isHebrew
          ? `🗺️ *יעדים:* ${destinations}`
          : `🗺️ *Destinations:* ${destinations}`
        : "",
      "",
      isHebrew ? "🛎️ *שירותים:*" : "🛎️ *Services:*",
      ...services,
      "",
      ...extras.slice(1), // pickup, dropoff, budget, special requests, agent
      "",
      isHebrew ? "━━━━━━━━━━━━━━━━━━━━" : "━━━━━━━━━━━━━━━━━━━━",
      isHebrew ? "🌐 wiro4x4indochina.com" : "🌐 wiro4x4indochina.com",
    ];

    // Remove consecutive blank lines and trim
    return lines
      .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
      .join("\n")
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const utm = getStoredUtm();
      await createBooking.mutateAsync({
        ...formData,
        selectedAttractions: JSON.stringify(formData.selectedAttractions),
        suggestedDestinations: JSON.stringify(formData.suggestedDestinations),
        childrenAges: formData.childrenAges,
        utmSource: utm?.utm_source,
        utmMedium: utm?.utm_medium,
        utmCampaign: utm?.utm_campaign,
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
      <Breadcrumb
        items={[
          {
            label: t(
              "Book a Tour",
              "\u05D4\u05D6\u05DE\u05E0\u05EA \u05D8\u05D9\u05D5\u05DC"
            ),
          },
        ]}
      />
      <main id="main-content">
        {/* Hero Banner */}
        <section
          className="relative min-h-[40vh] flex items-center justify-center bg-cover bg-center mt-20"
          style={{
            backgroundImage: "url('/images/optimized/hero-waterfall.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-2">
              {t("Book Your Adventure", "הזמינו את ההרפתקה")}
            </h1>
            <GoldDivider />
          </div>
        </section>

        {/* Form Card + Pricing Sidebar */}
        <div className="max-w-6xl mx-auto -mt-20 relative z-10 mb-24 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-2 bg-card border border-[#D4AF37]/30 rounded-sm shadow-premium p-6 md:p-8">
              {/* Progress indicator showing form sections */}
              <div className="mb-8 overflow-x-auto scrollbar-hide">
                <div className="flex items-center justify-between min-w-[500px] px-2">
                  {[
                    {
                      num: 1,
                      label: t("Trip Details", "פרטי הטיול"),
                      icon: Users,
                    },
                    { num: 2, label: t("Dates", "תאריכים"), icon: Calendar },
                    { num: 3, label: t("Services", "שירותים"), icon: Car },
                    { num: 4, label: t("Destinations", "יעדים"), icon: MapPin },
                    { num: 5, label: t("Contact", "פרטי קשר"), icon: User },
                    {
                      num: 6,
                      label: t("Submit", "שליחה"),
                      icon: MessageCircle,
                    },
                  ].map((step, idx, arr) => {
                    const StepIcon = step.icon;
                    return (
                      <div
                        key={step.num}
                        className="flex items-center flex-1 last:flex-initial"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-sm font-bold border-2 border-[#D4AF37]/30">
                            <StepIcon className="w-4 h-4 md:w-5 md:h-5" />
                          </div>
                          <span className="text-[10px] md:text-xs text-muted-foreground font-medium text-center whitespace-nowrap">
                            {step.label}
                          </span>
                        </div>
                        {idx < arr.length - 1 && (
                          <div className="flex-1 h-0.5 bg-[#D4AF37]/20 mx-1 md:mx-2 mt-[-16px]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Error Summary */}
              {Object.keys(formErrors).length > 0 && (
                <div
                  ref={errorSummaryRef}
                  className="rounded-sm border border-red-200 bg-red-50 p-4 mb-6"
                  role="alert"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <h3 className="font-semibold text-red-800">
                      {t(
                        `Please fix ${Object.keys(formErrors).length} error${Object.keys(formErrors).length > 1 ? "s" : ""} before submitting`,
                        `יש לתקן ${Object.keys(formErrors).length} שגיא${Object.keys(formErrors).length > 1 ? "ות" : "ה"} לפני השליחה`
                      )}
                    </h3>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                    {Object.values(formErrors).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

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
                    className={`w-5 h-5 mt-0.5 rounded-sm border-border text-[#D4AF37] focus:ring-[#D4AF37] touch-manipulation shrink-0 ${formErrors.consent ? "border-red-500" : ""}`}
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
                      className="text-[#D4AF37] hover:underline font-medium"
                    >
                      {t("Terms of Service", "תנאי השירות")}
                    </a>
                    {t(" and ", " ול")}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#D4AF37] hover:underline font-medium"
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
                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full py-4 text-lg"
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
                </Button>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" />
                    {t(
                      "Free cancellation within 48h",
                      "\u05D1\u05D9\u05D8\u05D5\u05DC \u05D7\u05D9\u05E0\u05DD \u05EA\u05D5\u05DA 48 \u05E9\u05E2\u05D5\u05EA"
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    {t(
                      "Secure booking",
                      "\u05D4\u05D6\u05DE\u05E0\u05D4 \u05DE\u05D0\u05D5\u05D1\u05D8\u05D7\u05EA"
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {t(
                      "Instant WhatsApp confirmation",
                      "\u05D0\u05D9\u05E9\u05D5\u05E8 \u05DE\u05D9\u05D9\u05D3\u05D9 \u05D1\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4"
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Pricing Sidebar (desktop only) */}
            <div className="hidden lg:block">
              <PricingSummary breakdown={priceBreakdown} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
