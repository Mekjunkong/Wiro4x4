import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { trpc } from "@/lib/trpc";
import { trackEvent } from "@/lib/analytics";
import { getStoredUtm } from "@/lib/utm";
import { captureReferralFromUrl, clearReferralCode } from "@/lib/referral";
import { buildTrackedWhatsAppLink } from "@/lib/whatsappAttribution";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppIcon } from "@/components/wiro/icons";
import {
  DURATION_HE,
  depositFor,
  formatBaht,
  getWiroTours,
  photo,
} from "@/data/wiroTours";
import { COMPANY_EMAIL } from "@/const";

type Level = "none" | "friendly" | "glatt" | "mehadrin";
const LEVELS: readonly {
  k: Level;
  en: [string, string];
  he: [string, string];
}[] = [
  {
    k: "friendly",
    en: [
      "Kosher-friendly",
      "Kosher ingredients, planned with you before the day",
    ],
    he: ["ידידותי לכשרות", "חומרי גלם כשרים, בתיאום איתכם לפני היום"],
  },
  {
    k: "glatt",
    en: ["Glatt", "Ask for glatt — we confirm what is feasible"],
    he: ["גלאט", "בקשו גלאט — נאשר מה אפשרי"],
  },
  {
    k: "mehadrin",
    en: ["Mehadrin", "Ask for mehadrin — arranged in advance if available"],
    he: ["מהדרין", "בקשו מהדרין — בתיאום מראש לפי זמינות"],
  },
  {
    k: "none",
    en: ["No kosher needs", "Regular local food"],
    he: ["ללא צורך בכשרות", "אוכל מקומי רגיל"],
  },
];

interface Draft {
  tour: string;
  date: string | null;
  adults: number;
  kids: number;
  level: Level;
  hebrewGuide: boolean;
  notes: string;
  name: string;
  phone: string;
  email: string;
  hotel: string;
}

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function Book() {
  const { t, language } = useLanguage();
  const [, navigate] = useLocation();
  const he = language === "he";
  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  // Package, multi-tour and saved-draft links belong to the full trip planner.
  useEffect(() => {
    if (params.get("tours") || params.get("package") || params.get("token")) {
      navigate(`/plan-trip${window.location.search}`, { replace: true });
    }
  }, [navigate, params]);

  usePageMeta({
    title: t(
      "Book a Private 4x4 Day | WIRO 4x4",
      "הזמנת יום 4x4 פרטי | WIRO 4x4"
    ),
    description: t(
      "Pick a tour, a date and your group. WIRO confirms availability and kosher-friendly meal planning with you on WhatsApp.",
      "בחרו טיול, תאריך וקבוצה. WIRO מאשרת איתכם זמינות ותכנון אוכל כשר בוואטסאפ."
    ),
    canonicalPath: "/book",
  });

  const { data: dbTours } = trpc.tour.list.useQuery();
  const tours = useMemo(
    () =>
      getWiroTours(
        (dbTours ?? []).map(r => ({
          slug: r.slug,
          price: r.price,
          duration: r.duration,
          difficulty: r.difficulty,
        }))
      ),
    [dbTours]
  );

  const requested = params.get("tour");
  const [step, setStep] = useState(() =>
    requested && tours.some(x => x.slug === requested) ? 2 : 1
  );
  const [bk, setBkState] = useState<Draft>(() => ({
    tour:
      requested && getWiroTours().some(x => x.slug === requested)
        ? requested
        : "doi-inthanon-roof-of-thailand",
    date: null,
    adults: 2,
    kids: 0,
    level: "friendly",
    hebrewGuide: true,
    notes: "",
    name: "",
    phone: "",
    email: "",
    hotel: "",
  }));
  const [err, setErr] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [sentRef, setSentRef] = useState<string | null>(null);
  const [referral, setReferral] = useState<string | null>(() =>
    captureReferralFromUrl()
  );
  const setBk = (patch: Partial<Draft>) => {
    setBkState(s => ({ ...s, ...patch }));
    setErr({});
  };

  useEffect(() => {
    trackEvent("booking_start", {
      page: "/book",
      placement: "booking-stepper",
      language,
    });
    // Fire once per visit.
  }, []);

  // Start two days out so every option clears the 24-hour notice window.
  const days = useMemo(() => {
    const d0 = new Date();
    return Array.from(
      { length: 28 },
      (_, i) => new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + i + 2)
    );
  }, []);
  const loc = he ? "he-IL" : "en-GB";
  const selTour = tours.find(x => x.slug === bk.tour) ?? tours[0];
  const selDay = days.find(d => isoDay(d) === bk.date);
  const dateTxt = selDay
    ? selDay.toLocaleDateString(loc, {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "—";
  const level = LEVELS.find(l => l.k === bk.level) ?? LEVELS[0];
  const groupTxt = he
    ? `${bk.adults} מבוגרים${bk.kids ? ` · ${bk.kids} ילדים` : ""}`
    : `${bk.adults} adult${bk.adults > 1 ? "s" : ""}${bk.kids ? ` · ${bk.kids} kid${bk.kids > 1 ? "s" : ""}` : ""}`;
  const tourName = selTour ? t(selTour.shortName[0], selTour.shortName[1]) : "";
  const summary = [
    { k: t("Date", "תאריך"), v: dateTxt },
    { k: t("Group", "קבוצה"), v: groupTxt },
    { k: t("Kosher", "כשרות"), v: t(level.en[0], level.he[0]) },
    ...(bk.name ? [{ k: t("Name", "שם"), v: bk.name }] : []),
  ];

  const message = he
    ? [
        `שלום WIRO! אשמח להזמין את ${tourName} בתאריך ${dateTxt} ל-${groupTxt}.`,
        `כשרות: ${level.he[0]}.${bk.hebrewGuide ? " מדריך דובר עברית." : ""}`,
        `שם: ${bk.name}.`,
        bk.hotel ? `מלון: ${bk.hotel}.` : "",
        bk.notes ? `הערות: ${bk.notes}` : "",
      ]
    : [
        `Hi WIRO! I'd like to book ${tourName} on ${dateTxt} for ${groupTxt}.`,
        `Kosher level: ${level.en[0]}.${bk.hebrewGuide ? " Hebrew-speaking guide, please." : ""}`,
        `Name: ${bk.name}.`,
        bk.hotel ? `Hotel: ${bk.hotel}.` : "",
        bk.notes ? `Notes: ${bk.notes}` : "",
      ];
  const messageText = message.filter(Boolean).join("\n");

  const openWhatsApp = (ref?: string) => {
    const tracked = buildTrackedWhatsAppLink({
      sourceCode: he ? "BOOKING-SUBMIT-HE" : "BOOKING-SUBMIT-EN",
      humanMessage: ref
        ? `${messageText}\n${he ? "מספר בקשה" : "Request"}: ${ref}`
        : messageText,
    });
    trackEvent("whatsapp_click", { ...tracked.eventProperties, tour: bk.tour });
    window.open(tracked.href, "_blank", "noopener");
  };

  const validate = (which: number[]) => {
    const e: Record<string, string> = {};
    if (which.includes(2) && !bk.date)
      e.date = t("Pick a date to continue", "בחרו תאריך כדי להמשיך");
    if (which.includes(4)) {
      if (bk.name.trim().length < 2)
        e.name = t("Tell us your name", "איך קוראים לכם?");
      const phone = bk.phone.trim();
      if (phone.replace(/\D/g, "").length < 8 || !/^[\d+\s\-()]+$/.test(phone))
        e.phone = t(
          "WhatsApp number, with country code",
          "מספר וואטסאפ, כולל קידומת"
        );
      if (bk.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bk.email))
        e.email = t(
          "Please enter a valid email address",
          "יש להזין כתובת מייל תקינה"
        );
      if (!consent)
        e.consent = t(
          "Please agree to the Terms of Service and Privacy Policy",
          "יש לאשר את תנאי השירות ומדיניות הפרטיות"
        );
    }
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const createBooking = trpc.booking.create.useMutation();
  const submit = async () => {
    if (!validate([2, 4])) {
      setStep(!bk.date ? 2 : 4);
      return;
    }
    if (!selTour || !bk.date) return;
    const next = new Date(`${bk.date}T00:00:00`);
    next.setDate(next.getDate() + 1);
    const utm = getStoredUtm();
    const request = [
      `Selected route: ${selTour.name} (${selTour.slug})`,
      `Kosher level: ${level.en[0]}`,
      bk.hebrewGuide ? "Hebrew-speaking guide requested" : "",
      bk.notes ? `Notes: ${bk.notes}` : "",
    ]
      .filter(Boolean)
      .join(". ");
    try {
      const res = await createBooking.mutateAsync({
        contactName: bk.name.trim(),
        contactEmail: bk.email.trim(),
        contactPhone: bk.phone.trim(),
        contactWhatsApp: bk.phone.trim(),
        arrivalDate: bk.date,
        departureDate: isoDay(next),
        numberOfAdults: bk.adults,
        hasChildren: bk.kids > 0,
        numberOfChildren: bk.kids || undefined,
        includesTrip: true,
        includesGuide: bk.hebrewGuide,
        includesFood: bk.level !== "none",
        foodPreferences: bk.level === "none" ? undefined : level.en[0],
        pickupPoint: bk.hotel ? "custom" : "hotel",
        customPickupLocation: bk.hotel || undefined,
        dropoffPoint: bk.hotel ? "custom" : "hotel",
        customDropoffLocation: bk.hotel || undefined,
        suggestedDestinations: JSON.stringify(["chiang-mai"]),
        specialRequests: request.slice(0, 1000),
        utmSource: utm?.utm_source,
        utmMedium: utm?.utm_medium,
        utmCampaign: utm?.utm_campaign,
        source: referral ? `referral:${referral}` : "website",
      });
      const ref = `WIRO-${res.bookingId || Date.now()}`;
      setSentRef(ref);
      setReferral(null);
      clearReferralCode();
      trackEvent("booking_complete", {
        page: "/book",
        placement: "booking-stepper",
        language,
        tour: bk.tour,
      });
      openWhatsApp(ref);
      window.scrollTo(0, 0);
    } catch (e) {
      console.error(e);
      toast.error(
        t(
          "We couldn't save your request. Please try again or message us on WhatsApp.",
          "לא הצלחנו לשמור את הבקשה. נסו שוב או כתבו לנו בוואטסאפ."
        )
      );
    }
  };

  const goStep = (n: number) => {
    if (n < step || validate(Array.from({ length: n - 1 }, (_, k) => k + 1))) {
      setStep(n);
    }
  };
  const stepLabels = [
    t("Tour", "טיול"),
    t("Date & group", "תאריך וקבוצה"),
    t("Kosher", "כשרות"),
    t("Details", "פרטים"),
  ];
  const deposit = depositFor(selTour?.price);

  return (
    <div className="wx" style={{ minHeight: "100vh" }}>
      <Header />
      <main id="main-content">
        <section
          style={{
            padding:
              "clamp(112px,12vw,152px) clamp(16px,3vw,32px) clamp(80px,10vw,128px)",
          }}
        >
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <p
              className="wx-caps"
              style={{ color: "var(--wx-gold-ink)", margin: 0 }}
            >
              {t("Booking", "הזמנה")}
            </p>
            <h1
              className="wx-serif"
              style={{
                fontSize: "clamp(44px,6.5vw,88px)",
                lineHeight: 0.95,
                margin: "12px 0 0",
              }}
            >
              {t("Book your day", "הזמינו את היום שלכם")}
            </h1>
            <p className="wx-lede" style={{ margin: "16px 0 0" }}>
              {t(
                "Four quick choices. No payment now — we confirm everything with you on WhatsApp.",
                "ארבע בחירות קצרות. אין תשלום עכשיו — את כל השאר נסגור איתכם בוואטסאפ."
              )}
            </p>

            {sentRef ? (
              <div
                className="wx-panel-dark"
                style={{
                  marginTop: 40,
                  maxWidth: 720,
                  padding: "clamp(28px,5vw,56px)",
                }}
                role="status"
              >
                <h2
                  className="wx-serif"
                  style={{
                    fontSize: "clamp(34px,4.5vw,52px)",
                    lineHeight: 1.05,
                    margin: 0,
                  }}
                >
                  {t(
                    "Request sent — check WhatsApp",
                    "הבקשה נשלחה — בדקו בוואטסאפ"
                  )}
                </h2>
                <p
                  style={{
                    fontSize: 17,
                    lineHeight: 1.6,
                    color: "rgba(251,248,241,0.85)",
                    margin: "14px 0 0",
                  }}
                >
                  {t(
                    "We saved your request and opened WhatsApp with the details. We reply there with a confirmation and deposit details.",
                    "שמרנו את הבקשה ופתחנו וואטסאפ עם הפרטים. נענה שם עם אישור ופרטי מקדמה."
                  )}
                </p>
                <div className="wx-aside__rows">
                  <div>
                    <span>{t("Reference", "מספר בקשה")}</span>
                    <span dir="ltr">{sentRef}</span>
                  </div>
                  <div>
                    <span>{t("Tour", "טיול")}</span>
                    <span>{tourName}</span>
                  </div>
                  {summary.map(r => (
                    <div key={r.k}>
                      <span>{r.k}</span>
                      <span>{r.v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <button
                    type="button"
                    className="wx-btn wx-btn--gold"
                    onClick={() => openWhatsApp(sentRef)}
                  >
                    <WhatsAppIcon />
                    {t("Open WhatsApp again", "פתחו שוב את וואטסאפ")}
                  </button>
                  <Link href="/" className="wx-btn wx-btn--ghost-light">
                    {t("Back to home", "חזרה לדף הבית")}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <nav
                  className="wx-steps"
                  aria-label={t("Booking steps", "שלבי ההזמנה")}
                >
                  {stepLabels.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => goStep(i + 1)}
                      className={`wx-step ${i + 1 === step ? "is-on" : i + 1 < step ? "is-done" : ""}`}
                      aria-current={i + 1 === step ? "step" : undefined}
                    >
                      <div
                        className="wx-latin"
                        style={{ fontSize: 20 }}
                      >{`0${i + 1}`}</div>
                      <div
                        className="wx-caps"
                        style={{ fontSize: 11, marginTop: 2 }}
                      >
                        {label}
                      </div>
                    </button>
                  ))}
                </nav>

                <div className="wx-book__grid">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                      minWidth: 0,
                    }}
                  >
                    {step === 1 && (
                      <div className="wx-panel">
                        <h2>{t("Which trail?", "איזה שביל?")}</h2>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(min(100%,240px),1fr))",
                            gap: 12,
                            marginTop: 18,
                          }}
                        >
                          {tours.map(x => (
                            <button
                              key={x.slug}
                              type="button"
                              className={`wx-opt ${x.slug === bk.tour ? "is-on" : ""}`}
                              aria-pressed={x.slug === bk.tour}
                              onClick={() => setBk({ tour: x.slug })}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "64px minmax(0,1fr)",
                                gap: 12,
                                alignItems: "center",
                              }}
                            >
                              <img
                                src={photo(x.image).sm}
                                alt=""
                                style={{
                                  width: 64,
                                  height: 64,
                                  objectFit: "cover",
                                  borderRadius: 4,
                                }}
                              />
                              <span
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 3,
                                  minWidth: 0,
                                }}
                              >
                                <span
                                  className="wx-serif"
                                  style={{ fontSize: 19, lineHeight: 1.1 }}
                                >
                                  {t(x.shortName[0], x.shortName[1])}
                                </span>
                                <span
                                  style={{
                                    fontSize: 13,
                                    color: "var(--wx-muted)",
                                  }}
                                >
                                  {he
                                    ? (DURATION_HE[x.duration] ?? x.duration)
                                    : x.duration}{" "}
                                  · {formatBaht(x.price)}
                                </span>
                              </span>
                            </button>
                          ))}
                        </div>
                        <p
                          style={{
                            fontSize: 14,
                            color: "var(--wx-muted)",
                            margin: "18px 0 0",
                          }}
                        >
                          {t(
                            "Several days, hotels or a custom route? ",
                            "כמה ימים, מלונות או מסלול מותאם? "
                          )}
                          <Link
                            href="/plan-trip"
                            style={{ color: "var(--wx-gold-ink)" }}
                          >
                            {t(
                              "Use the full trip planner",
                              "לטופס תכנון הטיול המלא"
                            )}
                          </Link>
                        </p>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="wx-panel">
                        <h2>
                          {t("When, and who's coming?", "מתי, ומי מגיע?")}
                        </h2>
                        <p
                          style={{
                            fontSize: 14,
                            color: "var(--wx-muted)",
                            margin: "0 0 18px",
                          }}
                        >
                          {t(
                            "Keeping Shabbat? Friday and Saturday are marked — tell us and we plan around them.",
                            "שומרים שבת? ימי שישי ושבת מסומנים — ספרו לנו ונתכנן סביבם."
                          )}
                        </p>
                        <div
                          className="wx-days"
                          role="group"
                          aria-label={t("Pick a date", "בחרו תאריך")}
                        >
                          {days.map(d => {
                            const iso = isoDay(d);
                            const shabbat =
                              d.getDay() === 5 || d.getDay() === 6;
                            return (
                              <button
                                key={iso}
                                type="button"
                                className={`wx-day ${bk.date === iso ? "is-on" : ""}`}
                                aria-pressed={bk.date === iso}
                                aria-label={d.toLocaleDateString(loc, {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                })}
                                onClick={() => setBk({ date: iso })}
                                style={
                                  shabbat && bk.date !== iso
                                    ? { background: "var(--wx-paper-2)" }
                                    : undefined
                                }
                              >
                                <span
                                  className="wx-caps"
                                  style={{ fontSize: 10 }}
                                >
                                  {d.toLocaleDateString(loc, {
                                    weekday: "short",
                                  })}
                                </span>
                                <span
                                  className="wx-latin"
                                  style={{ fontSize: 22, lineHeight: 1 }}
                                >
                                  {d.getDate()}
                                </span>
                                <span style={{ fontSize: 10 }}>
                                  {d.toLocaleDateString(loc, {
                                    month: "short",
                                  })}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {err.date && (
                          <p className="wx-err" role="alert">
                            {err.date}
                          </p>
                        )}
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--wx-muted)",
                            margin: "10px 0 0",
                          }}
                        >
                          {t(
                            "Later date? Mention it in the notes or ",
                            "תאריך מאוחר יותר? ציינו בהערות או "
                          )}
                          <Link
                            href="/plan-trip"
                            style={{ color: "var(--wx-gold-ink)" }}
                          >
                            {t("use the full planner", "השתמשו בטופס המלא")}
                          </Link>
                          .
                        </p>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(220px,1fr))",
                            gap: 16,
                            marginTop: 26,
                          }}
                        >
                          {(
                            [
                              ["adults", t("Adults", "מבוגרים"), "13+", 1],
                              [
                                "kids",
                                t("Kids", "ילדים"),
                                t("Under 13", "עד גיל 13"),
                                0,
                              ],
                            ] as const
                          ).map(([key, label, hint, min]) => (
                            <div key={key} className="wx-counter">
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 16 }}>
                                  {label}
                                </div>
                                <div
                                  style={{
                                    fontSize: 13,
                                    color: "var(--wx-muted)",
                                  }}
                                >
                                  {hint}
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                }}
                              >
                                <button
                                  type="button"
                                  aria-label={t(
                                    `Fewer ${label}`,
                                    `פחות ${label}`
                                  )}
                                  onClick={() =>
                                    setBk({ [key]: Math.max(min, bk[key] - 1) })
                                  }
                                >
                                  −
                                </button>
                                <span
                                  className="wx-latin"
                                  style={{
                                    fontSize: 26,
                                    minWidth: 22,
                                    textAlign: "center",
                                  }}
                                  aria-live="polite"
                                >
                                  {bk[key]}
                                </span>
                                <button
                                  type="button"
                                  aria-label={t(
                                    `More ${label}`,
                                    `יותר ${label}`
                                  )}
                                  onClick={() =>
                                    setBk({ [key]: Math.min(30, bk[key] + 1) })
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {bk.adults + bk.kids > 6 && (
                          <p className="wx-note">
                            {t(
                              `${bk.adults + bk.kids} travelers — we'll confirm the vehicles and final price on WhatsApp.`,
                              `${bk.adults + bk.kids} נוסעים — נאשר את מספר הרכבים והמחיר הסופי בוואטסאפ.`
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    {step === 3 && (
                      <div className="wx-panel">
                        <h2>{t("Your kosher level", "רמת הכשרות שלכם")}</h2>
                        <p
                          style={{
                            fontSize: 14,
                            color: "var(--wx-muted)",
                            margin: "0 0 18px",
                          }}
                        >
                          {t(
                            "We plan the meal before your day and confirm what is feasible for your level.",
                            "אנחנו מתכננים את הארוחה לפני היום ומאשרים מה אפשרי לרמה שלכם."
                          )}
                        </p>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(180px,1fr))",
                            gap: 10,
                          }}
                        >
                          {LEVELS.map(l => (
                            <button
                              key={l.k}
                              type="button"
                              className={`wx-opt ${bk.level === l.k ? "is-on" : ""}`}
                              aria-pressed={bk.level === l.k}
                              onClick={() => setBk({ level: l.k })}
                              style={{
                                padding: 16,
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                              }}
                            >
                              <span
                                className="wx-serif"
                                style={{ fontSize: 22 }}
                              >
                                {t(l.en[0], l.he[0])}
                              </span>
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "var(--wx-muted)",
                                  lineHeight: 1.45,
                                }}
                              >
                                {t(l.en[1], l.he[1])}
                              </span>
                            </button>
                          ))}
                        </div>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginTop: 22,
                            fontSize: 15,
                            minHeight: 44,
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={bk.hebrewGuide}
                            onChange={e =>
                              setBk({ hebrewGuide: e.target.checked })
                            }
                            style={{
                              width: 20,
                              height: 20,
                              accentColor: "var(--wx-gold-ink)",
                            }}
                          />
                          {t(
                            "We'd like a Hebrew-speaking guide",
                            "נשמח למדריך דובר עברית"
                          )}
                        </label>
                        <div className="wx-field" style={{ marginTop: 18 }}>
                          <label htmlFor="bk-notes">
                            {t(
                              "Anything else? (optional)",
                              "משהו נוסף? (לא חובה)"
                            )}
                          </label>
                          <textarea
                            id="bk-notes"
                            className="wx-input"
                            rows={3}
                            maxLength={600}
                            value={bk.notes}
                            onChange={e => setBk({ notes: e.target.value })}
                            placeholder={t(
                              "Allergies, kids' ages, pickup time…",
                              "אלרגיות, גילאי הילדים, שעת איסוף…"
                            )}
                            style={{ resize: "vertical" }}
                          />
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="wx-panel">
                        <h2 style={{ marginBottom: 18 }}>
                          {t("How do we reach you?", "איך נשיג אתכם?")}
                        </h2>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(220px,1fr))",
                            gap: 16,
                          }}
                        >
                          <div className="wx-field">
                            <label htmlFor="contactName">
                              {t("Your name", "השם שלכם")}
                            </label>
                            <input
                              id="contactName"
                              className={`wx-input ${err.name ? "is-bad" : ""}`}
                              value={bk.name}
                              autoComplete="name"
                              onChange={e => setBk({ name: e.target.value })}
                              placeholder={t("Full name", "שם מלא")}
                              aria-invalid={!!err.name}
                            />
                            {err.name && (
                              <p className="wx-err" role="alert">
                                {err.name}
                              </p>
                            )}
                          </div>
                          <div className="wx-field">
                            <label htmlFor="contactPhone">
                              {t("WhatsApp number", "מספר וואטסאפ")}
                            </label>
                            <input
                              id="contactPhone"
                              className={`wx-input ${err.phone ? "is-bad" : ""}`}
                              value={bk.phone}
                              dir="ltr"
                              inputMode="tel"
                              autoComplete="tel"
                              onChange={e => setBk({ phone: e.target.value })}
                              placeholder="+972 50 123 4567"
                              aria-invalid={!!err.phone}
                              style={{ textAlign: "start" }}
                            />
                            {err.phone && (
                              <p className="wx-err" role="alert">
                                {err.phone}
                              </p>
                            )}
                          </div>
                          <div className="wx-field">
                            <label htmlFor="contactEmail">
                              {t("Email (optional)", "מייל (לא חובה)")}
                            </label>
                            <input
                              id="contactEmail"
                              type="email"
                              className={`wx-input ${err.email ? "is-bad" : ""}`}
                              value={bk.email}
                              dir="ltr"
                              autoComplete="email"
                              onChange={e => setBk({ email: e.target.value })}
                              aria-invalid={!!err.email}
                              style={{ textAlign: "start" }}
                            />
                            {err.email && (
                              <p className="wx-err" role="alert">
                                {err.email}
                              </p>
                            )}
                          </div>
                          <div className="wx-field">
                            <label htmlFor="bk-hotel">
                              {t(
                                "Hotel in Chiang Mai (optional)",
                                "מלון בצ'יאנג מאי (לא חובה)"
                              )}
                            </label>
                            <input
                              id="bk-hotel"
                              className="wx-input"
                              value={bk.hotel}
                              maxLength={300}
                              onChange={e => setBk({ hotel: e.target.value })}
                              placeholder={t(
                                "Where should we pick you up?",
                                "מאיפה לאסוף אתכם?"
                              )}
                            />
                          </div>
                        </div>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            marginTop: 20,
                            fontSize: 14,
                            lineHeight: 1.5,
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={consent}
                            onChange={e => {
                              setConsent(e.target.checked);
                              setErr({});
                            }}
                            style={{
                              width: 20,
                              height: 20,
                              marginTop: 1,
                              accentColor: "var(--wx-gold-ink)",
                            }}
                          />
                          <span>
                            {t("I agree to the ", "אני מסכים/ה ל")}
                            <Link
                              href="/terms"
                              style={{ color: "var(--wx-gold-ink)" }}
                            >
                              {t("Terms of Service", "תנאי השירות")}
                            </Link>
                            {t(" and ", " ול")}
                            <Link
                              href="/privacy"
                              style={{ color: "var(--wx-gold-ink)" }}
                            >
                              {t("Privacy Policy", "מדיניות הפרטיות")}
                            </Link>
                            .
                          </span>
                        </label>
                        {err.consent && (
                          <p className="wx-err" role="alert">
                            {err.consent}
                          </p>
                        )}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      {step > 1 && (
                        <button
                          type="button"
                          className="wx-btn wx-btn--ghost"
                          onClick={() => setStep(s => Math.max(1, s - 1))}
                        >
                          {t("Back", "חזרה")}
                        </button>
                      )}
                      {step < 4 ? (
                        <button
                          type="button"
                          className="wx-btn wx-btn--ink"
                          onClick={() => {
                            if (validate(step === 2 ? [2] : [])) {
                              setStep(step + 1);
                              window.scrollTo(0, 0);
                            }
                          }}
                        >
                          {t("Continue", "המשך")}
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="wx-btn wx-btn--solid"
                            onClick={submit}
                            disabled={createBooking.isPending}
                          >
                            <WhatsAppIcon />
                            {createBooking.isPending
                              ? t("Sending…", "שולחים…")
                              : t("Send on WhatsApp", "שליחה בוואטסאפ")}
                          </button>
                          <a
                            href={`mailto:${COMPANY_EMAIL}?subject=${encodeURIComponent(`Booking — ${selTour?.name ?? ""}`)}&body=${encodeURIComponent(messageText)}`}
                            style={{
                              color: "var(--wx-muted)",
                              textDecoration: "underline",
                              fontSize: 15,
                              padding: "12px 6px",
                            }}
                          >
                            {t("Or email us instead", "או שליחה במייל")}
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  <aside
                    className="wx-summary"
                    aria-label={t("Your day", "היום שלכם")}
                  >
                    {selTour && (
                      <div
                        style={{ position: "relative", aspectRatio: "16 / 9" }}
                      >
                        <img
                          src={photo(selTour.image).md}
                          alt=""
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(to top, rgba(28,28,28,1), rgba(28,28,28,0.1))",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            insetInline: 24,
                            bottom: 14,
                          }}
                        >
                          <div
                            className="wx-caps"
                            style={{ fontSize: 11, color: "var(--wx-gold)" }}
                          >
                            {t("Your day", "היום שלכם")}
                          </div>
                          <div
                            className="wx-serif"
                            style={{
                              fontSize: 28,
                              lineHeight: 1.1,
                              marginTop: 4,
                            }}
                          >
                            {tourName}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="wx-summary__rows">
                      {summary.map(r => (
                        <div key={r.k}>
                          <span>{r.k}</span>
                          <span style={{ textAlign: "end" }}>{r.v}</span>
                        </div>
                      ))}
                      <div
                        style={{
                          borderTop: "1px solid rgba(212,175,55,0.3)",
                          marginTop: 8,
                          paddingTop: 14,
                          alignItems: "baseline",
                        }}
                      >
                        <span>{t("From, per vehicle", "החל מ־, לרכב")}</span>
                        <span
                          className="wx-latin"
                          style={{ fontSize: 36, color: "var(--wx-gold)" }}
                        >
                          {formatBaht(selTour?.price)}
                        </span>
                      </div>
                      {deposit != null && (
                        <div style={{ fontSize: 14 }}>
                          <span>{t("Deposit (30%)", "מקדמה (30%)")}</span>
                          <span>{formatBaht(deposit)}</span>
                        </div>
                      )}
                      <p
                        style={{
                          fontSize: 13,
                          lineHeight: 1.55,
                          color: "rgba(251,248,241,0.65)",
                          margin: "8px 0 0",
                        }}
                      >
                        {t(
                          "No payment now — we confirm availability and the final price on WhatsApp.",
                          "אין תשלום עכשיו — נאשר זמינות ומחיר סופי בוואטסאפ."
                        )}
                      </p>
                    </div>
                  </aside>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
