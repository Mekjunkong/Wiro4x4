import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import {
  APP_LOGO,
  WHATSAPP_NUMBER,
  WHATSAPP_URL,
  COMPANY_PHONE,
  COMPANY_EMAIL,
  COMPANY_FACEBOOK_URL,
  COMPANY_INSTAGRAM_URL,
} from "@/const";
import { useLocation } from "wouter";

export function Footer() {
  const { t } = useLanguage();
  const [currentPath, setLocation] = useLocation();

  const scrollToSection = (id: string) => {
    if (currentPath !== "/") {
      setLocation("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer id="contact" className="bg-[#1C1C1C] text-white py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <a
              href="/"
              className="cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-105 inline-block"
            >
              <img
                src={APP_LOGO}
                alt="WIRO 4x4 Logo"
                className="h-16 w-auto object-contain drop-shadow-lg"
              />
            </a>
            <p className="text-sm text-white/70">
              {t(
                "Premium 4x4 tours in Northern Thailand with kosher meals and Hebrew-speaking guides.",
                "טיולי 4x4 בצפון תאילנד עם אוכל כשר ומדריכים דוברי עברית."
              )}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#D4AF37]">
              {t("Quick Links", "קישורים מהירים")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection("tours")}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {t("Tours", "טיולים")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("why-wiro")}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {t("Why WIRO", "למה WIRO")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("kosher")}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {t("Kosher Information", "כשרות")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {t("Contact", "צרו קשר")}
                </button>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {t("Terms of Service", "תנאי שירות")}
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {t("Privacy Policy", "מדיניות פרטיות")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#D4AF37]">
              {t("Contact Us", "צרו קשר")}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#D4AF37]" />
                <span>{t("Chiang Mai, Thailand", "צ'יאנג מאי, תאילנד")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#D4AF37]" />
                <a
                  href={`tel:+${WHATSAPP_NUMBER}`}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {COMPANY_PHONE}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#D4AF37]" />
                <a
                  href={`mailto:${COMPANY_EMAIL}`}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {COMPANY_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#D4AF37]" />
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  WhatsApp
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
            className="text-[#D4AF37] hover:brightness-125 transition-all"
            aria-label="Facebook"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href={COMPANY_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#D4AF37] hover:brightness-125 transition-all"
            aria-label="Instagram"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#D4AF37] hover:brightness-125 transition-all"
            aria-label="TikTok"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
          </a>
        </div>

        <div className="border-t border-[#D4AF37]/20 pt-8 mt-2">
          <div className="text-center space-y-2">
            <p className="text-sm text-white/70">
              {t(
                "* WIRO 4x4 maintains personal friendships with Chabad communities but is not officially affiliated with or endorsed by any Chabad organization.",
                "* WIRO 4x4 שומרת על קשרים אישיים עם קהילות חב״ד, אך אינה קשורה רשמית לארגון חב״ד כלשהו ואינה פועלת מטעמו."
              )}
            </p>
            <p className="text-sm text-white/50">
              © {new Date().getFullYear()} WIRO 4x4.{" "}
              {t("All rights reserved.", "כל הזכויות שמורות.")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
