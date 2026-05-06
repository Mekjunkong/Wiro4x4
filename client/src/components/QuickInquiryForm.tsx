import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { COMPANY_WHATSAPP_URL } from "@/const";
import { Button } from "@/components/ui/button";
import { GoldDivider } from "@/components/GoldDivider";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { MessageCircle } from "lucide-react";

export function QuickInquiryForm() {
  const { t, language } = useLanguage();
  const sectionRef = useScrollReveal<HTMLElement>();
  const [form, setForm] = useState({
    name: "",
    travelDates: "",
    groupSize: "",
  });
  const [nameError, setNameError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();

    if (!name) {
      setNameError(t("Please add your name", "נא למלא שם"));
      return;
    }
    setNameError("");

    const isHe = language === "he";
    const lines = [
      isHe
        ? `שלום, אני ${name}. אשמח להצעת מחיר לטיול שטח.`
        : `Hi, I'm ${name}. I'd like a quote for a 4x4 tour.`,
      form.travelDates &&
        (isHe ? `מתי: ${form.travelDates}` : `When: ${form.travelDates}`),
      form.groupSize &&
        (isHe ? `כמה אורחים: ${form.groupSize}` : `Guests: ${form.groupSize}`),
      isHe
        ? "תודה — מחכים לדבר איתכם."
        : "Thanks — looking forward to speaking with you.",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(
      `${COMPANY_WHATSAPP_URL}?text=${encodeURIComponent(lines)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section
      id="inquiry"
      ref={sectionRef}
      className="py-16 md:py-20 bg-background"
    >
      <div className="container max-w-2xl">
        <div className="text-center mb-8">
          <span className="text-accent text-xs font-bold tracking-[0.3em] uppercase block mb-3">
            {t("QUICK QUOTE", "הצעת מחיר מהירה")}
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-medium text-foreground">
            {t("Get a Tailored Quote", "קבלו הצעה מותאמת")}
          </h2>
          <GoldDivider />
          <p className="text-muted-foreground -mt-2">
            {t(
              "Just a few details — we'll continue on WhatsApp.",
              "כמה פרטים קצרים — ונמשיך בוואטסאפ."
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="inquiry-name"
              className="block text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1.5"
            >
              {t("Name", "שם")} <span className="text-red-500">*</span>
            </label>
            <input
              id="inquiry-name"
              type="text"
              required
              aria-required="true"
              aria-invalid={!!nameError}
              value={form.name}
              onChange={e => {
                setForm(p => ({ ...p, name: e.target.value }));
                setNameError("");
              }}
              placeholder={t("e.g. David Cohen", "לדוגמה: דוד כהן")}
              className={`w-full px-4 py-2.5 border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-input text-foreground placeholder:text-muted-foreground ${nameError ? "border-red-500" : "border-border"}`}
            />
            {nameError && (
              <p className="text-red-500 text-xs mt-1" role="alert">
                {nameError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder={t("e.g. March 15–20", "לדוגמה: 15–20 מרץ")}
                className="w-full px-4 py-2.5 border border-border bg-input text-foreground placeholder:text-muted-foreground rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
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
                placeholder={t("e.g. 4 adults, 2 kids", "4 מבוגרים, 2 ילדים")}
                className="w-full px-4 py-2.5 border border-border bg-input text-foreground placeholder:text-muted-foreground rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>
          </div>

          <Button
            variant="secondary"
            type="submit"
            className="w-full gap-2 mt-2"
            size="lg"
          >
            <MessageCircle className="w-4 h-4" />
            {t("Get My WhatsApp Quote", "קבלו הצעת וואטסאפ")}
          </Button>
        </form>
      </div>
    </section>
  );
}
