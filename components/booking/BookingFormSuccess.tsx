import { Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type BookingFormSuccessProps = {
  isHebrew: boolean;
  t: (en: string, he: string) => string;
  bookingRef: string;
};

export function BookingFormSuccess({
  isHebrew,
  t,
  bookingRef,
}: BookingFormSuccessProps) {
  return (
    <div
      className={`min-h-screen ${isHebrew ? "rtl" : "ltr"}`}
      dir={isHebrew ? "rtl" : "ltr"}
    >
      <Header />
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <div className="text-center p-8 max-w-md">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-primary mb-4">
            {t("Booking Submitted Successfully!", "ההזמנה נקלטה בהצלחה!")}
          </h2>
          {bookingRef && (
            <p className="text-lg font-mono font-semibold text-primary/80 mb-3">
              {t("Booking Reference:", "מספר הזמנה:")} {bookingRef}
            </p>
          )}
          <p className="text-muted-foreground mb-6">
            {t(
              "Thank you for your inquiry! A representative will contact you soon. A message was also sent to WhatsApp.",
              "תודה רבה! ניצור איתכם קשר בהקדם. הודעה נשלחה גם בוואטסאפ."
            )}
          </p>
          <a
            href="/"
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
          >
            {isHebrew ? "חזרה לדף הבית" : "Back to Home"}
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
