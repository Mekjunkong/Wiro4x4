import { useLanguage } from "@/contexts/LanguageContext";
import { Mountain, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export function Footer() {
  const { t } = useLanguage();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer id="contact" className="bg-foreground text-background py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mountain className="h-8 w-8 text-secondary" />
              <div>
                <h3 className="text-xl font-bold">WIRO 4x4</h3>
                <p className="text-sm text-background/80">
                  {t("Kosher Off-Road Adventures", "חוויות שטח כשרות")}
                </p>
              </div>
            </div>
            <p className="text-sm text-background/70">
              {t(
                "Premium 4x4 tours in Northern Thailand with kosher meals and Hebrew-speaking guides.",
                "סיורי 4x4 פרימיום בצפון תאילנד עם ארוחות כשרות ומדריכים דוברי עברית."
              )}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-secondary">
              {t("Quick Links", "קישורים מהירים")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection("tours")}
                  className="hover:text-secondary transition-colors"
                >
                  {t("Tours", "סיורים")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("why-wiro")}
                  className="hover:text-secondary transition-colors"
                >
                  {t("Why WIRO", "למה WIRO")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("kosher")}
                  className="hover:text-secondary transition-colors"
                >
                  {t("Kosher Information", "מידע כשרות")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="hover:text-secondary transition-colors"
                >
                  {t("Contact", "צור קשר")}
                </button>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:text-secondary transition-colors"
                >
                  {t("Terms of Service", "תנאי שירות")}
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="hover:text-secondary transition-colors"
                >
                  {t("Privacy Policy", "מדיניות פרטיות")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-secondary">
              {t("Contact Us", "צור קשר")}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                <span>{t("Chiang Mai, Thailand", "צ'יאנג מאי, תאילנד")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary" />
                <a
                  href="tel:+66929894495"
                  className="hover:text-secondary transition-colors"
                >
                  +66 92 989 4495
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary" />
                <a
                  href="mailto:info@wiro4x4.com"
                  className="hover:text-secondary transition-colors"
                >
                  info@wiro4x4.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-secondary" />
                <a
                  href="https://wa.me/66929894495"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-secondary transition-colors"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
            <NewsletterSignup />
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 mt-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-background/70">
              {t(
                "* WIRO 4x4 maintains personal friendships with Chabad communities but is not officially affiliated with or endorsed by any Chabad organization.",
                "* WIRO 4x4 מקיימת קשרים אישיים עם קהילות חב״ד אך אינה מסונפת רשמית או מאושרת על ידי ארגון חב״ד כלשהו."
              )}
            </p>
            <p className="text-sm text-background/60">
              © {new Date().getFullYear()} WIRO 4x4.{" "}
              {t("All rights reserved.", "כל הזכויות שמורות.")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
