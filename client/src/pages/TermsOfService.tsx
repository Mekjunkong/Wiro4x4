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
            {t("Terms of Service", "תנאי שימוש ושירות")}
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
                  "ברוכים הבאים ל-WIRO 4x4. עצם ביצוע הזמנה או שימוש בשירותינו מהווה הסכמה לתנאים המפורטים להלן. אנא קראו אותם בעיון לפני ביצוע הזמנה."
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
                    "כל ההזמנות כפופות לזמינות ולאישור מצד WIRO 4x4."
                  )}
                </li>
                <li>
                  {t(
                    "A booking is confirmed only after you receive a written confirmation via email or WhatsApp.",
                    'הזמנה תיחשב מאושרת רק לאחר קבלת אישור בכתב בדוא"ל או בוואטסאפ.'
                  )}
                </li>
                <li>
                  {t(
                    "Tour dates must be at least 24 hours in advance.",
                    "יש לבצע הזמנה לפחות 24 שעות לפני מועד הטיול."
                  )}
                </li>
                <li>
                  {t(
                    "Group sizes and tour details are subject to the information provided during booking.",
                    "גודל הקבוצה ופרטי הטיול ייקבעו בהתאם לפרטים שנמסרו בעת ההזמנה."
                  )}
                </li>
                <li>
                  {t(
                    "WIRO 4x4 reserves the right to modify tour itineraries due to weather, road conditions, or safety concerns.",
                    "WIRO 4x4 שומרת לעצמה את הזכות לשנות מסלולי טיול בשל תנאי מזג אוויר, מצב הדרכים או שיקולי בטיחות."
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
                    "ביטול 48 שעות או יותר לפני הטיול: החזר מלא."
                  )}
                </li>
                <li>
                  {t(
                    "Cancellations made 24-48 hours before the tour: 50% refund.",
                    "ביטול 24-48 שעות לפני הטיול: החזר של 50%."
                  )}
                </li>
                <li>
                  {t(
                    "Cancellations made less than 24 hours before the tour: no refund.",
                    "ביטול פחות מ-24 שעות לפני הטיול: ללא החזר."
                  )}
                </li>
                <li>
                  {t(
                    "No-shows are non-refundable.",
                    "אי-הגעה ללא הודעה מראש לא תזכה בהחזר כספי."
                  )}
                </li>
                <li>
                  {t(
                    "If WIRO 4x4 cancels a tour due to unforeseen circumstances, a full refund or rescheduling will be offered.",
                    "במקרה שהטיול יבוטל ביוזמת WIRO 4x4 עקב נסיבות בלתי צפויות, יוצע החזר כספי מלא או מועד חלופי, לפי בחירת הלקוח."
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
                    "התשלומים מתבצעים באופן מאובטח באמצעות Stripe או אמצעי תשלום מאושרים נוספים."
                  )}
                </li>
                <li>
                  {t(
                    "A deposit may be required to confirm your booking. The remaining balance is due before or on the tour date.",
                    "ייתכן שתידרש מקדמה לאישור ההזמנה. יתרת התשלום תשולם לפני הטיול או ביום הטיול עצמו."
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
                    "המחירים עשויים להשתנות ללא הודעה מוקדמת, אולם הזמנה שאושרה תכובד במחיר שנקבע בעת האישור."
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
                    "ההשתתפות בטיולים היא על אחריות המשתתפים בלבד. פעילויות שטח כרוכות בסיכונים טבעיים הכרוכים באופי הפעילות."
                  )}
                </li>
                <li>
                  {t(
                    "WIRO 4x4 is not liable for personal injury, loss, or damage except where caused by our negligence.",
                    "WIRO 4x4 לא תישא באחריות לפציעה גופנית, אובדן רכוש או נזק, למעט במקרים שנגרמו עקב רשלנות מצדנו."
                  )}
                </li>
                <li>
                  {t(
                    "Participants must follow all safety instructions provided by guides and drivers.",
                    "על המשתתפים לפעול בהתאם להנחיות הבטיחות של המדריכים והנהגים בכל עת."
                  )}
                </li>
                <li>
                  {t(
                    "Travel insurance is strongly recommended for all participants.",
                    'מומלץ מאוד לרכוש ביטוח נסיעות לחו"ל הכולל כיסוי לפעילויות אתגריות.'
                  )}
                </li>
                <li>
                  {t(
                    "WIRO 4x4 is not responsible for delays or cancellations caused by force majeure events.",
                    "WIRO 4x4 לא תישא באחריות לעיכובים או ביטולים הנובעים מנסיבות של כוח עליון (אסונות טבע, מגפות, אירועים ביטחוניים וכד')."
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
                  "המידע האישי שלכם נאסף ומעובד בהתאם למדיניות הפרטיות שלנו. השימוש בשירותינו מהווה הסכמה לאיסוף ולעיבוד המידע כמפורט במדיניות הפרטיות."
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
                    "ארוחות כשרות מסופקות בהתאם לפירוט בחבילת הטיול. דרישות תזונתיות מיוחדות יש לציין בעת ביצוע ההזמנה."
                  )}
                </li>
                <li>
                  {t(
                    "Shabbat-friendly scheduling is available upon request and subject to accommodation availability.",
                    "ניתן לבקש התאמת לוח זמנים לשומרי שבת, בכפוף לזמינות מקומות לינה."
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
                  "יש לכם שאלות לגבי תנאי השימוש? דברו איתנו:"
                )}
              </p>
              <ul className="space-y-1 text-muted-foreground text-sm">
                <li>
                  {t("Email:", "מייל:")}{" "}
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
