import { useLanguage } from "@/contexts/LanguageContext";
import { photo } from "@/data/wiroTours";
import { CheckIcon } from "../icons";

/**
 * Kashrut on the trail. Wording follows PRODUCT.md: "kosher-friendly
 * planning", no certification claims.
 */
export function KosherSection() {
  const { t } = useLanguage();
  const list = [
    t(
      "Kosher-friendly meal planning on every tour",
      "תכנון אוכל ידידותי לכשרות בכל טיול"
    ),
    t(
      "Shabbat-aware scheduling — tell us and we plan around it",
      "תכנון מותאם שבת — ספרו לנו ונתכנן סביב זה"
    ),
    t(
      "Share your kashrut level before booking so we can confirm what is feasible",
      "שתפו את רמת הכשרות לפני ההזמנה כדי שנאשר מה אפשרי"
    ),
    t(
      "Packed kosher meals or local providers you can review in advance",
      "ארוחות כשרות ארוזות או ספקים מקומיים שאפשר לבדוק מראש"
    ),
  ];

  return (
    <section className="wx wx-kosher" aria-labelledby="wx-kosher-title">
      <div className="wx-kosher__grid">
        <div className="wx-kosher__photo">
          <img
            src={photo("kosher_meal").lg}
            alt={t(
              "The WIRO kitchen team with a hot buffet",
              "צוות המטבח של WIRO עם מזנון חם"
            )}
            loading="lazy"
          />
          <div className="wx-kosher__tag">
            <div
              className="wx-caps"
              style={{ fontSize: 11, color: "var(--wx-gold-ink)" }}
            >
              {t("Every tour", "בכל טיול")}
            </div>
            <div
              className="wx-serif"
              style={{ fontSize: 22, lineHeight: 1.15, marginTop: 6 }}
            >
              {t(
                "Meals planned around your kashrut",
                "ארוחות לפי רמת הכשרות שלכם"
              )}
            </div>
          </div>
        </div>
        <div>
          <p className="wx-caps wx-eyebrow" style={{ margin: 0 }}>
            {t("Kashrut on the trail", "כשרות בשטח")}
          </p>
          <h2
            id="wx-kosher-title"
            className="wx-h2"
            style={{ fontSize: "clamp(40px,5vw,68px)", lineHeight: 1 }}
          >
            {t(
              "Mud on your boots, food you can trust.",
              "בוץ על הנעליים, אוכל שאפשר לסמוך עליו."
            )}
          </h2>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: "var(--wx-ink-2)",
              margin: "22px 0 0",
            }}
          >
            {t(
              "Food and Shabbat are settled before your day, not improvised on the trail. Tell us your level and we plan the meal around it before you land.",
              "אוכל ושבת נסגרים לפני היום, לא מאולתרים בשטח. ספרו לנו את רמת הכשרות ונתכנן את הארוחה סביבה לפני שתנחתו."
            )}
          </p>
          <ul className="wx-checks">
            {list.map(item => (
              <li key={item}>
                <CheckIcon size={20} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
