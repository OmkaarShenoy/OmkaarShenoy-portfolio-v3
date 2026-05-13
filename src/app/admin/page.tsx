"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CustomCursor } from "@/components/custom-cursor";
import { Loader2, Activity, Users, Clock, Globe } from "lucide-react";

// Components
import { TopNav } from "@/components/admin/layout/top-nav";
import { MetricCard } from "@/components/admin/metrics/metric-card";
import { TrafficChart } from "@/components/admin/charts/traffic-chart";
import { DeviceChart } from "@/components/admin/charts/device-chart";
import { AnalyticsTable } from "@/components/admin/tables/analytics-table";
import { ThreatMonitor } from "@/components/admin/security/threat-monitor";
import { LiveFeed } from "@/components/admin/live/live-feed";
import { VisitorProfilesTable } from "@/components/admin/tables/visitor-profiles-table";
import { VisitorProfileDrawer } from "@/components/admin/overlays/visitor-profile-drawer";
import { HighIntentWidget } from "@/components/admin/metrics/high-intent-widget";
import { InsightCards } from "@/components/admin/metrics/insight-cards";
import { ActivityHeatmap } from "@/components/admin/charts/activity-heatmap";

// Utils
import { processVisitorData, generateLiveEvents, generateInsights, VisitorProfile, Visit } from "@/lib/admin/admin-utils";

export default function AdminDashboard() {
  const [rawVisits, setRawVisits] = useState<Visit[]>([]);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [excludeSelf, setExcludeSelf] = useState(false);
  
  // Drawer state
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const router = useRouter();

  // Load self-exclusion preference on mount
  useEffect(() => {
    const excluded = localStorage.getItem("admin_exclude_self");
    if (excluded === "true") {
      setExcludeSelf(true);
    }
  }, []);

  const toggleExcludeSelf = () => {
    const newValue = !excludeSelf;
    setExcludeSelf(newValue);
    localStorage.setItem("admin_exclude_self", newValue.toString());
  };

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
    
    // Auto-refresh every 30 seconds to make it feel alive
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleLogout = () => {
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/admin/login");
  };

  const handleSaveNote = async (id: string, note: string) => {
    try {
      await fetch("/api/admin/notes", {
        method: "POST",
        body: JSON.stringify({ id, note }),
        headers: { "Content-Type": "application/json" }
      });
      setNotesMap(prev => ({ ...prev, [id]: note }));
    } catch (e) {
      console.error("Failed to save note:", e);
    }
  };

  // --- Data Processing ---
  
  // 1. Filter out self if toggled (detecting Tempe, AZ or manually excluded IPs)
  const visits = useMemo(() => {
    if (!excludeSelf) return rawVisits;
    // Heuristic for self: location includes Tempe or Arizona, or specific known traits
    return rawVisits.filter(v => !(v.location?.includes("Tempe") || v.location?.includes("Arizona")));
  }, [rawVisits, excludeSelf]);

  // 2. Process into profiles
  const profiles = useMemo(() => processVisitorData(visits, notesMap), [visits, notesMap]);
  
  // 3. Generate Insights
  const insights = useMemo(() => generateInsights(profiles), [profiles]);
  
  // 4. Generate Live Feed Items
  const feedItems = useMemo(() => {
    return visits.slice(0, 50).map((v, i) => {
      const profile = profiles.find(p => p.id === v.visitorId || p.ip === v.ip);
      
      // Calculate which page this is in their current session
      let sessionViews = 1;
      if (profile && profile.sessions.length > 0) {
        // Find the session this visit belongs to
        const session = profile.sessions.find(s => 
          new Date(v.timestamp).getTime() >= new Date(s.startTime).getTime() && 
          new Date(v.timestamp).getTime() <= new Date(s.endTime).getTime()
        );
        if (session) {
           const visitIndex = session.pages.findIndex(p => p.timestamp === v.timestamp);
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
        visitorId: profile ? profile.id : (v.visitorId || v.ip),
        intentLevel: profile ? profile.engagementLevel : "Low",
        sessionViews
      };
    });
  }, [visits, profiles]);

  const selectedProfile = useMemo(() => {
    if (!selectedProfileId) return null;
    return profiles.find(p => p.id === selectedProfileId) || null;
  }, [profiles, selectedProfileId]);

  // --- Derived Metrics ---
  const totalVisits = visits.length;
  const humanVisits = visits.filter(v => !v.isBot).length;
  const botVisits = totalVisits - humanVisits;
  const returningCount = profiles.filter(p => !p.isBot && p.sessions.length > 1).length;
  const bounceRate = profiles.length > 0 ? (profiles.filter(p => p.sessions.length === 1 && p.totalPageViews === 1).length / profiles.length * 100).toFixed(1) : "0.0";

  // Sparkline data
  const sparklineRecent = useMemo(() => {
    if (visits.length === 0) return Array(10).fill(0);
    const recent = visits.slice(0, 50);
    const counts = Array(10).fill(0);
    const now = Date.now();
    recent.forEach(v => {
      const diffMs = now - new Date(v.timestamp).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 10) {
        counts[9 - diffHours]++; 
      }
    });
    return counts;
  }, [visits]);

  // Traffic over time chart
  const trafficData = useMemo(() => {
    const dailyMap: Record<string, { date: string; human: number; bot: number }> = {};
    visits.forEach(v => {
      const date = new Date(v.timestamp).toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
      if (!dailyMap[date]) dailyMap[date] = { date, human: 0, bot: 0 };
      if (v.isBot) dailyMap[date].bot += 1;
      else dailyMap[date].human += 1;
    });
    return Object.values(dailyMap).reverse();
  }, [visits]);

  // Heatmap data
  const heatmapData = useMemo(() => {
    return visits.filter(v => !v.isBot).map(v => {
      const d = new Date(v.timestamp);
      return {
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        hour: d.getHours(),
        count: 1
      };
    }).reduce((acc, curr) => {
      const existing = acc.find(item => item.day === curr.day && item.hour === curr.hour);
      if (existing) existing.count++;
      else acc.push(curr);
      return acc;
    }, [] as { day: string, hour: number, count: number }[]);
  }, [visits]);

  // Device Data
  const deviceData = useMemo(() => {
    const map: Record<string, number> = {};
    profiles.filter(p => !p.isBot).forEach(p => {
      const device = p.device || "Unknown";
      map[device] = (map[device] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);
  }, [profiles]);

  // Top Pages
  const topPagesData = useMemo(() => {
    const map: Record<string, { views: number; unique: Set<string> }> = {};
    visits.filter(v => !v.isBot).forEach(v => {
      const path = v.url || "/";
      if (!map[path]) map[path] = { views: 0, unique: new Set() };
      map[path].views++;
      if (v.ip) map[path].unique.add(v.ip);
    });
    const maxViews = Math.max(...Object.values(map).map(d => d.views), 1);
    return Object.entries(map)
      .map(([path, data]) => ({ 
        path, 
        views: data.views, 
        unique: data.unique.size,
        progress: (data.views / maxViews) * 100
      }))
      .sort((a,b) => b.views - a.views)
      .slice(0, 8);
  }, [visits]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center font-outfit">
        <CustomCursor />
        <Loader2 className="animate-spin text-neutral-500 mb-4" size={32} />
        <p className="text-neutral-500 tracking-[0.2em] text-xs uppercase font-medium">Booting Intelligence Engine</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 selection:bg-white/10 overflow-x-hidden">
      <CustomCursor />
      <VisitorProfileDrawer 
        isOpen={!!selectedProfileId} 
        onClose={() => setSelectedProfileId(null)} 
        profile={selectedProfile}
        onSaveNote={handleSaveNote}
      />
      
      {/* Extremely subtle background depth */}
      <div className="fixed top-[-20%] left-[20%] w-[50%] h-[50%] bg-neutral-800/10 rounded-full blur-[120px] pointer-events-none" />

      <TopNav onRefresh={fetchStats} onLogout={handleLogout} isRefreshing={isRefreshing} />

      <main className="w-full max-w-[1800px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col xl:flex-row gap-6 lg:gap-8">
        
        {/* Left Column (Main Content - 75%) */}
        <div className="flex-1 flex flex-col gap-6 lg:gap-8 min-w-0">
          
          <div className="flex items-center justify-between">
             <h1 className="text-xl font-medium text-white tracking-wide">Visitor Intelligence</h1>
             <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Exclude My Traffic (AZ)</span>
                <button 
                  onClick={toggleExcludeSelf}
                  className={`w-10 h-5 rounded-full p-1 transition-colors ${excludeSelf ? 'bg-blue-500' : 'bg-neutral-800'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${excludeSelf ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
             </div>
          </div>

          <InsightCards insights={insights} />

          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <MetricCard 
              title="Total Traffic" 
              value={totalVisits} 
              icon={<Activity size={16} />} 
              sparklineData={sparklineRecent}
              trend={12}
              delay={0.1}
            />
            <MetricCard 
              title="Verified Humans" 
              value={humanVisits} 
              icon={<Users size={16} />} 
              trend={8}
              delay={0.15}
            />
            <MetricCard 
              title="Returning Users" 
              value={returningCount} 
              icon={<Clock size={16} />} 
              delay={0.2}
            />
            <MetricCard 
              title="Bounce Rate" 
              value={`${bounceRate}%`} 
              icon={<Globe size={16} />} 
              trend={-2.4}
              delay={0.25}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 h-[450px]">
            <TrafficChart data={trafficData} delay={0.3} />
            <ActivityHeatmap data={heatmapData} delay={0.35} />
          </div>

          {/* Profiles Table */}
          <div className="mt-4">
             <VisitorProfilesTable profiles={profiles} onViewProfile={(p) => setSelectedProfileId(p.id)} />
          </div>

          {/* Secondary Row (Tables & Donuts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-20 xl:mb-0 mt-4">
            <div className="h-[400px]">
              <AnalyticsTable 
                title="Top Pages & Paths" 
                columns={[
                  { header: "Path", key: "path" },
                  { header: "Views", key: "views", align: "right" }
                ]} 
                data={topPagesData} 
                delay={0.4} 
              />
            </div>
            <div className="h-[400px]">
              <DeviceChart data={deviceData} delay={0.6} />
            </div>
          </div>

        </div>

        {/* Right Column (Sidebar - 25%) */}
        <div className="w-full xl:w-[380px] xl:shrink-0 flex flex-col gap-6 lg:gap-8 h-auto xl:h-[calc(100vh-100px)] xl:sticky xl:top-[80px]">
           
           <div className="h-[300px] shrink-0">
             <HighIntentWidget 
               profiles={profiles} 
               onViewProfile={(p) => setSelectedProfileId(p.id)} 
             />
           </div>

           <div className="h-[280px] shrink-0">
             <ThreatMonitor 
                totalBots={botVisits} 
                totalTraffic={totalVisits} 
                profiles={profiles} 
                delay={0.4} 
              />
           </div>

           <div className="flex-1 min-h-[400px]">
             <LiveFeed 
                items={feedItems} 
                delay={0.5} 
                onViewProfile={(id) => setSelectedProfileId(id)}
              />
           </div>
        </div>

      </main>
    </div>
  );
}
