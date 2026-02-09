import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { XCircle } from "lucide-react";

export default function BookingCancel() {
  const { t } = useLanguage();
  usePageMeta(
    "Payment Cancelled",
    "Your payment was cancelled. You can try again or contact us for help."
  );

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-lg">
          <div className="text-center py-12">
            <XCircle className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">
              {t("Payment Cancelled", "התשלום בוטל")}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t(
                "Your payment was not completed. No charges were made. You can try again or reach out to us for help.",
                "התשלום שלך לא הושלם. לא בוצע חיוב. אתה יכול לנסות שוב או ליצור איתנו קשר."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/book"
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
              >
                {t("Try Again", "נסה שוב")}
              </a>
              <a
                href="https://wa.me/66819611398"
                className="inline-block border border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/5 transition"
              >
                {t("Contact Us on WhatsApp", "צור קשר בווטסאפ")}
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
