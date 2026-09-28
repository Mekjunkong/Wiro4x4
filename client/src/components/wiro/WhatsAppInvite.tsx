import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { COOKIE_CONSENT_EVENT, COOKIE_CONSENT_KEY } from "@/lib/cookieConsent";
import {
  addElapsed,
  isInviteSnoozed,
  shouldShowInvite,
  snoozeInvite,
} from "@/lib/whatsappInvite";
import { photo } from "@/data/wiroTours";
import { WaCta } from "./WaCta";

const TICK_MS = 1_000;

function readStorage(kind: "local" | "session") {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function cookieBannerOpen() {
  try {
    return !window.localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch {
    return false;
  }
}

/**
 * A small, non-blocking invitation from Wiro that appears once a visitor has
 * spent ~40s on the site. Shown at most once per visitor every 7 days, and
 * never again once they have opened any WhatsApp link.
 */
export function WhatsAppInvite() {
  const { t, language } = useLanguage();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const locationRef = useRef(location);
  locationRef.current = location;

  // Count visible time and decide when to show.
  useEffect(() => {
    const persistent = readStorage("local");
    const session = readStorage("session");
    if (!persistent || !session || isInviteSnoozed(persistent, Date.now())) {
      return undefined;
    }

    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      const visible = document.visibilityState === "visible";
      const elapsedMs = addElapsed(session, visible ? now - last : 0);
      last = now;
      if (
        shouldShowInvite({
          elapsedMs,
          path: locationRef.current,
          snoozed: isInviteSnoozed(persistent, now),
          cookieBannerOpen: cookieBannerOpen(),
        })
      ) {
        snoozeInvite(persistent, now); // once per visitor, even if ignored
        setOpen(true);
        window.clearInterval(timer);
      }
    };
    const timer = window.setInterval(tick, TICK_MS);
    const resync = () => {
      last = Date.now();
    };
    document.addEventListener("visibilitychange", resync);
    window.addEventListener(COOKIE_CONSENT_EVENT, tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", resync);
      window.removeEventListener(COOKIE_CONSENT_EVENT, tick);
    };
  }, []);

  // Anyone who opens WhatsApp from anywhere on the site is already talking to
  // WIRO: never invite them again.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      const href = link?.getAttribute("href") ?? "";
      if (!/wa\.me|whatsapp\.com/i.test(href)) return;
      const persistent = readStorage("local");
      if (persistent) snoozeInvite(persistent, Date.now());
      setOpen(false);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <aside
      className="wx-invite"
      role="dialog"
      aria-modal="false"
      aria-labelledby="wx-invite-title"
      dir={language === "he" ? "rtl" : "ltr"}
    >
      <button
        type="button"
        className="wx-invite__close"
        onClick={() => setOpen(false)}
        aria-label={t("Close", "סגירה")}
      >
        <X aria-hidden="true" size={18} />
      </button>
      <img
        className="wx-invite__photo"
        src={photo("guide_wiro").md}
        width={800}
        height={533}
        alt={t(
          "Wiro giving a thumbs-up from the driver's seat",
          "וירו מרים אגודל מכיסא הנהג"
        )}
      />
      <div className="wx-invite__body">
        <h2 id="wx-invite-title" className="wx-invite__title">
          {t("Planning a trip up north?", "מתכננים טיול בצפון?")}
        </h2>
        <p className="wx-invite__text">
          {t(
            "Tell Wiro your dates. He'll suggest a private route that fits your group.",
            "ספרו לוירו מתי אתם מגיעים, והוא יציע מסלול פרטי שמתאים לקבוצה שלכם."
          )}
        </p>
        <WaCta
          source="GLOBAL-INVITE"
          className="wx-btn wx-btn--gold wx-btn--sharp wx-invite__cta"
        >
          {t("Chat with Wiro on WhatsApp", "דברו עם וירו בוואטסאפ")}
        </WaCta>
      </div>
    </aside>
  );
}
