import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Fires a Meta Pixel PageView on every client-side route change.
//
// The Pixel is initialized once by the base snippet in index.html, which also
// fires the PageView for the initial load. This hook only tracks subsequent
// SPA navigations and never calls fbq('init') again.
export default function useMetaPixelPageView() {
  const location = useLocation();

  // The base snippet already counted the initial page, so skip the first run
  // to avoid a duplicate PageView on load.
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // Guard against SSR/prerender (no window) and against fbq not being ready
    // yet — the snippet may still be loading, or a blocker may have removed it.
    if (typeof window === "undefined" || typeof window.fbq !== "function") return;

    window.fbq("track", "PageView");
  }, [location.pathname, location.search]);
}
