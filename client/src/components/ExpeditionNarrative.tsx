import { useRef, useState } from "react";
import { ArrowUpRight, MessageCircle, Pause, Play } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { OptimizedImage } from "@/components/OptimizedImage";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";

const routeMoments = [
  {
    image: "/media/field/today-route-bridge.jpg",
    place: "Mae Wang",
    placeHe: "מאה ואנג",
    title: "A day feels different when the route leaves room to look around.",
    titleHe: "יום מרגיש אחרת כשהמסלול משאיר מקום להסתכל סביב.",
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
    duration: "Full day · 8–10 hours",
    durationHe: "יום שלם · 8–10 שעות",
    highlights: "Cloud forest · mountain roads · summit",
    highlightsHe: "יער עננים · דרכי הרים · הפסגה",
  },
  {
    href: "/tours/mae-wang-jungle-wilderness",
    image: "wiro_4x4_river_splash",
    title: "Mae Wang — Jungle & River Wilderness",
    titleHe: "מאה וואנג — ג׳ונגל ונהרות פראיים",
    detail:
      "Real 4x4 terrain, river country, and a route shaped around the people in your vehicle.",
    detailHe: "שטח 4x4 אמיתי, אזור נהרות ומסלול שנבנה סביב האנשים שברכב.",
    duration: "6–8 hours",
    durationHe: "6–8 שעות",
    highlights: "Jungle tracks · river country · local stops",
    highlightsHe: "שבילי ג׳ונגל · נהרות · עצירות מקומיות",
  },
  {
    href: "/tours/maerim-sticky-waterfalls",
    image: "sticky_waterfalls",
    title: "Maerim & Sticky Waterfalls",
    titleHe: "מאה רים והמפלים הדביקים",
    detail:
      "A slower day of waterfalls, forest air, and a flexible private rhythm.",
    detailHe: "יום רגוע יותר של מפלים, אוויר יער וקצב פרטי וגמיש.",
    duration: "4–6 hours",
    durationHe: "4–6 שעות",
    highlights: "Waterfall walk · forest air · flexible pace",
    highlightsHe: "הליכה למפל · אוויר יער · קצב גמיש",
  },
];

function FieldVideo({
  src,
  poster,
  label,
  caption,
  className = "",
}: {
  src: string;
  poster: string;
  label: string;
  caption: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video
        .play()
        .then(() => setPlaying(true))
        .catch(() => undefined);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <figure className={className}>
      <div className="expedition-film-frame">
        <video
          ref={videoRef}
          controls={playing}
          muted
          playsInline
          preload="none"
          poster={poster}
          aria-label={label}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <source src={src} type="video/mp4" />
        </video>
        <button
          type="button"
          className="expedition-film-play"
          onClick={togglePlayback}
          aria-label={playing ? `Pause: ${label}` : `Play: ${label}`}
        >
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          <span>{playing ? "Pause film" : "Play film"}</span>
        </button>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

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
            {t(
              "A better way into the North.",
              "דרך טובה יותר להיכנס אל הצפון."
            )}
          </h2>
          <p className="expedition-intro__body">
            {t(
              "A private vehicle, a local guide, and a day shaped around your people, pace and practical needs.",
              "רכב פרטי, מדריך מקומי ויום שנבנה סביב האנשים, הקצב והצרכים המעשיים שלכם."
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
              {t("Choose your terrain", "בחרו את השטח שלכם")}
            </p>
            <p>
              {t(
                "Start with a direction. WIRO adjusts the day around the weather, the road and the people in your vehicle.",
                "מתחילים בכיוון. WIRO מתאים את היום למזג האוויר, לדרך ולאנשים שברכב."
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
            <FieldVideo
              className="expedition-field-film__feature"
              src="/media/field/forest-crossing.mp4"
              poster="/media/field/forest-crossing-poster.jpg"
              label={t(
                "WIRO 4x4 crossing a forest route",
                "רכב WIRO 4x4 חוצה מסלול יער"
              )}
              caption={t(
                "A forest route after the rain",
                "מסלול יער אחרי הגשם"
              )}
            />
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
                {t("Three ways into the North.", "שלוש דרכים אל הצפון.")}
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
                  <div className="expedition-tour__meta">
                    <span>{t(tour.duration, tour.durationHe)}</span>
                    <span>{t(tour.highlights, tour.highlightsHe)}</span>
                  </div>
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
                "A local guide, before you arrive.",
                "מדריך מקומי, עוד לפני שאתם מגיעים."
              )}
            </h2>
            <p>
              {t(
                "WIRO founded the company and plans most private days himself. He speaks fluent Hebrew and works through the details before pickup, so your group arrives knowing what the day can hold.",
                "WIRO הקים את החברה ומתכנן בעצמו את רוב הימים הפרטיים. הוא דובר עברית שוטפת ועובר על הפרטים לפני האיסוף, כדי שתגיעו כשאתם יודעים מה היום יכול לכלול."
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
                "The practical details come first.",
                "הפרטים המעשיים קודמים לכל."
              )}
            </h2>
          </div>
          <div className="expedition-planning__copy">
            <p>
              {t(
                "Tell WIRO your dates, group, pickup area and what matters around Hebrew, food or Shabbat. He will explain what is possible before you confirm the route.",
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
              "Tell us what the day needs to hold.",
              "ספרו לנו מה היום צריך לכלול."
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
              "Start with the people, not a package.",
              "מתחילים באנשים, לא בחבילה."
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
          </div>
        </div>
      </section>
    </div>
  );
}
