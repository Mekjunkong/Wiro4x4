import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";

const chapters = [
  {
    place: "Chiang Mai",
    placeHe: "צ׳יאנג מאי",
    title: "Leave the ordinary road behind.",
    titleHe: "משאירים את הדרך הרגילה מאחור.",
    image: "/images/optimized/hero-wiro.webp",
  },
  {
    place: "Mae Wang",
    placeHe: "מאה וואנג",
    title: "Follow the road where the buses stop.",
    titleHe: "ממשיכים בדרך שבה האוטובוסים עוצרים.",
    image: "/media/field/today-route-bridge.jpg",
  },
  {
    place: "The North",
    placeHe: "הצפון",
    title: "Let the day move at your pace.",
    titleHe: "נותנים ליום לנוע בקצב שלכם.",
    image: "/images/optimized/mountain_trail_scenic.webp",
  },
];

const regions = [
  {
    name: "Thailand",
    nameHe: "תאילנד",
    detail: "Chiang Mai, jungle roads, waterfalls and mountain country.",
    detailHe: "צ׳יאנג מאי, דרכי ג׳ונגל, מפלים ואזורי הרים.",
    image: "/images/optimized/doi_inthanon_waterfall.webp",
  },
  {
    name: "Laos",
    nameHe: "לאוס",
    detail:
      "Regional route planning for quiet rivers, limestone and open roads.",
    detailHe: "תכנון מסלולים אזורי לנהרות, אבן גיר ודרכים פתוחות.",
    image: "/images/optimized/kuang_si_waterfall_laos.webp",
  },
  {
    name: "Vietnam",
    nameHe: "וייטנאם",
    detail: "A wider Indochina conversation, shaped around your group.",
    detailHe: "שיחה רחבה יותר על הודו-סין, שנבנית סביב הקבוצה שלכם.",
    image: "/images/optimized/vang_vieng_mountains.webp",
  },
];

export function IndochinaJourney() {
  const { language, t } = useLanguage();
  const journeyRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const whatsappMessage = t(
    "Hi WIRO 4x4, I would like to plan a private journey in Indochina. Dates: __ Group size: __ Countries or places: __ What we want to experience: __",
    "שלום WIRO 4x4, אשמח לתכנן מסע פרטי בהודו-סין. תאריכים: __ מספר מטיילים: __ מדינות או מקומות: __ מה נרצה לחוות: __"
  );

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const element = journeyRef.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const scrollable = Math.max(element.offsetHeight - window.innerHeight, 1);
      setProgress(Math.min(1, Math.max(0, -bounds.top / scrollable)));
    };
    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={journeyRef}
      className="indochina-journey"
      style={{ "--journey-progress": progress } as CSSProperties}
    >
      <section className="journey-threshold" aria-labelledby="journey-heading">
        <div className="container journey-threshold__grid">
          <div className="journey-threshold__copy">
            <p className="journey-label">
              {t("The route is the invitation", "הדרך היא ההזמנה")}
            </p>
            <h2 id="journey-heading">
              {t(
                "Go farther into the real North.",
                "נכנסים עמוק יותר אל הצפון האמיתי."
              )}
            </h2>
            <p>
              {t(
                "Private 4x4 journeys begin in Chiang Mai and open into the landscapes, people and quiet roads that make Indochina worth crossing.",
                "מסעות 4x4 פרטיים מתחילים בצ׳יאנג מאי ונפתחים אל הנופים, האנשים והדרכים השקטות שהופכים את הודו-סין לשווה את הדרך."
              )}
            </p>
          </div>
          <div className="journey-threshold__note">
            <span>WIRO 4x4</span>
            <p>
              {t(
                "A private day, shaped before you arrive.",
                "יום פרטי שנבנה עוד לפני ההגעה."
              )}
            </p>
          </div>
        </div>
      </section>

      <section
        className="journey-chapters"
        aria-label={t("The road north", "הדרך צפונה")}
      >
        <div className="container journey-chapters__inner">
          <div className="journey-chapters__heading">
            <p className="journey-label">{t("A living route", "מסלול חי")}</p>
            <p>
              {t(
                "The landscape changes first. Then your sense of time.",
                "הנוף משתנה קודם. אחר כך תחושת הזמן."
              )}
            </p>
          </div>
          <div className="journey-chapters__rail" aria-hidden="true">
            <span className="journey-chapters__track" />
            <span className="journey-chapters__progress" />
            <span className="journey-chapters__marker" />
            <div className="journey-chapters__stops">
              {chapters.map(chapter => (
                <span key={chapter.place}>
                  {t(chapter.place, chapter.placeHe)}
                </span>
              ))}
            </div>
          </div>
          <div className="journey-chapters__cards">
            {chapters.map((chapter, index) => (
              <article
                className={`journey-chapter journey-chapter--${index + 1}`}
                key={chapter.place}
              >
                <div className="journey-chapter__image-wrap">
                  <img
                    src={chapter.image}
                    alt={t(chapter.title, chapter.titleHe)}
                    width="1200"
                    height="1000"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
                <div className="journey-chapter__copy">
                  <p>{t(chapter.place, chapter.placeHe)}</p>
                  <h3>{t(chapter.title, chapter.titleHe)}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="journey-peak" aria-labelledby="journey-peak-heading">
        <div className="journey-peak__image-wrap">
          <img
            src="/images/optimized/hero-waterfall.webp"
            alt={t(
              "A hidden waterfall in Northern Thailand",
              "מפל נסתר בצפון תאילנד"
            )}
            width="1600"
            height="1100"
            loading="lazy"
          />
        </div>
        <div className="journey-peak__scrim" />
        <div className="container journey-peak__content">
          <p className="journey-label">
            {t("The road earns this moment", "הדרך מובילה לרגע הזה")}
          </p>
          <h2 id="journey-peak-heading">
            {t("Then the jungle opens.", "ואז הג׳ונגל נפתח.")}
          </h2>
          <p>
            {t(
              "No schedule to keep. No strangers to catch up with. Just the place you came this far to find.",
              "אין לוח זמנים לרדוף אחריו. אין זרים להדביק. רק המקום שבאתם עד כאן כדי למצוא."
            )}
          </p>
        </div>
      </section>

      <section
        className="journey-confidence"
        aria-labelledby="confidence-heading"
      >
        <div className="container journey-confidence__grid">
          <div>
            <p className="journey-label">
              {t("Adventure with a steady hand", "הרפתקה ביד בטוחה")}
            </p>
            <h2 id="confidence-heading">
              {t(
                "The details are part of the route.",
                "הפרטים הם חלק מהמסלול."
              )}
            </h2>
          </div>
          <div className="journey-confidence__list">
            <article>
              <span>01</span>
              <h3>{t("Private by design", "פרטי מהיסוד")}</h3>
              <p>
                {t(
                  "Your vehicle, your people, your pace. The day is shaped around the group in front of us.",
                  "הרכב שלכם, האנשים שלכם, הקצב שלכם. היום נבנה סביב הקבוצה שלכם."
                )}
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>{t("Hebrew when it matters", "עברית כשזה חשוב")}</h3>
              <p>
                {t(
                  "Talk through the route, pickup, food and practical questions in English or Hebrew before you confirm.",
                  "מדברים על המסלול, האיסוף, האוכל והפרטים בעברית או באנגלית לפני האישור."
                )}
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>{t("Respect without compromise", "כבוד ללא פשרות")}</h3>
              <p>
                {t(
                  "Kosher-aware meal planning and Shabbat-sensitive scheduling are part of the conversation from the start.",
                  "תכנון אוכל מודע כשרות ותכנון רגיש לשבת הם חלק מהשיחה מההתחלה."
                )}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="journey-regions" aria-labelledby="regions-heading">
        <div className="container">
          <div className="journey-regions__heading">
            <div>
              <p className="journey-label">
                {t("Beyond one destination", "מעבר ליעד אחד")}
              </p>
              <h2 id="regions-heading">
                {t(
                  "One region. Many ways through.",
                  "אזור אחד. דרכים רבות לחצות אותו."
                )}
              </h2>
            </div>
            <p>
              {t(
                "Start in Chiang Mai, or tell us where your wider Indochina journey begins. We will start with the people and build from there.",
                "מתחילים בצ׳יאנג מאי, או מספרים לנו היכן מתחיל המסע הרחב יותר שלכם בהודו-סין. מתחילים באנשים ובונים משם."
              )}
            </p>
          </div>
          <div className="journey-regions__cards">
            {regions.map(region => (
              <article key={region.name}>
                <img
                  src={region.image}
                  alt={t(region.name, region.nameHe)}
                  width="800"
                  height="700"
                  loading="lazy"
                />
                <div>
                  <h3>{t(region.name, region.nameHe)}</h3>
                  <p>{t(region.detail, region.detailHe)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="journey-close" aria-labelledby="close-heading">
        <div className="container journey-close__grid">
          <div>
            <p className="journey-label">
              {t("Your route starts here", "המסלול שלכם מתחיל כאן")}
            </p>
            <h2 id="close-heading">
              {t(
                "Bring the people. We will find the road.",
                "תביאו את האנשים. אנחנו נמצא את הדרך."
              )}
            </h2>
          </div>
          <div className="journey-close__action">
            <p>
              {t(
                "Tell WIRO your dates, group and the places you want to feel. Planning begins on WhatsApp.",
                "ספרו ל-WIRO על התאריכים, הקבוצה והמקומות שתרצו להרגיש. התכנון מתחיל בוואטסאפ."
              )}
            </p>
            <TrackedWhatsAppLink
              sourceCode={language === "he" ? "HOME-HERO-HE" : "HOME-HERO-EN"}
              humanMessage={whatsappMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="journey-cta"
            >
              <MessageCircle aria-hidden="true" />
              {t("Plan with WIRO", "תכננו עם WIRO")}
            </TrackedWhatsAppLink>
            <Link href="/tours" className="journey-secondary">
              {t("See current tours", "למסלולים הקיימים")}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
