import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type MouseEvent,
} from "react";

import type { WhatsAppSourceCode } from "@shared/whatsappAttribution";

import { trackEvent } from "@/lib/analytics";
import { buildTrackedWhatsAppLink } from "@/lib/whatsappAttribution";

export interface TrackedWhatsAppLinkProps extends Omit<
  ComponentPropsWithoutRef<"a">,
  "href"
> {
  sourceCode: WhatsAppSourceCode;
  humanMessage: string;
  tour?: string;
}

export const TrackedWhatsAppLink = forwardRef<
  HTMLAnchorElement,
  TrackedWhatsAppLinkProps
>(function TrackedWhatsAppLink(
  { sourceCode, humanMessage, tour, onClick, ...anchorProps },
  ref
) {
  const tracked = buildTrackedWhatsAppLink({ sourceCode, humanMessage });

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    trackEvent("whatsapp_click", {
      ...tracked.eventProperties,
      ...(tour ? { tour } : {}),
    });
  };

  return (
    <a {...anchorProps} ref={ref} href={tracked.href} onClick={handleClick} />
  );
});
