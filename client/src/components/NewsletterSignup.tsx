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
    <div className="mt-6 pt-6 border-t border-accent/20">
      <h4 className="text-lg font-semibold text-accent-readable mb-3">
        {t("Stay Updated", "הישארו מעודכנים")}
      </h4>
      <p className="text-sm text-muted-foreground mb-3">
        {t(
          "Get the latest tour updates and special offers",
          "קבלו עדכונים על טיולים ומבצעים"
        )}
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="newsletter-email" className="sr-only">
            {t("Email address for newsletter", "כתובת אימייל לניוזלטר")}
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t("Your email", "המייל שלכם")}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
        </div>
        <button
          type="submit"
          disabled={subscribe.isPending}
          className="bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {subscribe.isPending ? "..." : t("Subscribe", "הרשמה")}
        </button>
      </form>
    </div>
  );
}
