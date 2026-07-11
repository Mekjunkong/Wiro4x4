import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Link } from "wouter";
import {
  APP_LOGO,
  WHATSAPP_NUMBER,
  WHATSAPP_URL,
  COMPANY_PHONE,
  COMPANY_EMAIL,
  COMPANY_FACEBOOK_URL,
  COMPANY_INSTAGRAM_URL,
} from "@/const";
export function Footer() {
  const { t } = useLanguage();
  const whatsappMessage = t(
    "Hi WIRO 4x4, I'd like to check availability for a private tour.\nDates: __\nGroup size: __\nPickup area or hotel: __\nRoute idea: __\nKosher / Shabbat / Hebrew-guide needs: __",
    "שלום WIRO 4x4, אשמח לבדוק זמינות לטיול פרטי.\nתאריכים: __\nמספר מטיילים: __\nמלון או אזור איסוף: __\nרעיון למסלול: __\nצרכי כשרות / שבת / מדריך בעברית: __"
  );
  const whatsappHref = `${WHATSAPP_URL}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <footer id="contact" className="bg-card text-foreground py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-105 inline-block"
            >
              <img
                src={APP_LOGO}
                alt="WIRO 4x4 home"
                width={64}
                height={64}
                className="h-16 w-auto object-contain drop-shadow-lg"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              {t(
                "Premium 4x4 tours in Northern Thailand with kosher meals and Hebrew-speaking guides.",
                "טיולי 4x4 בצפון תאילנד עם אוכל כשר ומדריכים דוברי עברית."
              )}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-accent-readable">
              {t("Quick Links", "קישורים מהירים")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/tours"
                  className="hover:text-accent transition-colors"
                >
                  {t("Tours", "טיולים")}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-accent transition-colors"
                >
                  {t("Pricing", "מחירים")}
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="hover:text-accent transition-colors"
                >
                  {t("Gallery", "גלריה")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-accent transition-colors"
                >
                  {t("Blog", "בלוג")}
                </Link>
              </li>
              <li>
                <Link
                  href="/reviews"
                  className="hover:text-accent transition-colors"
                >
                  {t("Reviews", "ביקורות")}
                </Link>
              </li>
              <li>
                <Link
                  href="/car-rental"
                  className="hover:text-accent transition-colors"
                >
                  {t("Car Rental", "השכרת רכב")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-accent transition-colors"
                >
                  {t("Terms of Service", "תנאי שירות")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-accent transition-colors"
                >
                  {t("Privacy Policy", "מדיניות פרטיות")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-accent-readable">
              {t("Contact Us", "צרו קשר")}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                <span>{t("Chiang Mai, Thailand", "צ'יאנג מאי, תאילנד")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
                <a
                  href={`tel:+${WHATSAPP_NUMBER}`}
                  className="hover:text-accent transition-colors"
                >
                  {COMPANY_PHONE}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
                <a
                  href={`mailto:${COMPANY_EMAIL}`}
                  className="hover:text-accent transition-colors"
                >
                  {COMPANY_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle
                  className="h-4 w-4 text-accent"
                  aria-hidden="true"
                />
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  {t("WhatsApp WIRO 4x4", "וואטסאפ WIRO 4x4")}
                </a>
              </li>
            </ul>
            <NewsletterSignup />
          </div>
        </div>

        {/* Social Media */}
        <div className="flex justify-center items-center gap-6 mt-8 mb-6">
          <a
            href={COMPANY_FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:brightness-125 transition-all"
            aria-label="WIRO 4x4 Facebook page"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href={COMPANY_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:brightness-125 transition-all"
            aria-label="WIRO 4x4 Instagram profile"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
        </div>

        <div className="border-t border-accent/20 pt-8 mt-2">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t(
                "* WIRO 4x4 maintains personal friendships with Chabad communities but is not officially affiliated with or endorsed by any Chabad organization.",
                "* WIRO 4x4 שומרת על קשרים אישיים עם קהילות חב״ד, אך אינה קשורה רשמית לארגון חב״ד כלשהו ואינה פועלת מטעמו."
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WIRO 4x4.{" "}
              {t("All rights reserved.", "כל הזכויות שמורות.")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
