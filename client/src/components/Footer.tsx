import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { APP_LOGO } from "@/const";
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
                  href="tel:+66929894495"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  +66 92 989 4495
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#D4AF37]" />
                <a
                  href="mailto:info@wiro4x4.com"
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  info@wiro4x4.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[#D4AF37]" />
                <a
                  href="https://wa.me/66929894495"
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

        <div className="border-t border-[#D4AF37]/20 pt-8 mt-8">
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
