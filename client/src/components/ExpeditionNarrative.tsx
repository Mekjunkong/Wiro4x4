import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { OptimizedImage } from "@/components/OptimizedImage";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";

const routeMoments = [
  {
    image: "/media/field/log-bridge.jpeg",
    place: "Mae Wang",
    placeHe: "מאה ואנג",
    title: "Forest tracks, properly off the main road.",
    titleHe: "שבילי יער, באמת מחוץ לדרך הראשית.",
  },
  {
    image: "sticky_waterfalls",
    place: "Mae Rim",
    placeHe: "מאה רים",
    title: "Cool water, limestone, and time to stay awhile.",
    titleHe: "מים קרירים, אבן גיר, וזמן להישאר קצת.",
  },
  {
    image: "mountain_sunset_golden",
    place: "Doi Inthanon",
    placeHe: "דוי אינתנון",
    title: "The North gets quieter when you travel privately.",
    titleHe: "הצפון נעשה שקט יותר כשמטיילים בפרטי.",
  },
];

const expeditions = [
  {
    href: "/tours/doi-inthanon-roof-of-thailand",
    image: "mountain_sunset",
    title: "Doi Inthanon — Roof of Thailand",
    titleHe: "דוי אינתנון — גג תאילנד",
    detail:
      "A full private day through cloud forest, mountain roads, and the highest part of Thailand.",
    detailHe: "יום פרטי מלא דרך יער עננים, דרכי הרים והנקודה הגבוהה בתאילנד.",
  },
  {
    href: "/tours/mae-wang-jungle-wilderness",
    image: "wiro_4x4_river_splash",
    title: "Mae Wang — Jungle & River Wilderness",
    titleHe: "מאה וואנג — ג׳ונגל ונהרות פראיים",
    detail:
      "Real 4x4 terrain, river country, and a route shaped around the people in your vehicle.",
    detailHe: "שטח 4x4 אמיתי, אזור נהרות ומסלול שנבנה סביב האנשים שברכב.",
  },
  {
    href: "/tours/maerim-sticky-waterfalls",
    image: "sticky_waterfalls",
    title: "Maerim & Sticky Waterfalls",
    titleHe: "מאה רים והמפלים הדביקים",
    detail:
      "A slower day of waterfalls, forest air, and a flexible private rhythm.",
    detailHe: "יום רגוע יותר של מפלים, אוויר יער וקצב פרטי וגמיש.",
  },
];

export function ExpeditionNarrative() {
  const { language, t } = useLanguage();
  const whatsappMessage = t(
    "Hi WIRO 4x4, I would like to plan a private journey from Chiang Mai. Dates: __ Group size: __ What we want to experience: __",
    "שלום WIRO 4x4, אשמח לתכנן טיול פרטי מצ׳יאנג מאי. תאריכים: __ מספר מטיילים: __ מה נרצה לחוות: __"
  );

  return (
    <div className="expedition-narrative overflow-x-clip">
      <section className="expedition-intro" aria-labelledby="journey-heading">
        <div className="container expedition-intro__grid">
          <p className="expedition-kicker">
            {t("Northern Thailand, privately", "צפון תאילנד, בפרטי")}
          </p>
          <h2 id="journey-heading">
            {t("A private route through the North.", "מסלול פרטי דרך הצפון.")}
          </h2>
          <p className="expedition-intro__body">
            {t(
              "Private 4x4 journeys through mountains, villages, waterfalls and forest routes — personally planned with WIRO from Chiang Mai.",
              "טיולי 4x4 פרטיים בין הרים, כפרים, מפלים ודרכי יער — בתכנון אישי עם WIRO מצ׳יאנג מאי."
            )}
          </p>
          <div className="expedition-intro__trust">
            {t(
              "Private tours · Chiang Mai pickup · Hebrew-speaking guide",
              "טיולים פרטיים · איסוף מצ׳יאנג מאי · מדריך דובר עברית"
            )}
          </div>
        </div>
      </section>

      <section
        className="expedition-route"
        aria-label={t("Route moments", "רגעים בדרך")}
      >
        <div className="container">
          <div className="expedition-route__heading">
            <p className="expedition-kicker">
              {t("The journey begins", "המסע מתחיל")}
            </p>
            <p>
              {t(
                "A route is not a checklist. It is the pace, the weather, the road, and the people you came with.",
                "מסלול אינו רשימת משימות. הוא הקצב, מזג האוויר, הדרך והאנשים שאיתם הגעתם."
              )}
            </p>
          </div>
          <div className="expedition-route__grid">
            {routeMoments.map((moment, index) => (
              <article
                key={moment.image}
                className={`expedition-route__moment expedition-route__moment--${index + 1}`}
              >
                {moment.image.startsWith("/") ? (
                  <img
                    src={moment.image}
                    alt={t(moment.title, moment.titleHe)}
                    width={1200}
                    height={1600}
                    loading="lazy"
                    decoding="async"
                    className="expedition-route__image"
                  />
                ) : (
                  <OptimizedImage
                    src={moment.image}
                    alt={t(moment.title, moment.titleHe)}
                    width={1200}
                    height={900}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="expedition-route__image"
                  />
                )}
                <div className="expedition-route__caption">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{t(moment.place, moment.placeHe)}</p>
                  <h3>{t(moment.title, moment.titleHe)}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="expedition-field-film"
        aria-labelledby="field-film-heading"
      >
        <div className="container">
          <div className="expedition-field-film__heading">
            <div>
              <p className="expedition-kicker">
                {t("From the field", "מהשטח")}
              </p>
              <h2 id="field-film-heading">
                {t("The road is part of the story.", "הדרך היא חלק מהסיפור.")}
              </h2>
            </div>
            <p>
              {t(
                "Real moments from the routes around Chiang Mai — captured on the bridge, in the forest, and beside the village homes.",
                "רגעים אמיתיים מהמסלולים סביב צ׳יאנג מאי — על הגשר, ביער וליד בתי הכפר."
              )}
            </p>
          </div>
          <div className="expedition-field-film__grid">
            <figure className="expedition-field-film__feature">
              <video
                controls
                muted
                playsInline
                preload="metadata"
                poster="/media/field/forest-crossing-poster.jpg"
                aria-label={t(
                  "WIRO 4x4 crossing a forest route",
                  "רכב WIRO 4x4 חוצה מסלול יער"
                )}
              >
                <source
                  src="/media/field/forest-crossing.mp4"
                  type="video/mp4"
                />
              </video>
              <figcaption>
                {t("A forest route after the rain", "מסלול יער אחרי הגשם")}
              </figcaption>
            </figure>
            <div className="expedition-field-film__stack">
              <figure>
                <img
                  src="/media/field/log-bridge.jpeg"
                  alt={t(
                    "4x4 crossing a log bridge in the forest",
                    "רכב 4x4 חוצה גשר בולי עץ ביער"
                  )}
                  loading="lazy"
                />
                <figcaption>
                  {t("Mae Wang, taken from the road", "מאה וואנג, מתוך הדרך")}
                </figcaption>
              </figure>
              <figure>
                <img
                  src="/media/field/4x4-village-new.jpeg"
                  alt={t(
                    "WIRO 4x4 vehicle beside a Northern Thailand village",
                    "רכב WIRO 4x4 ליד כפר בצפון תאילנד"
                  )}
                  loading="lazy"
                />
                <figcaption>
                  {t("A stop worth making", "עצירה ששווה לעשות")}
                </figcaption>
              </figure>
            </div>
          </div>
          <figure className="expedition-field-film__wide">
            <video
              controls
              muted
              playsInline
              preload="metadata"
              poster="/media/field/forest-drive-poster.jpg"
              aria-label={t(
                "WIRO 4x4 driving through the forest",
                "רכב WIRO 4x4 נוסע ביער"
              )}
            >
              <source src="/media/field/forest-drive.mp4" type="video/mp4" />
            </video>
            <figcaption>
              {t(
                "Keep moving when the road turns wild",
                "ממשיכים גם כשהדרך נעשית פראית"
              )}
            </figcaption>
          </figure>
        </div>
      </section>

      <section
        className="expedition-featured"
        aria-labelledby="featured-heading"
      >
        <div className="container">
          <div className="expedition-featured__topline">
            <div>
              <p className="expedition-kicker">
                {t("Featured expeditions", "מסעות נבחרים")}
              </p>
              <h2 id="featured-heading">
                {t(
                  "Choose a direction. Then make it yours.",
                  "בחרו כיוון. אחר כך הפכו אותו לשלכם."
                )}
              </h2>
            </div>
            <Link href="/tours" className="expedition-text-link">
              {t("View all tours", "לכל הטיולים")}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          <div className="expedition-featured__list">
            {expeditions.map((tour, index) => (
              <Link
                key={tour.href}
                href={tour.href}
                className="expedition-tour"
              >
                <span className="expedition-tour__number">0{index + 1}</span>
                <OptimizedImage
                  src={tour.image}
                  alt={t(tour.title, tour.titleHe)}
                  width={1200}
                  height={800}
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="expedition-tour__image"
                />
                <div className="expedition-tour__copy">
                  <h3>{t(tour.title, tour.titleHe)}</h3>
                  <p>{t(tour.detail, tour.detailHe)}</p>
                </div>
                <ArrowUpRight
                  className="expedition-tour__arrow"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="expedition-wiro" aria-labelledby="wiro-heading">
        <div className="container expedition-wiro__grid">
          <div className="expedition-wiro__media">
            <OptimizedImage
              src="wiro_with_vehicle"
              alt={t(
                "Wiro standing with a WIRO 4x4 vehicle",
                "WIRO לצד רכב 4x4"
              )}
              width={900}
              height={1200}
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="expedition-wiro__image"
            />
          </div>
          <div className="expedition-wiro__copy">
            <p className="expedition-kicker">
              {t("Meet WIRO", "הכירו את WIRO")}
            </p>
            <h2 id="wiro-heading">
              {t(
                "Not just a driver. Your local way into the North.",
                "לא רק נהג. הדרך המקומית שלכם אל הצפון."
              )}
            </h2>
            <p>
              {t(
                "WIRO founded WIRO 4x4 and is the primary guide for most tours. He speaks fluent Hebrew and plans each private day directly with the travelers taking it.",
                "WIRO הקים את WIRO 4x4 והוא המדריך הראשי ברוב הטיולים. הוא דובר עברית שוטפת ומתכנן כל יום פרטי ישירות עם המטיילים שיוצאים אליו."
              )}
            </p>
            <div className="expedition-wiro__actions">
              <Link href="/hebrew-guide" className="expedition-text-link">
                {t(
                  "Meet your Hebrew-speaking guide",
                  "הכירו את המדריך דובר העברית"
                )}
                <ArrowUpRight aria-hidden="true" />
              </Link>
              <TrackedWhatsAppLink
                sourceCode={language === "he" ? "HOME-HERO-HE" : "HOME-HERO-EN"}
                humanMessage={whatsappMessage}
                target="_blank"
                rel="noopener noreferrer"
                className="expedition-whatsapp"
              >
                <MessageCircle aria-hidden="true" />
                {t("Plan with WIRO", "לתכנן עם WIRO")}
              </TrackedWhatsAppLink>
            </div>
          </div>
        </div>
      </section>

      <section
        className="expedition-planning"
        aria-labelledby="planning-heading"
      >
        <div className="container expedition-planning__grid">
          <div>
            <p className="expedition-kicker">
              {t("Israeli traveler planning", "תכנון למטיילים ישראלים")}
            </p>
            <h2 id="planning-heading">
              {t(
                "The details are part of the journey.",
                "הפרטים הם חלק מהמסע."
              )}
            </h2>
          </div>
          <div className="expedition-planning__copy">
            <p>
              {t(
                "Hebrew communication, private planning, kosher-aware meal logistics and Shabbat-sensitive routing are discussed before your route is confirmed. Tell WIRO what matters to your group and he will confirm what is possible.",
                "תקשורת בעברית, תכנון פרטי, לוגיסטיקת אוכל מודעת כשרות ותכנון רגיש לשבת נבדקים לפני אישור המסלול. ספרו ל-WIRO מה חשוב לקבוצה שלכם והוא יאשר מה אפשרי."
              )}
            </p>
            <div className="expedition-planning__links">
              <Link
                href={
                  language === "he"
                    ? "/he/kosher-tours-chiang-mai"
                    : "/kosher-tours"
                }
              >
                {t("Kosher-aware planning", "תכנון מודע כשרות")}
              </Link>
              <Link
                href={
                  language === "he"
                    ? "/he/hebrew-guide-chiang-mai"
                    : "/hebrew-guide"
                }
              >
                {t("Hebrew guide", "מדריך בעברית")}
              </Link>
              <Link
                href={
                  language === "he"
                    ? "/he/private-family-tours-chiang-mai"
                    : "/private-family-tours"
                }
              >
                {t("Private family tours", "טיולים פרטיים למשפחות")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="expedition-process" aria-labelledby="process-heading">
        <div className="container">
          <p className="expedition-kicker">
            {t("Simple planning", "תכנון פשוט")}
          </p>
          <h2 id="process-heading">
            {t(
              "Start the conversation. Let the road take shape.",
              "התחילו שיחה. תנו לדרך לקבל צורה."
            )}
          </h2>
          <ol>
            {[
              ["Tell WIRO about your group", "ספרו ל-WIRO על הקבוצה"],
              ["Shape your private journey", "עצבו את המסע הפרטי שלכם"],
              ["Confirm and explore", "אשרו וצאו לדרך"],
            ].map(([en, he], index) => (
              <li key={en}>
                <span>0{index + 1}</span>
                <p>{t(en, he)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="expedition-final">
        <OptimizedImage
          src="banner"
          alt={t(
            "WIRO 4x4 on a Northern Thailand road",
            "רכב WIRO 4x4 בדרך בצפון תאילנד"
          )}
          width={1600}
          height={900}
          sizes="100vw"
          className="expedition-final__image"
        />
        <div className="expedition-final__shade" />
        <div className="container expedition-final__copy">
          <h2>
            {t(
              "Northern Thailand is better beyond the main road.",
              "צפון תאילנד טוב יותר מעבר לדרך הראשית."
            )}
          </h2>
          <p>
            {t(
              "Tell WIRO who you are traveling with, what you want to experience, and when you arrive.",
              "ספרו ל-WIRO עם מי אתם מטיילים, מה תרצו לחוות ומתי אתם מגיעים."
            )}
          </p>
          <div className="expedition-final__actions">
            <TrackedWhatsAppLink
              sourceCode={language === "he" ? "HOME-HERO-HE" : "HOME-HERO-EN"}
              humanMessage={whatsappMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="expedition-whatsapp"
            >
              <MessageCircle aria-hidden="true" />
              {t("Plan on WhatsApp", "תכנון בוואטסאפ")}
            </TrackedWhatsAppLink>
            <Link href="/tours" className="expedition-final__secondary">
              {t("View all tours", "לכל הטיולים")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
