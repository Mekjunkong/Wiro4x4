import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";
import { trackEvent } from "@/lib/analytics";

export default function BookingSuccess() {
  const { t, language } = useLanguage();
  usePageMeta(
    "Payment Confirmed",
    "Your payment has been confirmed. Thank you for booking with WIRO 4x4."
  );

  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionId(params.get("session_id"));
  }, []);

  const { data, isLoading, isError, error } =
    trpc.payment.verifySession.useQuery(
      { sessionId: sessionId! },
      { enabled: !!sessionId, retry: 2 }
    );
  const completionTrackedRef = useRef(false);

  useEffect(() => {
    if (!data?.success || completionTrackedRef.current) return;
    completionTrackedRef.current = true;
    trackEvent("booking_complete", {
      page: "/booking/success",
      placement: "payment-confirmation",
      language,
    });
  }, [data?.success, language]);

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-lg">
          {!sessionId ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-medium mb-2">
                {t("Invalid Session", "שגיאה בתהליך")}
              </h1>
              <p className="text-muted-foreground">
                {t(
                  "No payment session found. Please try again or contact us.",
                  "לא נמצא תהליך תשלום. נסו שוב או צרו איתנו קשר."
                )}
              </p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-medium mb-2">
                {t("Verifying Payment...", "מאמתים תשלום...")}
              </h1>
              <p className="text-muted-foreground">
                {t(
                  "Please wait while we confirm your payment.",
                  "רגע, מוודאים שהתשלום עבר."
                )}
              </p>
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-medium mb-2">
                {t("Verification Failed", "האימות נכשל")}
              </h1>
              <p className="text-muted-foreground mb-6">
                {error?.message ||
                  t(
                    "We could not verify your payment. Please contact us.",
                    "לא הצלחנו לאמת את התשלום. צרו איתנו קשר."
                  )}
              </p>
              <TrackedWhatsAppLink
                sourceCode={
                  language === "he"
                    ? "BOOKING-SUCCESS-HE"
                    : "BOOKING-SUCCESS-EN"
                }
                humanMessage=""
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
              >
                {t("Contact Us on WhatsApp", "צרו קשר בוואטסאפ")}
              </TrackedWhatsAppLink>
            </div>
          ) : data?.success ? (
            <div className="text-center py-12">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
              <h1 className="text-3xl font-medium mb-2 text-green-700">
                {t("Payment Successful!", "התשלום בוצע בהצלחה!")}
              </h1>
              {data.amountPaid && (
                <p className="text-2xl font-semibold text-foreground mb-2">
                  {data.amountPaid.toLocaleString()} THB
                </p>
              )}
              {data.bookingId && (
                <p className="text-muted-foreground mb-6">
                  {t("Booking Reference:", "מספר הזמנה:")}{" "}
                  <span className="font-mono font-semibold">
                    #{data.bookingId}
                  </span>
                </p>
              )}
              <div className="bg-muted rounded-lg p-6 text-left mb-6">
                <h2 className="font-semibold mb-3">
                  {t("What happens next?", "מה קורה עכשיו?")}
                </h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    {t(
                      "A confirmation email has been sent to your email address",
                      "מייל אישור נשלח אליכם"
                    )}
                  </li>
                  <li>
                    {t(
                      "Our team will finalize your booking details",
                      "הצוות שלנו יחזור אליכם לסגור פרטים"
                    )}
                  </li>
                  <li>
                    {t(
                      "You will receive a reminder 48 hours before your tour",
                      "תקבלו תזכורת 48 שעות לפני הטיול"
                    )}
                  </li>
                </ul>
              </div>
              <a
                href="/"
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
              >
                {t("Back to Home", "חזרה לדף הבית")}
              </a>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-medium mb-2">
                {t("Payment Pending", "תשלום בהמתנה")}
              </h1>
              <p className="text-muted-foreground mb-6">
                {t(
                  "Your payment is still being processed. Please check back shortly.",
                  "התשלום שלכם עדיין בתהליך. בדקו שוב בעוד כמה דקות."
                )}
              </p>
              <TrackedWhatsAppLink
                sourceCode={
                  language === "he"
                    ? "BOOKING-SUCCESS-HE"
                    : "BOOKING-SUCCESS-EN"
                }
                humanMessage=""
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
              >
                {t("Contact Us on WhatsApp", "צרו קשר בוואטסאפ")}
              </TrackedWhatsAppLink>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
