import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";
import { Breadcrumb } from "@/components/Breadcrumb";
import { OptimizedImage } from "@/components/OptimizedImage";
import { GoldDivider } from "@/components/GoldDivider";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import {
  WHATSAPP_NUMBER,
  WHATSAPP_URL,
  COMPANY_EMAIL,
  COMPANY_PHONE,
} from "@/const";

const SUBJECT_OPTIONS = [
  { value: "general", en: "General Inquiry", he: "פנייה כללית" },
  { value: "tour_booking", en: "Tour Booking", he: "הזמנת טיול" },
  { value: "custom_tour", en: "Custom Tour", he: "טיול מותאם אישית" },
  { value: "group_booking", en: "Group Booking", he: "הזמנה קבוצתית" },
  { value: "other", en: "Other", he: "אחר" },
];

export default function Contact() {
  const { t, language } = useLanguage();
  const isHebrew = language === "he";

  usePageMeta({
    title: t("Contact Us", "צרו קשר"),
    description: t(
      "Get in touch with WIRO 4x4 Kosher Off-Road Adventures in Chiang Mai, Thailand. Reach us by phone, email, or WhatsApp for tour bookings and inquiries.",
      "צרו קשר עם WIRO 4x4 הרפתקאות שטח כשרות בצ'יאנג מאי, תאילנד. פנו אלינו בטלפון, אימייל או וואטסאפ להזמנות טיולים ושאלות."
    ),
    canonicalPath: "/contact",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "WIRO 4x4 - Kosher Off-Road Adventures",
      description:
        "Kosher off-road tour operator in Chiang Mai, Northern Thailand. Hebrew-speaking guide, kosher food options, and customized 4x4 adventure tours.",
      url: "https://www.wiro4x4indochina.com",
      telephone: "+66929894495",
      email: "wiro.adventures@gmail.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Chiang Mai",
        addressCountry: "TH",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 18.7883,
        longitude: 98.9853,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "08:00",
        closes: "18:00",
      },
      priceRange: "$$",
      image:
        "https://www.wiro4x4indochina.com/images/optimized/wiro_with_colleague.jpg",
    },
  });

  const cardsRef = useScrollReveal<HTMLDivElement>({ stagger: 0.15 });
  const formRef = useScrollReveal<HTMLDivElement>();
  const mapRef = useScrollReveal<HTMLDivElement>();

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
  });

  const createLead = trpc.lead.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success(
        t(
          "Message sent! We'll get back to you within 24 hours.",
          "!ההודעה נשלחה! נחזור אליכם תוך 24 שעות"
        )
      );
    },
    onError: () => {
      toast.error(
        t(
          "Something went wrong. Please try again or contact us via WhatsApp.",
          "משהו השתבש. נסו שוב או צרו קשר בוואטסאפ."
        )
      );
    },
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = t("Name is required", "שם הוא שדה חובה");
    }
    if (!form.email.trim()) {
      newErrors.email = t("Email is required", "אימייל הוא שדה חובה");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t("Please enter a valid email", "יש להזין אימייל תקין");
    }
    if (!form.message.trim()) {
      newErrors.message = t("Message is required", "הודעה היא שדה חובה");
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const subjectLabel =
      SUBJECT_OPTIONS.find(o => o.value === form.subject)?.en || form.subject;

    createLead.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      source: "contact-page",
      message: `[${subjectLabel}] ${form.message}`,
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <Breadcrumb items={[{ label: t("Contact", "צרו קשר") }]} />
      <main id="main-content">
        {/* Hero Banner */}
        <section className="relative h-[50vh] min-h-[320px] max-h-[500px] mt-20 overflow-hidden">
          <OptimizedImage
            src="wiro_with_colleague"
            alt={t("WIRO 4x4 team in Chiang Mai", "צוות WIRO 4x4 בצ'יאנג מאי")}
            className="absolute inset-0 w-full h-full object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
            <Mail className="w-10 h-10 mb-3 opacity-90 drop-shadow-lg" />
            <h1 className="text-3xl md:text-5xl font-serif font-medium mb-3 drop-shadow-lg">
              {t("Contact Us", "צרו קשר")}
            </h1>
            <GoldDivider />
            <p className="text-lg md:text-xl opacity-95 max-w-2xl mx-auto drop-shadow-md">
              {t(
                "We'd love to hear from you - let's plan your perfect Chiang Mai adventure",
                "נשמח לשמוע מכם - בואו נתכנן את ההרפתקה המושלמת שלכם בצ'יאנג מאי"
              )}
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container max-w-5xl">
            <div
              ref={cardsRef}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Phone / WhatsApp Card */}
              <Card className="p-6 text-center border border-accent/30 rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-card">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {t("Phone / WhatsApp", "טלפון / וואטסאפ")}
                </h3>
                <a
                  href={`tel:+${WHATSAPP_NUMBER}`}
                  className="block text-muted-foreground hover:text-accent transition-colors mb-2"
                >
                  {COMPANY_PHONE}
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t("Chat on WhatsApp", "שלחו הודעה בוואטסאפ")}
                </a>
              </Card>

              {/* Email Card */}
              <Card className="p-6 text-center border border-accent/30 rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-card">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {t("Email", "אימייל")}
                </h3>
                <a
                  href={`mailto:${COMPANY_EMAIL}`}
                  className="block text-muted-foreground hover:text-accent transition-colors"
                >
                  {COMPANY_EMAIL}
                </a>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("We reply within 24 hours", "נחזור אליכם תוך 24 שעות")}
                </p>
              </Card>

              {/* Location Card */}
              <Card className="p-6 text-center border border-accent/30 rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-card">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {t("Location", "מיקום")}
                </h3>
                <p className="text-muted-foreground">
                  {t("Chiang Mai, Thailand", "צ'יאנג מאי, תאילנד")}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("Northern Thailand adventures", "הרפתקאות בצפון תאילנד")}
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Form + Map */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container max-w-6xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-3 text-foreground">
                {t("Send Us a Message", "שלחו לנו הודעה")}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t(
                  "Fill out the form below and we'll get back to you as soon as possible",
                  "מלאו את הטופס ונחזור אליכם בהקדם"
                )}
              </p>
              <GoldDivider />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Form */}
              <div ref={formRef}>
                {submitted ? (
                  <Card className="p-8 text-center border border-accent/30 rounded-2xl shadow-lg bg-card h-full flex flex-col items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-accent mb-4" />
                    <h3 className="text-2xl font-bold mb-2 text-foreground">
                      {t("Thank You!", "!תודה רבה")}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {t(
                        "We've received your message and will contact you within 24 hours.",
                        "קיבלנו את ההודעה שלכם וניצור קשר תוך 24 שעות."
                      )}
                    </p>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      {t(
                        "Or chat with us on WhatsApp",
                        "או שוחחו איתנו בוואטסאפ"
                      )}
                    </a>
                  </Card>
                ) : (
                  <Card className="p-6 md:p-8 border border-accent/30 rounded-2xl shadow-lg bg-card">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Name */}
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                        >
                          {t("Full Name", "שם מלא")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.name}
                          value={form.name}
                          onChange={e => handleChange("name", e.target.value)}
                          placeholder={t("Your name", "השם שלכם")}
                          className={`w-full px-4 py-2.5 border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-input text-foreground placeholder:text-muted-foreground ${errors.name ? "border-red-500" : "border-border"}`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1" role="alert">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                        >
                          {t("Email", "אימייל")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.email}
                          value={form.email}
                          onChange={e => handleChange("email", e.target.value)}
                          placeholder={t("your@email.com", "your@email.com")}
                          className={`w-full px-4 py-2.5 border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-input text-foreground placeholder:text-muted-foreground ${errors.email ? "border-red-500" : "border-border"}`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1" role="alert">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Phone (optional) */}
                      <div>
                        <label
                          htmlFor="contact-phone"
                          className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                        >
                          {t("Phone / WhatsApp", "טלפון / וואטסאפ")}
                        </label>
                        <input
                          id="contact-phone"
                          type="tel"
                          value={form.phone}
                          onChange={e => handleChange("phone", e.target.value)}
                          placeholder={t("+972...", "+972...")}
                          className="w-full px-4 py-2.5 border border-border bg-input text-foreground placeholder:text-muted-foreground rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        />
                      </div>

                      {/* Subject */}
                      <div>
                        <label
                          htmlFor="contact-subject"
                          className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                        >
                          {t("Subject", "נושא")}
                        </label>
                        <select
                          id="contact-subject"
                          value={form.subject}
                          onChange={e =>
                            handleChange("subject", e.target.value)
                          }
                          className="w-full px-4 py-2.5 border border-border bg-input text-foreground rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                        >
                          {SUBJECT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {isHebrew ? opt.he : opt.en}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Message */}
                      <div>
                        <label
                          htmlFor="contact-message"
                          className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
                        >
                          {t("Message", "הודעה")}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="contact-message"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.message}
                          rows={5}
                          value={form.message}
                          onChange={e =>
                            handleChange("message", e.target.value)
                          }
                          placeholder={t(
                            "Tell us about your trip plans, questions, or special requests...",
                            "ספרו לנו על תוכניות הטיול, שאלות או בקשות מיוחדות..."
                          )}
                          className={`w-full px-4 py-2.5 border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-input text-foreground placeholder:text-muted-foreground resize-vertical ${errors.message ? "border-red-500" : "border-border"}`}
                        />
                        {errors.message && (
                          <p className="text-red-500 text-xs mt-1" role="alert">
                            {errors.message}
                          </p>
                        )}
                      </div>

                      <Button
                        variant="default"
                        type="submit"
                        className="w-full md:w-auto md:px-8 gap-2"
                        size="lg"
                        disabled={createLead.isPending}
                      >
                        {createLead.isPending ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {createLead.isPending
                          ? t("Sending...", "...שולח")
                          : t("Send Message", "שלחו הודעה")}
                      </Button>
                    </form>
                  </Card>
                )}
              </div>

              {/* Google Maps Embed */}
              <div ref={mapRef} className="min-h-[400px] lg:min-h-0">
                <Card className="border border-accent/30 rounded-2xl shadow-lg overflow-hidden h-full bg-card">
                  <iframe
                    title={t(
                      "WIRO 4x4 location - Chiang Mai, Thailand",
                      "מיקום WIRO 4x4 - צ'יאנג מאי, תאילנד"
                    )}
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3776.5!2d98.9!3d18.79!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x73908a4e39b362f3!2sWiro%204x4%20Indochina%20Adventure%20Tours!5e0!3m2!1sen!2sth!4v1700000000000!5m2!1sen!2sth"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "400px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Operating Hours */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-medium mb-3 text-foreground">
              {t("Operating Hours", "שעות פעילות")}
            </h2>
            <GoldDivider />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto text-left">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("Sunday - Thursday", "ראשון - חמישי")}
                </p>
                <p className="text-muted-foreground">08:00 - 18:00</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("Friday", "שישי")}
                </p>
                <p className="text-muted-foreground">08:00 - 14:00</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("Saturday (Shabbat)", "שבת")}
                </p>
                <p className="text-muted-foreground">{t("Closed", "סגור")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("WhatsApp", "וואטסאפ")}
                </p>
                <p className="text-muted-foreground">
                  {t("Available 24/7", "זמין 24/7")}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              {t(
                "Tours operate daily. Office hours are for booking inquiries.",
                "הטיולים פועלים כל יום. שעות המשרד הן לפניות הזמנה."
              )}
            </p>
          </div>
        </section>
      </main>
      <FloatingActionButtons />
      <Footer />
    </div>
  );
}
