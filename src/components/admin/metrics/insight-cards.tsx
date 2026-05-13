import { Insight } from "@/lib/admin/admin-utils";
import { Sparkles, AlertCircle, TrendingUp, Info } from "lucide-react";

export function InsightCards({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-6">
      {insights.map((insight, idx) => (
        <div 
          key={insight.id}
          className="relative overflow-hidden bg-neutral-900 border border-white/5 rounded-xl p-4 flex items-start gap-3 group hover:bg-neutral-800/80 transition-colors"
        >
          {/* Subtle background glow based on type */}
          <div className={`absolute -top-10 -right-10 w-24 h-24 blur-3xl rounded-full opacity-20 pointer-events-none ${
            insight.type === "positive" ? "bg-green-500" :
            insight.type === "negative" ? "bg-red-500" :
            insight.type === "warning" ? "bg-yellow-500" : "bg-blue-500"
          }`} />

          <div className={`mt-0.5 shrink-0 ${
            insight.type === "positive" ? "text-green-400" :
            insight.type === "negative" ? "text-red-400" :
            insight.type === "warning" ? "text-yellow-400" : "text-blue-400"
          }`}>
            {insight.type === "positive" && <TrendingUp size={16} />}
            {insight.type === "negative" && <AlertCircle size={16} />}
            {insight.type === "warning" && <AlertCircle size={16} />}
            {insight.type === "neutral" && <Info size={16} />}
          </div>
          
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-xs font-medium text-neutral-400 uppercase tracking-wider">
              <Sparkles size={10} className="text-neutral-500" />
              <span>AI Insight</span>
            </div>
            <p className="text-sm text-neutral-200 leading-snug">
              {insight.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
