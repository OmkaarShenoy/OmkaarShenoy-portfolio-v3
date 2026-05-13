"use client";

import { usePathname } from "next/navigation";
import { CSPostHogProvider } from "@/providers/posthog-provider";
import VisitLogger from "@/components/visit-logger";

function isAdminRoute(pathname: string | null) {
  return pathname?.startsWith("/admin") ?? false;
}

export default function PostHogRouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isAdminRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <CSPostHogProvider>
      {children}
      <VisitLogger />
    </CSPostHogProvider>
  );
}