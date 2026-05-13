import posthog from "posthog-js";

if (typeof window !== "undefined") {
  const flag = (window as any).__posthog_initialized;
  if (!flag) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      defaults: "2026-01-30",
      capture_exceptions: true,
      debug: false,
    });
    (window as any).__posthog_initialized = true;
  }
}
