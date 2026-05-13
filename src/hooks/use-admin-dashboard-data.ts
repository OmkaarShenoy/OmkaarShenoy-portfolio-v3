"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { generateInsights, processVisitorData, type Visit } from "@/lib/admin/admin-utils";

export function useAdminDashboardData() {
  const [rawVisits, setRawVisits] = useState<Visit[]>([]);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [excludeSelf, setExcludeSelf] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const excluded = localStorage.getItem("admin_exclude_self");
    if (excluded === "true") {
      setExcludeSelf(true);
    }
  }, []);

  const toggleExcludeSelf = useCallback(() => {
    setExcludeSelf((current) => {
      const next = !current;
      localStorage.setItem("admin_exclude_self", String(next));
      return next;
    });
  }, []);

  const fetchStats = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await res.json();
      setRawVisits(data.visits || []);
      setNotesMap(data.notes || {});
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchStats();

    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleLogout = useCallback(() => {
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/admin/login");
  }, [router]);

  const handleSaveNote = useCallback(async (id: string, note: string) => {
    try {
      await fetch("/api/admin/notes", {
        method: "POST",
        body: JSON.stringify({ id, note }),
        headers: { "Content-Type": "application/json" },
      });
      setNotesMap((prev) => ({ ...prev, [id]: note }));
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  }, []);

  const visits = useMemo(() => {
    if (!excludeSelf) return rawVisits;
    return rawVisits.filter((v) => !(v.location?.includes("Tempe") || v.location?.includes("Arizona")));
  }, [rawVisits, excludeSelf]);

  const profiles = useMemo(() => processVisitorData(visits, notesMap), [visits, notesMap]);
  const insights = useMemo(() => generateInsights(profiles), [profiles]);

  const profileLookup = useMemo(() => {
    const byId = new Map<string, (typeof profiles)[number]>();
    const byIp = new Map<string, (typeof profiles)[number]>();

    profiles.forEach((profile) => {
      byId.set(profile.id, profile);
      if (profile.ip) byIp.set(profile.ip, profile);
    });

    return { byId, byIp };
  }, [profiles]);

  const feedItems = useMemo(() => {
    return visits.slice(0, 50).map((v, i) => {
      const profile = (v.visitorId && profileLookup.byId.get(v.visitorId)) || (v.ip && profileLookup.byIp.get(v.ip));

      let sessionViews = 1;
      if (profile && profile.sessions.length > 0) {
        const session = profile.sessions.find(
          (s) =>
            new Date(v.timestamp).getTime() >= new Date(s.startTime).getTime() &&
            new Date(v.timestamp).getTime() <= new Date(s.endTime).getTime()
        );

        if (session) {
          const visitIndex = session.pages.findIndex((p) => p.timestamp === v.timestamp);
          sessionViews = visitIndex !== -1 ? visitIndex + 1 : 1;
        }
      }

      return {
        id: `${v.timestamp}-${i}`,
        timestamp: v.timestamp,
        isBot: !!v.isBot,
        location: v.location || "Unknown",
        device: v.device || "Unknown",
        url: v.url || "/",
        isReturn: profile ? profile.sessions.length > 1 : false,
        company: v.company,
        visitorId: profile ? profile.id : v.visitorId || v.ip,
        intentLevel: profile ? profile.engagementLevel : "Low",
        sessionViews,
      };
    });
  }, [visits, profileLookup]);

  const selectedProfile = useMemo(() => {
    if (!selectedProfileId) return null;
    return profiles.find((p) => p.id === selectedProfileId) || null;
  }, [profiles, selectedProfileId]);

  const totalVisits = visits.length;
  const humanVisits = visits.filter((v) => !v.isBot).length;
  const botVisits = totalVisits - humanVisits;
  const returningCount = profiles.filter((p) => !p.isBot && p.sessions.length > 1).length;
  const bounceRate =
    profiles.length > 0
      ? ((profiles.filter((p) => p.sessions.length === 1 && p.totalPageViews === 1).length / profiles.length) * 100).toFixed(1)
      : "0.0";

  const sparklineRecent = useMemo(() => {
    if (visits.length === 0) return Array(10).fill(0);

    const recent = visits.slice(0, 50);
    const counts = Array(10).fill(0);
    const now = Date.now();

    recent.forEach((v) => {
      const diffMs = now - new Date(v.timestamp).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 10) {
        counts[9 - diffHours] += 1;
      }
    });

    return counts;
  }, [visits]);

  const trafficData = useMemo(() => {
    const dailyMap: Record<string, { date: string; human: number; bot: number }> = {};

    visits.forEach((v) => {
      const date = new Date(v.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!dailyMap[date]) dailyMap[date] = { date, human: 0, bot: 0 };
      if (v.isBot) dailyMap[date].bot += 1;
      else dailyMap[date].human += 1;
    });

    return Object.values(dailyMap).reverse();
  }, [visits]);

  const heatmapData = useMemo(() => {
    return visits
      .filter((v) => !v.isBot)
      .map((v) => {
        const d = new Date(v.timestamp);
        return {
          day: d.toLocaleDateString("en-US", { weekday: "short" }),
          hour: d.getHours(),
          count: 1,
        };
      })
      .reduce((acc, curr) => {
        const existing = acc.find((item) => item.day === curr.day && item.hour === curr.hour);
        if (existing) existing.count += 1;
        else acc.push(curr);
        return acc;
      }, [] as { day: string; hour: number; count: number }[]);
  }, [visits]);

  const deviceData = useMemo(() => {
    const map: Record<string, number> = {};

    profiles
      .filter((p) => !p.isBot)
      .forEach((p) => {
        const device = p.device || "Unknown";
        map[device] = (map[device] || 0) + 1;
      });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [profiles]);

  const topPagesData = useMemo(() => {
    const map: Record<string, { views: number; unique: Set<string> }> = {};

    visits
      .filter((v) => !v.isBot)
      .forEach((v) => {
        const path = v.url || "/";
        if (!map[path]) map[path] = { views: 0, unique: new Set() };
        map[path].views += 1;
        if (v.ip) map[path].unique.add(v.ip);
      });

    const maxViews = Math.max(...Object.values(map).map((d) => d.views), 1);

    return Object.entries(map)
      .map(([path, data]) => ({
        path,
        views: data.views,
        unique: data.unique.size,
        progress: (data.views / maxViews) * 100,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);
  }, [visits]);

  return {
    isLoading,
    isRefreshing,
    excludeSelf,
    toggleExcludeSelf,
    fetchStats,
    handleLogout,
    handleSaveNote,
    selectedProfileId,
    setSelectedProfileId,
    selectedProfile,
    profiles,
    insights,
    feedItems,
    totalVisits,
    humanVisits,
    botVisits,
    returningCount,
    bounceRate,
    sparklineRecent,
    trafficData,
    heatmapData,
    deviceData,
    topPagesData,
  };
}
