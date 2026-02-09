import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function PrivacyPolicy() {
  const { language, t } = useLanguage();
  const isHebrew = language === "he";
  usePageMeta(
    "Privacy Policy",
    "WIRO 4x4 Privacy Policy - learn how we collect, use, and protect your personal data when booking kosher off-road tours in Chiang Mai."
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
            {t("Privacy Policy", "מדיניות פרטיות")}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {t("Last updated: February 2026", "עדכון אחרון: פברואר 2026")}
          </p>

          <div className="prose prose-sm max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  "WIRO 4x4 is committed to protecting your privacy. This policy describes how we collect, use, and safeguard your personal information when you use our website and services.",
                  "WIRO 4x4 מחויבת להגנה על פרטיותכם. מדיניות זו מתארת כיצד אנו אוספים, משתמשים ומגנים על המידע האישי שלכם בעת שימוש באתר ובשירותים שלנו."
                )}
              </p>
            </section>

            {/* Data Collected */}
            <section>
              <h2 className="text-xl font-serif font-bold text-foreground mb-3">
                {t("1. Information We Collect", "1. מידע שאנו אוספים")}
              </h2>
              <p className="text-muted-foreground mb-2">
                {t(
                  "We collect the following types of personal information:",
                  "אנו אוספים את סוגי המידע האישי הבאים:"
                )}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  {t(
                    "Contact information: name, email address, phone number, WhatsApp number",
                    "פרטי קשר: שם, כתובת אימייל, מספר טלפון, מספר וואטסאפ"
                  )}
                </li>
                <li>
                  {t(
                    "Booking details: travel dates, group size, service preferences, dietary requirements, special requests",
                    "פרטי הזמנה: תאריכי נסיעה, גודל קבוצה, העדפות שירות, דרישות תזונתיות, בקשות מיוחדות"
                  )}
                </li>
                <li>
                  {t(
                    "Payment information: processed securely by Stripe (we do not store credit card details)",
                    "מידע תשלום: מעובד בצורה מאובטחת על ידי Stripe (אנו לא שומרים פרטי כרטיס אשראי)"
                  )}
                </li>
                <li>
                  {t(
                    "Account information: login credentials if you create an account",
                    "מידע חשבון: פרטי התחברות אם אתם יוצרים חשבון"
                  )}
                </li>
                <li>
                  {t(
                    "Usage data: pages visited, browser type, and device information for analytics",
                    "נתוני שימוש: דפים שביקרתם, סוג דפדפן ומידע על המכשיר לצורכי אנליטיקה"
                  )}
                </li>
              </ul>
            </section>

            {/* How We Use Data */}
            <section>
              <h2 className="text-xl font-serif font-bold text-foreground mb-3">
                {t(
                  "2. How We Use Your Information",
                  "2. כיצד אנו משתמשים במידע שלכם"
                )}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  {t(
                    "To process and manage your tour bookings",
                    "לעיבוד וניהול הזמנות הסיורים שלכם"
                  )}
                </li>
                <li>
                  {t(
                    "To communicate with you about your booking via email, WhatsApp, or phone",
                    "ליצירת קשר אתכם לגבי ההזמנה באמצעות אימייל, וואטסאפ או טלפון"
                  )}
                </li>
                <li>
                  {t(
                    "To send booking confirmation emails and calendar invitations",
                    "לשליחת אישורי הזמנה והזמנות ליומן"
                  )}
                </li>
                <li>
                  {t(
                    "To process payments securely",
                    "לעיבוד תשלומים בצורה מאובטחת"
                  )}
                </li>
                <li>
                  {t(
                    "To improve our website and services",
                    "לשיפור האתר והשירותים שלנו"
                  )}
                </li>
                <li>
                  {t(
                    "To respond to inquiries and provide customer support",
                    "למענה לפניות ומתן תמיכת לקוחות"
                  )}
                </li>
              </ul>
            </section>

            {/* Third-Party Sharing */}
            <section>
              <h2 className="text-xl font-serif font-bold text-foreground mb-3">
                {t("3. Third-Party Services", "3. שירותי צד שלישי")}
              </h2>
              <p className="text-muted-foreground mb-2">
                {t(
                  "We share your information with the following trusted third parties only as needed to provide our services:",
                  "אנו משתפים את המידע שלכם עם צדדים שלישיים מהימנים הבאים רק כפי הנדרש לספק את שירותינו:"
                )}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  <strong>Stripe</strong> -{" "}
                  {t(
                    "For secure payment processing. Stripe has its own privacy policy governing how payment data is handled.",
                    "לעיבוד תשלומים מאובטח. ל-Stripe מדיניות פרטיות משלה המסדירה את הטיפול בנתוני תשלום."
                  )}
                </li>
                <li>
                  <strong>Resend</strong> -{" "}
                  {t(
                    "For sending transactional emails (booking confirmations, notifications). Only your email address and name are shared.",
                    "לשליחת אימיילים עסקיים (אישורי הזמנה, התראות). רק כתובת האימייל והשם שלכם משותפים."
                  )}
                </li>
              </ul>
              <p className="text-muted-foreground mt-2">
                {t(
                  "We do not sell, trade, or rent your personal information to third parties for marketing purposes.",
                  "אנו לא מוכרים, סוחרים או משכירים את המידע האישי שלכם לצדדים שלישיים למטרות שיווק."
                )}
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-xl font-serif font-bold text-foreground mb-3">
                {t("4. Data Retention", "4. שמירת מידע")}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  {t(
                    "Booking data is retained for up to 3 years after the tour date for record-keeping and legal compliance.",
                    "נתוני הזמנה נשמרים עד 3 שנים לאחר תאריך הסיור לצורכי תיעוד ועמידה בדרישות חוק."
                  )}
                </li>
                <li>
                  {t(
                    "Account data is retained as long as your account is active.",
                    "נתוני חשבון נשמרים כל עוד החשבון שלכם פעיל."
                  )}
                </li>
                <li>
                  {t(
                    "You may request deletion of your data at any time by contacting us.",
                    "תוכלו לבקש מחיקת המידע שלכם בכל עת על ידי פנייה אלינו."
                  )}
                </li>
              </ul>
            </section>

            {/* User Rights */}
            <section>
              <h2 className="text-xl font-serif font-bold text-foreground mb-3">
                {t("5. Your Rights", "5. הזכויות שלכם")}
              </h2>
              <p className="text-muted-foreground mb-2">
                {t("You have the right to:", "יש לכם את הזכות:")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  {t(
                    "Access the personal data we hold about you",
                    "לגשת למידע האישי שאנו מחזיקים עליכם"
                  )}
                </li>
                <li>
                  {t(
                    "Request correction of inaccurate data",
                    "לבקש תיקון מידע לא מדויק"
                  )}
                </li>
                <li>
                  {t(
                    "Request deletion of your personal data",
                    "לבקש מחיקת המידע האישי שלכם"
                  )}
                </li>
                <li>
                  {t(
                    "Withdraw consent for data processing at any time",
                    "לבטל הסכמה לעיבוד מידע בכל עת"
                  )}
                </li>
                <li>
                  {t(
                    "Request a copy of your data in a portable format",
                    "לבקש עותק של המידע שלכם בפורמט נייד"
                  )}
                </li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-serif font-bold text-foreground mb-3">
                {t("6. Cookies & Local Storage", "6. עוגיות ואחסון מקומי")}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>
                  {t(
                    "We use essential cookies for authentication and session management.",
                    "אנו משתמשים בעוגיות חיוניות לאימות וניהול הפעלה."
                  )}
                </li>
                <li>
                  {t(
                    "Booking form drafts are saved locally in your browser using localStorage to prevent data loss.",
                    "טיוטות טופס הזמנה נשמרות מקומית בדפדפן שלכם באמצעות localStorage למניעת אובדן מידע."
                  )}
                </li>
                <li>
                  {t(
                    "Language preference is stored locally in your browser.",
                    "העדפת שפה נשמרת מקומית בדפדפן שלכם."
                  )}
                </li>
              </ul>
            </section>

            {/* Contact */}
            <section className="bg-muted rounded-xl p-6">
              <h2 className="text-xl font-serif font-bold text-foreground mb-3">
                {t("Contact Us", "צרו קשר")}
              </h2>
              <p className="text-muted-foreground mb-2">
                {t(
                  "If you have questions about this privacy policy or wish to exercise your rights, please contact us:",
                  "אם יש לכם שאלות לגבי מדיניות פרטיות זו או שאתם רוצים לממש את זכויותיכם, אנא צרו קשר:"
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
