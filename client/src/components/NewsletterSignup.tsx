import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export function NewsletterSignup() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: data => {
      toast.success(data.message);
      setEmail("");
    },
    onError: error => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribe.mutate({ email, language });
  };

  return (
    <div className="mt-6 pt-6 border-t border-[#D4AF37]/20">
      <h4 className="text-lg font-semibold text-[#D4AF37] mb-3">
        {t("Stay Updated", "הישארו מעודכנים")}
      </h4>
      <p className="text-sm text-white/70 mb-3">
        {t(
          "Get the latest tour updates and special offers",
          "קבלו עדכונים על טיולים ומבצעים"
        )}
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t("Your email", "המייל שלכם")}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            required
          />
        </div>
        <button
          type="submit"
          disabled={subscribe.isPending}
          className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#1C1C1C] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {subscribe.isPending ? "..." : t("Subscribe", "הרשמה")}
        </button>
      </form>
    </div>
  );
}
