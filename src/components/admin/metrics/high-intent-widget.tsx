import { VisitorProfile } from "@/lib/admin/admin-utils";
import { Briefcase, Target, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface HighIntentWidgetProps {
  profiles: VisitorProfile[];
  onViewProfile: (profile: VisitorProfile) => void;
}

export function HighIntentWidget({ profiles, onViewProfile }: HighIntentWidgetProps) {
  // Get top 5 high intent non-bot profiles
  const topProfiles = profiles
    .filter(p => !p.isBot && p.scores.recruiterLikelihood > 0 || p.scores.engagement > 50)
    .sort((a, b) => (b.scores.recruiterLikelihood + b.scores.engagement) - (a.scores.recruiterLikelihood + a.scores.engagement))
    .slice(0, 5);

  if (topProfiles.length === 0) return null;

  return (
    <div className="bg-neutral-900 border border-white/5 rounded-xl flex flex-col overflow-hidden h-full">
      <div className="p-4 border-b border-white/5 bg-neutral-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-neutral-200 font-medium">
          <Target size={16} className="text-blue-400" />
          <h3>High Intent Targets</h3>
        </div>
        <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-medium">
          {topProfiles.length} Active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <div className="space-y-1">
          {topProfiles.map(profile => (
            <button
              key={profile.id}
              onClick={() => onViewProfile(profile)}
              className="w-full text-left p-3 rounded-lg hover:bg-white/[0.02] transition-colors group flex items-center justify-between"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <Briefcase size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-300 truncate">
                    {profile.company !== "Unknown" ? profile.company : profile.location}
                  </p>
                  <p className="text-xs text-neutral-500 truncate mt-0.5">
                    {profile.sessions.length} sessions &bull; {formatDistanceToNow(new Date(profile.lastSeen), { addSuffix: true })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0 pl-2">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium text-blue-400">
                    {profile.scores.recruiterLikelihood}% Match
                  </span>
                  <div className="w-16 h-1 bg-neutral-800 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${profile.scores.recruiterLikelihood}%` }} 
                    />
                  </div>
                </div>
                <ChevronRight size={16} className="text-neutral-600 group-hover:text-neutral-400 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
