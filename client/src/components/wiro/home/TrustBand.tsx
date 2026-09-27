import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { COMPANY_TRIPADVISOR_URL } from "@/const";
import { TRIPADVISOR_REVIEW_SNAPSHOT } from "@/components/SocialProofStrip";
import { Stars } from "../icons";
import { useInView } from "../useViewport";

/**
 * "Why WIRO" band. Every claim here is either checkable (the Tripadvisor
 * listing) or a planning promise the team already makes elsewhere on the
 * site — no invented traveler counts or ratings.
 */
export function TrustBand() {
  const { t, language } = useLanguage();
  const he = language === "he";
  const guides = [
    {
      href: he
        ? "/he/private-family-tours-chiang-mai"
        : "/private-family-tours",
      label: t("Private family 4x4 tours", "טיולי 4x4 פרטיים למשפחות"),
    },
    {
      href: he ? "/he/kosher-tours-chiang-mai" : "/kosher-tours",
      label: t("Kosher-friendly tour planning", "תכנון טיול ידידותי לכשרות"),
    },
    {
      href: he ? "/he/hebrew-guide-chiang-mai" : "/hebrew-guide",
      label: t("Hebrew-speaking guide options", "אפשרויות למדריך דובר עברית"),
    },
  ];
  const [ref, inView] = useInView<HTMLElement>();

  const cards = [
    {
      num: TRIPADVISOR_REVIEW_SNAPSHOT.rating,
      label: t("Tripadvisor", "Tripadvisor"),
      sub: t(
        `${TRIPADVISOR_REVIEW_SNAPSHOT.reviewCount} public reviews — read them`,
        `${TRIPADVISOR_REVIEW_SNAPSHOT.reviewCount} ביקורות ציבוריות — לקריאה`
      ),
      href: COMPANY_TRIPADVISOR_URL,
      linkName: t(
        "Read public reviews on Tripadvisor",
        "קראו ביקורות ציבוריות ב-Tripadvisor"
      ),
    },
    {
      num: t("Private", "פרטי"),
      label: t("Your group only", "רק הקבוצה שלכם"),
      sub: t("One group per vehicle, all day", "קבוצה אחת לרכב, כל היום"),
    },
    {
      num: "עב",
      label: t("Hebrew planning", "תכנון בעברית"),
      sub: t(
        "From first message to drop-off",
        "מההודעה הראשונה ועד החזרה למלון"
      ),
      hebrewNum: true,
    },
    {
      num: t("Food", "אוכל"),
      label: t("+ Shabbat", "+ שבת"),
      sub: t("Discussed before you confirm", "מתואמים לפני האישור"),
    },
  ];

  return (
    <section ref={ref} className={`wx-trust wx ${inView ? "is-in" : ""}`}>
      <div className="wx-wrap wx-trust__inner">
        <div>
          <p className="wx-caps wx-eyebrow" style={{ margin: 0 }}>
            {t("Why WIRO", "למה WIRO")}
          </p>
          <h2
            className="wx-serif"
            style={{
              fontSize: "clamp(28px, 3vw, 40px)",
              lineHeight: 1.08,
              margin: "12px 0 0",
              textWrap: "balance",
            }}
          >
            {t(
              "A local operator you can check before you land",
              "מפעיל מקומי שאפשר לבדוק לפני הנחיתה"
            )}
          </h2>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--wx-muted)",
              margin: "12px 0 0",
              maxWidth: 420,
            }}
          >
            {t(
              "A private vehicle for every group, Hebrew planning, and food and Shabbat needs settled before your day — not improvised on the trail.",
              "רכב פרטי לכל קבוצה, תכנון בעברית, וצרכי אוכל ושבת שנסגרים לפני היום — לא מאולתרים בשטח."
            )}
          </p>
          <a
            href={COMPANY_TRIPADVISOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              marginTop: 16,
              color: "var(--wx-muted)",
              fontSize: 14,
            }}
          >
            <Stars size={18} />
            {t("Check our public reviews", "לביקורות הציבוריות שלנו")}
          </a>
          <nav
            aria-label={t("Tour planning guides", "מדריכי תכנון לטיולים")}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px 18px",
              marginTop: 18,
            }}
          >
            {guides.map(g => (
              <Link
                key={g.href}
                href={g.href}
                className="wx-link"
                style={{ fontSize: 14, minHeight: 44, alignItems: "center" }}
              >
                {g.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="wx-trust__cards">
          {cards.map((c, i) => {
            const body = (
              <>
                <div
                  className="wx-trust__num"
                  dir="ltr"
                  style={{
                    textAlign: "start",
                    fontFamily: c.hebrewNum
                      ? "Rubik, var(--wx-serif)"
                      : undefined,
                  }}
                >
                  {c.num}
                </div>
                <div>
                  <div className="wx-trust__label">{c.label}</div>
                  <div className="wx-trust__sub">{c.sub}</div>
                </div>
              </>
            );
            const style = { transitionDelay: `${i * 120}ms` };
            return c.href ? (
              <a
                key={i}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="wx-trust__card"
                style={style}
                aria-label={c.linkName}
              >
                {body}
              </a>
            ) : (
              <div key={i} className="wx-trust__card" style={style}>
                {body}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
