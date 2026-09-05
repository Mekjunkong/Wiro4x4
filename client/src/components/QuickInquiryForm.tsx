import { useMemo, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, MessageCircle, CheckCircle, Clock3 } from "lucide-react";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";
import { trackEvent } from "@/lib/analytics";

const INTEREST_OPTIONS = [
  { value: "day_tour", en: "Day Tour", he: "טיול יום" },
  { value: "multi_day", en: "Multi-Day Package", he: "חבילה רב-יומית" },
  { value: "private", en: "Private Tour", he: "טיול פרטי" },
  { value: "custom", en: "Custom Experience", he: "חוויה מותאמת אישית" },
];

export function QuickInquiryForm() {
  const { t, language } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>();
  const [submitted, setSubmitted] = useState(false);
  const inquiryStartedRef = useRef(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    travelDates: "",
    groupSize: "",
    pickupArea: "",
    interest: "day_tour",
    notes: "",
  });

  const selectedInterest =
    INTEREST_OPTIONS.find(option => option.value === form.interest) ||
    INTEREST_OPTIONS[0];

  const whatsappMessage = useMemo(
    () =>
      language === "he"
        ? [
            "שלום WIRO 4x4, אשמח לבדוק זמינות לטיול פרטי.",
            `תאריכים: ${form.travelDates || "__"}`,
            `מספר מטיילים: ${form.groupSize || "__"}`,
            `אזור איסוף / מלון: ${form.pickupArea || "__"}`,
            `סוג טיול: ${selectedInterest.he}`,
            `צרכי כשרות / שבת / מדריך בעברית: ${form.notes || "__"}`,
          ].join("\n")
        : [
            "Hi WIRO 4x4, I'd like to check availability for a private tour.",
            `Dates: ${form.travelDates || "__"}`,
            `Group size: ${form.groupSize || "__"}`,
            `Pickup area / hotel: ${form.pickupArea || "__"}`,
            `Trip type: ${selectedInterest.en}`,
            `Kosher / Shabbat / Hebrew-guide needs: ${form.notes || "__"}`,
          ].join("\n"),
    [form, language, selectedInterest]
  );

  const handleInquiryInteraction = () => {
    if (inquiryStartedRef.current) return;
    inquiryStartedRef.current = true;
    trackEvent("inquiry_start", {
      page: "/",
      placement: "inquiry-form",
      language,
    });
  };

  const createLead = trpc.lead.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success(
        t(
          "Inquiry saved. WhatsApp is still the fastest way to confirm availability.",
          "הפנייה נשמרה. וואטסאפ עדיין הדרך המהירה ביותר לאישור זמינות."
        )
      );
    },
    onError: () => {
      toast.error(
        t(
          "Something went wrong. Please use WhatsApp for the fastest response.",
          "משהו השתבש. עדיף להשתמש בוואטסאפ לתגובה המהירה ביותר."
        )
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = t(
        "Add your name so we know who to reply to.",
        "הוסיפו שם כדי שנדע למי לחזור."
      );
    }
    if (!form.email.trim()) {
      newErrors.email = t(
        "Add an email for the backup reply. WhatsApp is faster.",
        "הוסיפו אימייל למענה גיבוי. וואטסאפ מהיר יותר."
      );
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t("Please enter a valid email", "יש להזין אימייל תקין");
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    createLead.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      source: "homepage_inquiry",
      interestedTours: selectedInterest.en,
      message: [
        form.travelDates && `Travel dates: ${form.travelDates}`,
        form.groupSize && `Group size: ${form.groupSize}`,
        form.pickupArea && `Pickup area: ${form.pickupArea}`,
        `Interest: ${selectedInterest.en}`,
        form.notes && `Notes: ${form.notes}`,
        "Preferred handoff: WhatsApp-first availability confirmation",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  };

  if (submitted) {
    return (
      <section ref={sectionRef} className="py-16 md:py-20 bg-background">
        <div className="container max-w-2xl">
          <Card className="border border-accent/30 bg-card p-8 text-center shadow-lg">
            <CheckCircle
              className="w-12 h-12 text-accent mx-auto mb-4"
              aria-hidden="true"
            />
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              {t("Trip Details Saved", "פרטי הטיול נשמרו")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t(
                "We received your backup inquiry. For fastest availability and price confirmation, send the same details on WhatsApp now.",
                "קיבלנו את פניית הגיבוי. לאישור זמינות ומחיר הכי מהיר, שלחו עכשיו את אותם הפרטים בוואטסאפ."
              )}
            </p>
            <TrackedWhatsAppLink
              sourceCode={
                language === "he" ? "HOME-INQUIRY-HE" : "HOME-INQUIRY-EN"
              }
              humanMessage={whatsappMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#25D366] px-6 py-3 font-bold text-white shadow-lg transition-colors hover:bg-[#20BA5A] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              {t("Confirm Faster on WhatsApp", "אישור מהיר יותר בוואטסאפ")}
            </TrackedWhatsAppLink>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section
      id="inquiry"
      ref={sectionRef}
      className="py-16 md:py-20 bg-background"
    >
      <div className="container max-w-5xl">
        <div className="text-center mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {t("Fastest booking path", "הדרך המהירה להזמנה")}
          </p>
          <h2 className="text-3xl md:text-4xl font-medium mb-3 text-foreground">
            {t(
              "Send Dates, Group Size, Pickup Area",
              "שלחו תאריכים, מספר מטיילים ואזור איסוף"
            )}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {t(
              "WhatsApp is the primary path. This short form is a backup if you also want an email record.",
              "וואטסאפ הוא הערוץ הראשי. הטופס הקצר הוא גיבוי אם תרצו גם תיעוד באימייל."
            )}
          </p>
          <GoldDivider />
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border border-accent/30 bg-primary p-6 text-primary-foreground shadow-lg">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-sm bg-[#25D366] text-white">
              <MessageCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-bold text-white">
              {t("Prefer WhatsApp?", "מעדיפים וואטסאפ?")}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              {t(
                "Open a prefilled message with the key details Mike needs: dates, group size, pickup area, route idea, and kosher or Shabbat needs.",
                "פתחו הודעה מוכנה עם הפרטים החשובים: תאריכים, מספר מטיילים, אזור איסוף, רעיון למסלול וצרכי כשרות או שבת."
              )}
            </p>
            <TrackedWhatsAppLink
              sourceCode={
                language === "he" ? "HOME-INQUIRY-HE" : "HOME-INQUIRY-EN"
              }
              humanMessage={whatsappMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-[#087f3a] px-5 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#066b31] focus:outline-none focus:ring-2 focus:ring-[#087f3a] focus:ring-offset-2 focus:ring-offset-primary"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {t("Check Availability on WhatsApp", "בדיקת זמינות בוואטסאפ")}
            </TrackedWhatsAppLink>
            <div className="mt-4 flex items-start gap-2 rounded-sm border border-white/15 bg-white/10 p-3 text-xs text-white/75">
              <Clock3
                className="mt-0.5 h-4 w-4 text-accent"
                aria-hidden="true"
              />
              <span>
                {t(
                  "Availability and price are confirmed personally after we see your route and group details.",
                  "זמינות ומחיר מאושרים אישית אחרי שנראה את פרטי המסלול והקבוצה."
                )}
              </span>
            </div>
          </Card>

          <Card className="border border-accent/30 bg-card p-6 shadow-lg md:p-8">
            <form
              onSubmit={handleSubmit}
              onFocusCapture={handleInquiryInteraction}
              onChangeCapture={handleInquiryInteraction}
              className="space-y-5"
              noValidate
            >
              <div className="grid grid-cols-1 gap-4 rounded-sm border border-accent/20 bg-accent/5 p-4 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="inquiry-dates"
                    className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                  >
                    {t("Travel Dates", "תאריכי טיול")}
                  </label>
                  <input
                    id="inquiry-dates"
                    type="text"
                    value={form.travelDates}
                    onChange={e =>
                      setForm(p => ({ ...p, travelDates: e.target.value }))
                    }
                    placeholder={t("e.g. March 15-20", "לדוגמה: 15-20 מרץ")}
                    className="w-full px-4 py-3 border border-border bg-input text-foreground placeholder:text-muted-foreground rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="inquiry-group-size"
                    className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                  >
                    {t("Group Size", "גודל קבוצה")}
                  </label>
                  <input
                    id="inquiry-group-size"
                    type="text"
                    value={form.groupSize}
                    onChange={e =>
                      setForm(p => ({ ...p, groupSize: e.target.value }))
                    }
                    placeholder={t("2 adults, 1 child", "2 מבוגרים, ילד 1")}
                    className="w-full px-4 py-3 border border-border bg-input text-foreground placeholder:text-muted-foreground rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="inquiry-pickup"
                    className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                  >
                    {t("Pickup Area", "אזור איסוף")}
                  </label>
                  <input
                    id="inquiry-pickup"
                    type="text"
                    value={form.pickupArea}
                    onChange={e =>
                      setForm(p => ({ ...p, pickupArea: e.target.value }))
                    }
                    placeholder={t(
                      "Hotel / Chiang Mai area",
                      "מלון / אזור בצ'יאנג מאי"
                    )}
                    className="w-full px-4 py-3 border border-border bg-input text-foreground placeholder:text-muted-foreground rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <span
                  className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                  id="interest-label"
                >
                  {t("Route idea", "רעיון למסלול")}
                </span>
                <div
                  className="grid grid-cols-2 md:grid-cols-4 gap-2"
                  role="group"
                  aria-labelledby="interest-label"
                >
                  {INTEREST_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setForm(p => ({ ...p, interest: option.value }))
                      }
                      className={`min-h-11 px-3 py-2.5 rounded-sm text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                        form.interest === option.value
                          ? "bg-accent text-accent-foreground border-accent"
                          : "border-border text-foreground hover:border-accent/50"
                      }`}
                    >
                      {t(option.en, option.he)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="inquiry-name"
                    className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                  >
                    {t("Name for backup reply", "שם למענה גיבוי")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="inquiry-name"
                    type="text"
                    aria-required="true"
                    aria-invalid={!!errors.name}
                    aria-describedby={
                      errors.name ? "inquiry-name-error" : undefined
                    }
                    value={form.name}
                    onChange={e => {
                      setForm(p => ({ ...p, name: e.target.value }));
                      setErrors(prev => {
                        const { name: _, ...rest } = prev;
                        return rest;
                      });
                    }}
                    placeholder={t("Your name", "השם שלכם")}
                    className={`w-full px-4 py-3 border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-input text-foreground placeholder:text-muted-foreground ${errors.name ? "border-red-500" : "border-border"}`}
                  />
                  {errors.name && (
                    <p
                      id="inquiry-name-error"
                      className="text-red-500 text-xs mt-1"
                      role="alert"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="inquiry-email"
                    className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                  >
                    {t("Email backup", "אימייל גיבוי")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="inquiry-email"
                    type="email"
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email ? "inquiry-email-error" : undefined
                    }
                    value={form.email}
                    onChange={e => {
                      setForm(p => ({ ...p, email: e.target.value }));
                      setErrors(prev => {
                        const { email: _, ...rest } = prev;
                        return rest;
                      });
                    }}
                    placeholder={t("your@email.com", "your@email.com")}
                    className={`w-full px-4 py-3 border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-input text-foreground placeholder:text-muted-foreground ${errors.email ? "border-red-500" : "border-border"}`}
                  />
                  {errors.email && (
                    <p
                      id="inquiry-email-error"
                      className="text-red-500 text-xs mt-1"
                      role="alert"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="inquiry-phone"
                    className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                  >
                    {t("Phone / WhatsApp", "טלפון / וואטסאפ")}
                  </label>
                  <input
                    id="inquiry-phone"
                    type="tel"
                    value={form.phone}
                    onChange={e =>
                      setForm(p => ({ ...p, phone: e.target.value }))
                    }
                    placeholder={t("+972...", "+972...")}
                    className="w-full px-4 py-3 border border-border bg-input text-foreground placeholder:text-muted-foreground rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="inquiry-notes"
                    className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                  >
                    {t(
                      "Kosher / Shabbat / guide needs",
                      "צרכי כשרות / שבת / מדריך"
                    )}
                  </label>
                  <input
                    id="inquiry-notes"
                    type="text"
                    value={form.notes}
                    onChange={e =>
                      setForm(p => ({ ...p, notes: e.target.value }))
                    }
                    placeholder={t("Optional notes", "הערות אופציונליות")}
                    className="w-full px-4 py-3 border border-border bg-input text-foreground placeholder:text-muted-foreground rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  variant="default"
                  type="submit"
                  className="w-full md:w-auto md:px-8 gap-2"
                  size="lg"
                  disabled={createLead.isPending}
                >
                  {createLead.isPending ? (
                    <span
                      className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      aria-hidden="true"
                    />
                  ) : (
                    <Send className="w-4 h-4" aria-hidden="true" />
                  )}
                  {createLead.isPending
                    ? t("Saving...", "...שומר")
                    : t("Save Backup Inquiry", "שמירת פניית גיבוי")}
                </Button>
                <TrackedWhatsAppLink
                  sourceCode={
                    language === "he" ? "HOME-INQUIRY-HE" : "HOME-INQUIRY-EN"
                  }
                  humanMessage={whatsappMessage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-[#25D366]/60 px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-[#25D366]/10 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
                >
                  <MessageCircle
                    className="h-4 w-4 text-[#25D366]"
                    aria-hidden="true"
                  />
                  {t("Open WhatsApp Instead", "פתיחה בוואטסאפ במקום")}
                </TrackedWhatsAppLink>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
}
