import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

import { trackEvent } from "@/lib/analytics";
import {
  createBehaviorTrackingState,
  getCommercialRoute,
  recordScrollDepth,
} from "@/lib/behaviorTracking";

export function useBehaviorTracking(language: string): void {
  const [page] = useLocation();
  const languageRef = useRef(language);
  const stateRef = useRef(createBehaviorTrackingState(page));

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    stateRef.current = createBehaviorTrackingState(page);
    const route = getCommercialRoute(page);
    if (route) {
      trackEvent("commercial_page_view", {
        page,
        placement: route.id,
        language: languageRef.current,
      });
    }

    // Only real user scrolls count. The header dispatches a synthetic scroll
    // right after navigation, and measuring at mount (before the lazy page
    // renders, while the document is short) logged 25/50/90% for every view.
    const handleScroll = (event: Event) => {
      if (!event.isTrusted) return;
      const documentHeight = document.documentElement.scrollHeight;
      if (documentHeight <= 0) return;
      const percentage = Math.min(
        100,
        ((window.scrollY + window.innerHeight) / documentHeight) * 100
      );
      const result = recordScrollDepth(stateRef.current, page, percentage);
      stateRef.current = result.state;
      for (const depth of result.depths) {
        trackEvent("scroll_depth", {
          page,
          language: languageRef.current,
          depth,
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page]);
}
