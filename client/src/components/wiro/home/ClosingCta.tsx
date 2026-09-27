import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { photo } from "@/data/wiroTours";
import { WaCta } from "../WaCta";

export function ClosingCta() {
  const { t } = useLanguage();
  return (
    <section className="wx wx-cta" aria-labelledby="wx-cta-title">
      <img
        src={photo("mountain_sunset_golden").lg}
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
      <div className="wx-cta__shade" />
      <div
        style={{
          position: "relative",
          maxWidth: 820,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2
          id="wx-cta-title"
          className="wx-h2"
          style={{
            fontSize: "clamp(44px,7vw,96px)",
            lineHeight: 0.98,
            margin: 0,
          }}
        >
          {t("Let's plan your day", "בואו נתכנן את היום שלכם")}
        </h2>
        <p
          style={{
            fontSize: 19,
            lineHeight: 1.6,
            margin: "22px auto 0",
            maxWidth: 560,
            color: "rgba(251,248,241,0.9)",
          }}
        >
          {t(
            "Send your dates, group size and pickup area. We reply on WhatsApp.",
            "שלחו תאריכים, גודל קבוצה ואזור איסוף. אנחנו עונים בוואטסאפ."
          )}
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
            marginTop: 32,
          }}
        >
          <WaCta source="HOME-INQUIRY">
            {t("Chat on WhatsApp", "דברו איתנו בוואטסאפ")}
          </WaCta>
          <Link href="/book" className="wx-btn wx-btn--ghost-light">
            {t("Plan my day", "תכננו לי יום")}
          </Link>
        </div>
      </div>
    </section>
  );
}
