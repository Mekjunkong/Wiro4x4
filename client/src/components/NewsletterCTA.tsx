import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function NewsletterCTA() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success(t("Subscribed successfully!", "נרשמת בהצלחה!"));
      setEmail("");
    },
    onError: err => {
      toast.error(err.message || t("Something went wrong", "משהו השתבש"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribeMutation.mutate({ email: email.trim(), language });
  };

  return (
    <section className="py-16 bg-[#1c1c1c] dark:bg-[#0a0a0a]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-3xl text-center">
        <Mail className="w-10 h-10 text-[#d4af37] mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
          {t(
            "Get Exclusive Tour Deals & Travel Tips",
            "קבלו מבצעים בלעדיים וטיפים לטיולים"
          )}
        </h2>
        <p className="text-white/60 mb-8 max-w-lg mx-auto">
          {t(
            "Join our newsletter for seasonal offers, new routes, and insider tips for traveling in Northern Thailand.",
            "הצטרפו לניוזלטר שלנו למבצעים עונתיים, מסלולים חדשים וטיפים פנימיים לטיול בצפון תאילנד."
          )}
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t("Your email address", "כתובת האימייל שלך")}
            required
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={subscribeMutation.isPending}
            className="bg-[#d4af37] hover:bg-[#c5a033] text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {subscribeMutation.isPending
              ? t("Subscribing...", "נרשם...")
              : t("Subscribe", "הרשמה")}
          </button>
        </form>
      </div>
    </section>
  );
}
