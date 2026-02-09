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
    <div className="mt-6 pt-6 border-t border-background/20">
      <h4 className="text-lg font-semibold text-secondary mb-3">
        {t("Stay Updated", "הישארו מעודכנים")}
      </h4>
      <p className="text-sm text-background/70 mb-3">
        {t(
          "Get the latest tour updates and special offers",
          "קבלו עדכונים על טיולים ומבצעים"
        )}
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-background/50" />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t("Your email", "המייל שלכם")}
            className="w-full pl-10 pr-4 py-2 bg-background/10 border border-background/20 rounded-lg text-background placeholder:text-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        <button
          type="submit"
          disabled={subscribe.isPending}
          className="bg-secondary hover:bg-secondary/90 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {subscribe.isPending ? "..." : t("Subscribe", "הרשמה")}
        </button>
      </form>
    </div>
  );
}
