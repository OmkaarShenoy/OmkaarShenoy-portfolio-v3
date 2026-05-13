"use client";

import { useEffect, useRef } from "react";

export default function VisitLogger() {
  const hasLogged = useRef(false);

  useEffect(() => {
    if (hasLogged.current) return;
    hasLogged.current = true;

    const logVisit = async () => {
      try {
        let visitorId = localStorage.getItem("visitorId");
        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem("visitorId", visitorId);
        }

        let visitCount = parseInt(localStorage.getItem("visitCount") || "0");
        visitCount += 1;
        localStorage.setItem("visitCount", visitCount.toString());

        const url = new URL(window.location.href);
        const urlParams = url.searchParams;
        
        const campaign = {
          source: urlParams.get("utm_source") || null,
          medium: urlParams.get("utm_medium") || null,
          campaign: urlParams.get("utm_campaign") || null,
          ref: urlParams.get("ref") || urlParams.get("for") || null,
        };

        // Clean up tracking parameters from the URL immediately so the user doesn't see them
        const hasTrackingParams = ["utm_source", "utm_medium", "utm_campaign", "ref", "for"].some(param => urlParams.has(param));
        
        if (hasTrackingParams) {
          ["utm_source", "utm_medium", "utm_campaign", "ref", "for"].forEach(param => {
            urlParams.delete(param);
          });
          
          const newUrl = url.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : "") + url.hash;
          window.history.replaceState({}, document.title, newUrl);
        }

        // Use the original href for tracking purposes if needed, but here we just use the current path
        const data = {
          url: window.location.href, // This will be the cleaned URL, which is fine since we parsed the params
          referrer: document.referrer || "Direct",
          screen: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          // @ts-ignore - navigator.platform is deprecated but still widely available
          platform: navigator.platform || "unknown",
          visitorId,
          visitCount,
          campaign,
        };

        await fetch("/api/system/init", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("Failed to log visit:", error);
      }
    };

    // Log immediately instead of waiting, so the URL cleanup happens fast
    logVisit();
  }, []);

  return null;
}
