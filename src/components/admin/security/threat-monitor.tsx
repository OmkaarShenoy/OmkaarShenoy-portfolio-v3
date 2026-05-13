"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, AlertTriangle, Globe } from "lucide-react";
import { VisitorProfile } from "@/lib/admin/admin-utils";
import { formatDistanceToNow } from "date-fns";

interface ThreatMonitorProps {
  totalBots: number;
  totalTraffic: number;
  profiles: VisitorProfile[];
  delay?: number;
}

export function ThreatMonitor({ totalBots, totalTraffic, profiles, delay = 0 }: ThreatMonitorProps) {
  const botPercentage = totalTraffic > 0 ? ((totalBots / totalTraffic) * 100).toFixed(1) : "0.0";
  const isHighThreat = parseFloat(botPercentage) > 20;

  // Find recent threats (bots or highly suspicious profiles)
  const recentThreats = profiles
    .filter(p => p.isBot || p.scores.suspiciousness > 50)
    .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
    .slice(0, 10);

  const vpnCount = profiles.filter(p => p.company && (p.company.toLowerCase().includes("vpn") || p.company.toLowerCase().includes("datacenter") || p.company.toLowerCase().includes("hosting"))).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col h-full overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl -z-10 rounded-full" />
      
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <h2 className="text-neutral-300 text-sm font-semibold font-jakarta flex items-center gap-2 tracking-wide">
          {isHighThreat ? <ShieldAlert className="text-rose-400" size={16} /> : <ShieldCheck className="text-emerald-400" size={16} />}
          Threat Intelligence
        </h2>
        <div className={`px-2 py-0.5 rounded flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase font-jakarta ${isHighThreat ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {isHighThreat && <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span></span>}
          {botPercentage}% Automated
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 border border-white/5 p-3 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <div className="text-neutral-500 text-[10px] font-jakarta uppercase tracking-widest mb-1 flex justify-between">
              Bots
            </div>
            <div className="text-xl font-medium font-outfit text-rose-400">{totalBots}</div>
          </div>
          <div className="bg-white/5 border border-white/5 p-3 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <div className="text-neutral-500 text-[10px] font-jakarta uppercase tracking-widest mb-1 flex justify-between">
              VPN/Datacenter
            </div>
            <div className="text-xl font-medium font-outfit text-yellow-400">{vpnCount}</div>
          </div>
        </div>

        <h3 className="text-neutral-500 text-[10px] font-jakarta uppercase tracking-widest mb-2 flex items-center gap-1.5">
          Recent Threats 
          <span className="bg-neutral-800 text-neutral-400 px-1.5 rounded-full text-[9px]">{recentThreats.length}</span>
        </h3>
        
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
          {recentThreats.length > 0 ? recentThreats.map((threat, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <AlertTriangle className="text-rose-400/50 group-hover:text-rose-400/80 transition-colors shrink-0" size={14} />
                <div className="min-w-0">
                  <div className="text-xs text-neutral-300 font-mono tracking-tight truncate">
                    {threat.isBot ? threat.ip : "Suspicious: " + threat.id.slice(0, 8)}
                  </div>
                  <div className="text-[9px] text-neutral-500 font-outfit truncate">
                    {threat.company} &bull; {formatDistanceToNow(new Date(threat.lastSeen), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-rose-400/80 font-medium bg-rose-500/10 px-1.5 py-0.5 rounded-md shrink-0 ml-2">
                {threat.scores.suspiciousness > 0 ? `${threat.scores.suspiciousness} Score` : `${threat.totalPageViews} hits`}
              </div>
            </div>
          )) : (
             <div className="flex items-center justify-center h-20 text-neutral-600 text-xs font-outfit bg-white/5 rounded-xl border border-dashed border-white/5">
              No threats detected
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
