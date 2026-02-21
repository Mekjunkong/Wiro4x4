import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { X, CheckCircle } from "lucide-react";

const DISMISSED_KEY = "wiro_recently_booked_dismissed";

export function RecentlyBookedPopup() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const { data: bookings } = trpc.stats.recentBookings.useQuery(undefined, {
    staleTime: 10 * 60 * 1000,
  });

  const dismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {}
  }, []);

  // Check if already dismissed this session
  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISSED_KEY)) {
        setDismissed(true);
      }
    } catch {}
  }, []);

  // Show first popup after 5s delay
  useEffect(() => {
    if (dismissed || !bookings?.length) return;
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, [dismissed, bookings]);

  // Cycle through bookings every 8s
  useEffect(() => {
    if (dismissed || !bookings?.length || !visible) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % bookings.length);
        setVisible(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, [dismissed, bookings, visible]);

  if (dismissed || !bookings?.length) return null;
  const booking = bookings[currentIndex];
  if (!booking) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-[9990] max-w-xs bg-card border border-border rounded-lg shadow-lg p-3 transition-all duration-300 ${
        visible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
      }`}
    >
      <button
        onClick={dismiss}
        className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-start gap-2.5 pr-4">
        <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {booking.firstName}{" "}
            {t("just booked", "\u05D4\u05D6\u05DE\u05D9\u05DF/\u05D4")}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {booking.tourName}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            {booking.timeAgo}
          </p>
        </div>
      </div>
    </div>
  );
}
