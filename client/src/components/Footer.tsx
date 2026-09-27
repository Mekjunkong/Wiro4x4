import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import {
  APP_LOGO,
  WHATSAPP_NUMBER,
  COMPANY_PHONE,
  COMPANY_EMAIL,
  COMPANY_FACEBOOK_URL,
  COMPANY_INSTAGRAM_URL,
} from "@/const";
import { COMMERCIAL_SEO_ROUTE_PAIRS } from "@shared/commercialSeo";
import { WaCta } from "@/components/wiro/WaCta";

export function Footer() {
  const { t, language } = useLanguage();

  const explore = [
    { href: "/tours", en: "Tours", he: "טיולים" },
    { href: "/packages", en: "Packages", he: "חבילות" },
    { href: "/gallery", en: "Gallery", he: "גלריה" },
    { href: "/book", en: "Book", he: "הזמנה" },
    { href: "/reviews", en: "Reviews", he: "ביקורות" },
    { href: "/blog", en: "Blog", he: "בלוג" },
    { href: "/about", en: "About WIRO", he: "אודות WIRO" },
    { href: "/car-rental", en: "Car rental", he: "השכרת רכב" },
  ];

  return (
    <footer id="contact" className="wx-footer">
      <div className="wx-footer__grid">
        <div>
          <Link href="/" aria-label="WIRO 4x4 home">
            <img
              src={APP_LOGO}
              alt="WIRO 4x4 Indochina Adventure"
              width={96}
              height={96}
              style={{ height: 96, width: "auto", display: "block" }}
            />
          </Link>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--wx-muted)",
              margin: "14px 0 0",
              maxWidth: 300,
            }}
          >
            {t(
              "Private 4×4 day trips in Northern Thailand with kosher-friendly meal planning and Hebrew-speaking guides.",
              "טיולי 4×4 פרטיים בצפון תאילנד עם תכנון אוכל כשר ומדריכים דוברי עברית."
            )}
          </p>
        </div>

        <nav aria-label={t("Tour planning guides", "מדריכים לתכנון הטיול")}>
          <h2>{t("Plan your trip", "תכננו את הטיול")}</h2>
          <ul>
            <li>
              <Link href="/motorcycle-tours">
                {t(
                  "Motorcycle tours in Northern Thailand",
                  "טיולי אופנועים בצפון תאילנד"
                )}
              </Link>
            </li>
            {COMMERCIAL_SEO_ROUTE_PAIRS.map(pair => (
              <li key={pair.intent}>
                <Link href={pair.paths[language]}>
                  {pair.metadata[language].title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t("Explore", "ניווט")}>
          <h2>{t("Explore", "ניווט")}</h2>
          <ul>
            {explore.map(item => (
              <li key={item.href}>
                <Link href={item.href}>{t(item.en, item.he)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2>{t("Contact", "יצירת קשר")}</h2>
          <ul>
            <li>{t("Chiang Mai, Thailand", "צ'יאנג מאי, תאילנד")}</li>
            <li>
              <a href={`tel:+${WHATSAPP_NUMBER}`} dir="ltr">
                {COMPANY_PHONE}
              </a>
            </li>
            <li>
              <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
            </li>
            <li>
              <WaCta source="GLOBAL-FOOTER" className="" icon={false}>
                {t("WhatsApp WIRO 4x4", "וואטסאפ WIRO 4x4")}
              </WaCta>
            </li>
            <li style={{ flexDirection: "row", display: "flex", gap: 16 }}>
              <a
                href={COMPANY_FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WIRO 4x4 Facebook page"
              >
                Facebook
              </a>
              <a
                href={COMPANY_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WIRO 4x4 Instagram profile"
              >
                Instagram
              </a>
            </li>
          </ul>
          <div style={{ marginTop: 20 }}>
            <NewsletterSignup />
          </div>
        </div>
      </div>

      <div className="wx-footer__legal">
        <p style={{ margin: 0 }}>
          {t(
            "* WIRO 4x4 maintains personal friendships with Chabad communities but is not officially affiliated with or endorsed by any Chabad organization.",
            "* WIRO 4x4 שומרת על קשרים אישיים עם קהילות חב״ד, אך אינה קשורה רשמית לארגון חב״ד כלשהו ואינה פועלת מטעמו."
          )}
        </p>
        <p
          style={{
            margin: "8px 0 0",
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <span>
            © {new Date().getFullYear()} WIRO 4×4.{" "}
            {t("All rights reserved.", "כל הזכויות שמורות.")}
          </span>
          <Link href="/terms">{t("Terms of Service", "תנאי שירות")}</Link>
          <Link href="/privacy">{t("Privacy Policy", "מדיניות פרטיות")}</Link>
        </p>
      </div>
    </footer>
  );
}
