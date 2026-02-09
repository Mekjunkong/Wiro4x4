import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function TermsOfService() {
  const { language, t } = useLanguage();
  const isHebrew = language === "he";
  usePageMeta(
    "Terms of Service",
    "WIRO 4x4 Terms of Service - booking terms, cancellation policy, liability, and payment terms for our kosher off-road tours in Chiang Mai."
  );

  return (
    <div
      className={`min-h-screen ${isHebrew ? "rtl" : "ltr"}`}
      dir={isHebrew ? "rtl" : "ltr"}
    >
      <Header />
      <main id="main-content" className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-2">
            {t("Terms of Service", "תנאי שירות")}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {t("Last updated: February 2026", "עדכון אחרון: פברואר 2026")}
          </p>

          <div className="prose prose-sm max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  "Welcome to WIRO 4x4. By booking a tour or using our services, you agree to the following terms and conditions. Please read them carefully before making a reservation.",
                  "ברוכים הבאים ל-WIRO 4x4. בהזמנת סיור או שימוש בשירותינו, אתם מסכימים לתנאים וההגבלות הבאים. אנא קראו אותם בעיון לפני ביצוע הזמנה."
                )}
              </p>
            </section>

            {/* Booking Terms */}
            <section>
              <h2 className="text-xl font-serif font-bold text-foreground mb-3">
                {t("1. Booking Terms", "1. תנאי הזמנה")}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  {t(
                    "All bookings are subject to availability and confirmation by WIRO 4x4.",
                    "כל ההזמנות כפופות לזמינות ולאישור על ידי WIRO 4x4."
                  )}
                </li>
                <li>
                  {t(
                    "A booking is confirmed only after you receive a written confirmation via email or WhatsApp.",
                    "הזמנה מאושרת רק לאחר קבלת אישור בכתב באימייל או בוואטסאפ."
                  )}
                </li>
                <li>
                  {t(
                    "Tour dates must be at least 24 hours in advance.",
                    "תאריכי סיור חייבים להיות לפחות 24 שעות מראש."
                  )}
                </li>
                <li>
                  {t(
                    "Group sizes and tour details are subject to the information provided during booking.",
                    "גודל הקבוצה ופרטי הסיור כפופים למידע שנמסר בעת ההזמנה."
                  )}
                </li>
                <li>
                  {t(
                    "WIRO 4x4 reserves the right to modify tour itineraries due to weather, road conditions, or safety concerns.",
                    "WIRO 4x4 שומרת לעצמה את הזכות לשנות מסלולי סיור בשל מזג אוויר, תנאי כביש או שיקולי בטיחות."
                  )}
                </li>
              </ul>
            </section>

            {/* Cancellation Policy */}
            <section>
              <h2 className="text-xl font-serif font-bold text-foreground mb-3">
                {t(
                  "2. Cancellation & Refund Policy",
                  "2. מדיניות ביטול והחזרים"
                )}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  {t(
                    "Cancellations made 48+ hours before the tour: full refund.",
                    "ביטולים שנעשו 48+ שעות לפני הסיור: החזר מלא."
                  )}
                </li>
                <li>
                  {t(
                    "Cancellations made 24-48 hours before the tour: 50% refund.",
                    "ביטולים שנעשו 24-48 שעות לפני הסיור: החזר של 50%."
                  )}
                </li>
                <li>
                  {t(
                    "Cancellations made less than 24 hours before the tour: no refund.",
                    "ביטולים שנעשו פחות מ-24 שעות לפני הסיור: ללא החזר."
                  )}
                </li>
                <li>
                  {t(
                    "No-shows are non-refundable.",
                    "אי-הגעה אינה זכאית להחזר."
                  )}
                </li>
                <li>
                  {t(
                    "If WIRO 4x4 cancels a tour due to unforeseen circumstances, a full refund or rescheduling will be offered.",
                    "אם WIRO 4x4 מבטלת סיור בשל נסיבות בלתי צפויות, יוצע החזר מלא או תיאום מחדש."
                  )}
                </li>
              </ul>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 className="text-xl font-serif font-bold text-foreground mb-3">
                {t("3. Payment Terms", "3. תנאי תשלום")}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  {t(
                    "Payments are processed securely via Stripe or other approved payment methods.",
                    "תשלומים מעובדים בצורה מאובטחת דרך Stripe או אמצעי תשלום מאושרים אחרים."
                  )}
                </li>
                <li>
                  {t(
                    "A deposit may be required to confirm your booking. The remaining balance is due before or on the tour date.",
                    "ייתכן שיידרש פיקדון לאישור ההזמנה. היתרה משולמת לפני או בתאריך הסיור."
                  )}
                </li>
                <li>
                  {t(
                    "All prices are listed in Thai Baht (THB) unless otherwise stated.",
                    "כל המחירים מוצגים בבאט תאילנדי (THB) אלא אם צוין אחרת."
                  )}
                </li>
                <li>
                  {t(
                    "Prices are subject to change without notice, but confirmed bookings will honor the quoted price.",
                    "המחירים עשויים להשתנות ללא הודעה מוקדמת, אך הזמנות מאושרות יכבדו את המחיר שצוטט."
                  )}
                </li>
              </ul>
            </section>

            {/* Liability */}
            <section>
              <h2 className="text-xl font-serif font-bold text-foreground mb-3">
                {t("4. Liability Limitations", "4. הגבלת אחריות")}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  {t(
                    "Participants join tours at their own risk. Off-road activities involve inherent risks.",
                    "המשתתפים מצטרפים לסיורים על אחריותם. פעילויות שטח כרוכות בסיכונים מובנים."
                  )}
                </li>
                <li>
                  {t(
                    "WIRO 4x4 is not liable for personal injury, loss, or damage except where caused by our negligence.",
                    "WIRO 4x4 אינה אחראית לפציעה אישית, אובדן או נזק אלא אם נגרמו ברשלנותנו."
                  )}
                </li>
                <li>
                  {t(
                    "Participants must follow all safety instructions provided by guides and drivers.",
                    "על המשתתפים לפעול לפי כל הוראות הבטיחות שניתנות על ידי המדריכים והנהגים."
                  )}
                </li>
                <li>
                  {t(
                    "Travel insurance is strongly recommended for all participants.",
                    "ביטוח נסיעות מומלץ מאוד לכל המשתתפים."
                  )}
                </li>
                <li>
                  {t(
                    "WIRO 4x4 is not responsible for delays or cancellations caused by force majeure events.",
                    "WIRO 4x4 אינה אחראית לעיכובים או ביטולים שנגרמו על ידי אירועי כוח עליון."
                  )}
                </li>
              </ul>
            </section>

            {/* Data Usage */}
            <section>
              <h2 className="text-xl font-serif font-bold text-foreground mb-3">
                {t("5. Data Usage & Privacy", "5. שימוש בנתונים ופרטיות")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  "Your personal information is collected and processed in accordance with our Privacy Policy. By using our services, you consent to data collection as described in our Privacy Policy.",
                  "המידע האישי שלכם נאסף ומעובד בהתאם למדיניות הפרטיות שלנו. בשימוש בשירותינו, אתם מסכימים לאיסוף נתונים כמתואר במדיניות הפרטיות שלנו."
                )}
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                <a href="/privacy" className="text-primary hover:underline">
                  {t("Read our Privacy Policy", "קראו את מדיניות הפרטיות שלנו")}
                </a>
              </p>
            </section>

            {/* Kosher Services */}
            <section>
              <h2 className="text-xl font-serif font-bold text-foreground mb-3">
                {t("6. Kosher Services", "6. שירותי כשרות")}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  {t(
                    "Kosher meals are provided as described in the tour package. Specific dietary requirements should be communicated at booking.",
                    "ארוחות כשרות מסופקות כמתואר בחבילת הסיור. דרישות תזונתיות ספציפיות יש למסור בעת ההזמנה."
                  )}
                </li>
                <li>
                  {t(
                    "Shabbat-friendly scheduling is available upon request and subject to accommodation availability.",
                    "תזמון ידידותי לשבת זמין לפי בקשה ובכפוף לזמינות לינה."
                  )}
                </li>
              </ul>
            </section>

            {/* Contact */}
            <section className="bg-muted rounded-xl p-6">
              <h2 className="text-xl font-serif font-bold text-foreground mb-3">
                {t("Questions?", "שאלות?")}
              </h2>
              <p className="text-muted-foreground mb-2">
                {t(
                  "If you have any questions about these terms, please contact us:",
                  "אם יש לכם שאלות לגבי תנאים אלה, אנא צרו קשר:"
                )}
              </p>
              <ul className="space-y-1 text-muted-foreground text-sm">
                <li>
                  {t("Email:", "אימייל:")}{" "}
                  <a
                    href="mailto:wiro.adventures@gmail.com"
                    className="text-primary hover:underline"
                  >
                    wiro.adventures@gmail.com
                  </a>
                </li>
                <li>
                  {t("WhatsApp:", "וואטסאפ:")}{" "}
                  <a
                    href="https://wa.me/66929894495"
                    className="text-primary hover:underline"
                  >
                    +66 92 989 4495
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
