"use client";

import { useEffect, useRef } from "react";

export default function VisitLogger() {
  const hasLogged = useRef(false);

  useEffect(() => {
    if (hasLogged.current) return;
    hasLogged.current = true;

    const logVisit = async () => {
      try {
        const data = {
          url: window.location.href,
          referrer: document.referrer || "Direct",
          screen: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          // @ts-ignore - navigator.platform is deprecated but still widely available
          platform: navigator.platform || "unknown",
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

    const timeout = setTimeout(logVisit, 1000);
    return () => clearTimeout(timeout);
  }, []);

  return null;
}
