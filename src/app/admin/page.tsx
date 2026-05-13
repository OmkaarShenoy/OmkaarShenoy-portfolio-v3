"use client";

import { useAdminDashboardData } from "@/hooks/use-admin-dashboard-data";
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

export default function AdminDashboard() {
  const {
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
  } = useAdminDashboardData();

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
