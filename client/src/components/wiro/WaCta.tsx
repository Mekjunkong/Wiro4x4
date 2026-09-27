import type { ReactNode } from "react";
import type { WhatsAppSourceCode } from "@shared/whatsappAttribution";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrackedWhatsAppLink } from "@/components/TrackedWhatsAppLink";
import { WhatsAppIcon } from "./icons";

type SourceStem =
  | "HOME-HERO"
  | "HOME-INQUIRY"
  | "GLOBAL-HEADER"
  | "GLOBAL-FOOTER"
  | "TOUR-DETAIL"
  | "BOOKING-QUICK"
  | "TRIP-ALBUM";

export const WA_GENERAL: readonly [string, string] = [
  "Hi WIRO 4x4, I'd like to check availability for a private tour.\nDates: __\nGroup size: __\nPickup area or hotel: __\nKosher / Shabbat / Hebrew-guide needs: __",
  "שלום WIRO 4x4, אשמח לבדוק זמינות לטיול פרטי.\nתאריכים: __\nמספר מטיילים: __\nמלון או אזור איסוף: __\nצרכי כשרות / שבת / מדריך בעברית: __",
];

interface WaCtaProps {
  source: SourceStem;
  message?: readonly [string, string];
  className?: string;
  tour?: string;
  icon?: boolean;
  ariaLabel?: string;
  children: ReactNode;
}

/** A WhatsApp CTA that keeps the site's attribution tracking. */
export function WaCta({
  source,
  message = WA_GENERAL,
  className = "wx-btn wx-btn--gold",
  tour,
  icon = true,
  ariaLabel,
  children,
}: WaCtaProps) {
  const { language } = useLanguage();
  const sourceCode =
    `${source}-${language === "he" ? "HE" : "EN"}` as WhatsAppSourceCode;
  return (
    <TrackedWhatsAppLink
      sourceCode={sourceCode}
      humanMessage={language === "he" ? message[1] : message[0]}
      tour={tour}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
    >
      {icon && <WhatsAppIcon />}
      {children}
    </TrackedWhatsAppLink>
  );
}
