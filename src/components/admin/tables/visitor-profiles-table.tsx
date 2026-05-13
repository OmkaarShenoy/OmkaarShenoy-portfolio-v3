import { useState } from "react";
import { VisitorProfile } from "@/lib/admin/admin-utils";
import { Search, ChevronRight, UserCircle2, Briefcase, Bot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VisitorProfilesTableProps {
  profiles: VisitorProfile[];
  onViewProfile: (profile: VisitorProfile) => void;
}

export function VisitorProfilesTable({ profiles, onViewProfile }: VisitorProfilesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = profiles.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.id.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term) ||
      p.company.toLowerCase().includes(term) ||
      p.device.toLowerCase().includes(term)
    );
  }).slice(0, 15); // Show top 15

  return (
    <div className="w-full bg-neutral-900 border border-white/5 rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/50">
        <div>
          <h3 className="font-medium text-neutral-200">Visitor Intelligence</h3>
          <p className="text-xs text-neutral-500 mt-1">Real-time profile grouping & intent tracking</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
          <input 
            type="text" 
            placeholder="Search profiles..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 bg-neutral-950 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-300 focus:outline-none focus:border-white/20 transition-colors placeholder:text-neutral-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-neutral-500 text-xs uppercase tracking-wider bg-neutral-950/50">
              <th className="p-4 font-medium">Visitor</th>
              <th className="p-4 font-medium">Location & Org</th>
              <th className="p-4 font-medium hidden sm:table-cell">Device</th>
              <th className="p-4 font-medium text-right">Visits</th>
              <th className="p-4 font-medium text-right">Intent</th>
              <th className="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">
                  No visitor profiles found matching "{searchTerm}"
                </td>
              </tr>
            ) : (
              filtered.map((profile) => (
                <tr key={profile.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        profile.isBot ? "bg-red-500/10 text-red-400" :
                        profile.engagementLevel === "High" ? "bg-green-500/10 text-green-400" :
                        profile.scores.recruiterLikelihood > 50 ? "bg-blue-500/10 text-blue-400" :
                        "bg-neutral-800 text-neutral-400"
                      }`}>
                        {profile.isBot ? <Bot size={14} /> : profile.scores.recruiterLikelihood > 50 ? <Briefcase size={14} /> : <UserCircle2 size={14} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-300 truncate">
                          {profile.id.startsWith("anon-") ? profile.id : "ID: " + profile.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-neutral-500 truncate mt-0.5">
                          {formatDistanceToNow(new Date(profile.lastSeen), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-neutral-300 truncate">{profile.location}</p>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">{profile.company}</p>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="text-neutral-400 text-xs px-2 py-1 bg-neutral-800 rounded-md border border-white/5">
                      {profile.device}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <p className="text-neutral-300">{profile.totalPageViews}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{profile.sessions.length} sess</p>
                  </td>
                  <td className="p-4 text-right">
                    {profile.isBot ? (
                      <span className="text-xs text-red-400 font-medium tracking-wide">THREAT</span>
                    ) : (
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${
                            profile.engagementLevel === "High" ? "text-green-400" :
                            profile.engagementLevel === "Medium" ? "text-yellow-400" : "text-neutral-500"
                          }`}>
                            {profile.engagementLevel}
                          </span>
                        </div>
                        {profile.scores.recruiterLikelihood > 50 && (
                          <span className="text-[10px] text-blue-400 uppercase tracking-wider bg-blue-500/10 px-1.5 py-0.5 rounded">Recruiter</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => onViewProfile(profile)}
                      className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-all text-neutral-400 ml-auto"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
