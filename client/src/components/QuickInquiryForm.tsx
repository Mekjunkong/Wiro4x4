import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { WHATSAPP_URL } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Send, MessageCircle, CheckCircle } from "lucide-react";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const INTEREST_OPTIONS = [
  { value: "day_tour", en: "Day Tour", he: "טיול יום" },
  { value: "multi_day", en: "Multi-Day Package", he: "חבילה רב-יומית" },
  { value: "private", en: "Private Tour", he: "טיול פרטי" },
  { value: "custom", en: "Custom Experience", he: "חוויה מותאמת אישית" },
];

export function QuickInquiryForm() {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    travelDates: "",
    groupSize: "",
    interest: "day_tour",
  });

  const createLead = trpc.lead.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success(
        t(
          "Thank you! We'll contact you within 24 hours.",
          "!תודה! ניצור קשר תוך 24 שעות"
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
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const interestLabel =
      INTEREST_OPTIONS.find(o => o.value === form.interest)?.en ||
      form.interest;

    createLead.mutate({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      source: "homepage_inquiry",
      interestedTours: interestLabel,
      message: [
        form.travelDates && `Travel dates: ${form.travelDates}`,
        form.groupSize && `Group size: ${form.groupSize}`,
        `Interest: ${interestLabel}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  };

  if (submitted) {
    return (
      <section ref={sectionRef} className="py-24 md:py-32 bg-[#0F0F0F]">
        <div className="container max-w-2xl">
          <Card className="p-8 text-center border border-[#D4AF37]/30 rounded-sm bg-[#1C1C1C]">
            <CheckCircle className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2 text-white">
              {t("Thank You!", "!תודה רבה")}
            </h3>
            <p className="text-[#9B9590] mb-6">
              {t(
                "We've received your inquiry and will contact you within 24 hours.",
                "קיבלנו את הפנייה שלכם וניצור קשר תוך 24 שעות."
              )}
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#D4AF37] hover:underline"
            >
              <MessageCircle className="w-4 h-4" />
              {t(
                "Or message us on WhatsApp for faster response",
                "או שלחו הודעה בוואטסאפ לתגובה מהירה יותר"
              )}
            </a>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section
      id="inquiry"
      ref={sectionRef}
      className="py-24 md:py-32 bg-[#0F0F0F]"
    >
      <div className="container max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-medium mb-3 text-white">
            {t("Get a Free Quote", "קבלו הצעת מחיר חינם")}
          </h2>
          <p className="text-[#9B9590]">
            {t(
              "Tell us about your dream adventure and we'll get back to you within 24 hours",
              "ספרו לנו על ההרפתקה שאתם חולמים עליה ונחזור אליכם תוך 24 שעות"
            )}
          </p>
          <GoldDivider />
        </div>

        <Card className="p-6 md:p-8 border border-[#D4AF37]/30 rounded-sm bg-[#1C1C1C]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium tracking-[0.15em] uppercase text-[#9B9590] mb-1.5">
                  {t("Full Name", "שם מלא")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  value={form.name}
                  onChange={e => {
                    setForm(p => ({ ...p, name: e.target.value }));
                    setErrors(prev => {
                      const { name: _, ...rest } = prev;
                      return rest;
                    });
                  }}
                  placeholder={t("Your name", "השם שלכם")}
                  className={`w-full px-4 py-2.5 border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] bg-[#141414] text-white placeholder:text-[#6B6560] ${errors.name ? "border-red-500" : "border-[#2A2A25]"}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium tracking-[0.15em] uppercase text-[#9B9590] mb-1.5">
                  {t("Email", "אימייל")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  value={form.email}
                  onChange={e => {
                    setForm(p => ({ ...p, email: e.target.value }));
                    setErrors(prev => {
                      const { email: _, ...rest } = prev;
                      return rest;
                    });
                  }}
                  placeholder={t("your@email.com", "your@email.com")}
                  className={`w-full px-4 py-2.5 border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] bg-[#141414] text-white placeholder:text-[#6B6560] ${errors.email ? "border-red-500" : "border-[#2A2A25]"}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium tracking-[0.15em] uppercase text-[#9B9590] mb-1.5">
                  {t("Phone / WhatsApp", "טלפון / וואטסאפ")}
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e =>
                    setForm(p => ({ ...p, phone: e.target.value }))
                  }
                  placeholder={t("+972...", "+972...")}
                  className="w-full px-4 py-2.5 border border-[#2A2A25] bg-[#141414] text-white placeholder:text-[#6B6560] rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium tracking-[0.15em] uppercase text-[#9B9590] mb-1.5">
                  {t("Travel Dates", "תאריכי טיול")}
                </label>
                <input
                  type="text"
                  value={form.travelDates}
                  onChange={e =>
                    setForm(p => ({ ...p, travelDates: e.target.value }))
                  }
                  placeholder={t("e.g. March 15-20", "לדוגמה: 15-20 מרץ")}
                  className="w-full px-4 py-2.5 border border-[#2A2A25] bg-[#141414] text-white placeholder:text-[#6B6560] rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium tracking-[0.15em] uppercase text-[#9B9590] mb-1.5">
                  {t("Group Size", "גודל קבוצה")}
                </label>
                <input
                  type="text"
                  value={form.groupSize}
                  onChange={e =>
                    setForm(p => ({ ...p, groupSize: e.target.value }))
                  }
                  placeholder={t("e.g. 2 adults, 1 child", "2 מבוגרים, ילד 1")}
                  className="w-full px-4 py-2.5 border border-[#2A2A25] bg-[#141414] text-white placeholder:text-[#6B6560] rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium tracking-[0.15em] uppercase text-[#9B9590] mb-1.5">
                {t("What interests you?", "?מה מעניין אתכם")}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {INTEREST_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setForm(p => ({ ...p, interest: option.value }))
                    }
                    className={`px-3 py-2.5 rounded-sm text-sm border transition-colors ${
                      form.interest === option.value
                        ? "bg-[#D4AF37] text-[#1C1C1C] border-[#D4AF37]"
                        : "border-[#2A2A25] text-[#9B9590] hover:border-[#D4AF37]/50"
                    }`}
                  >
                    {t(option.en, option.he)}
                  </button>
                ))}
              </div>
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
                : t("Get My Free Quote", "קבלו הצעת מחיר")}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
