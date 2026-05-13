"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Bot, AlertTriangle, Briefcase, Zap, CornerDownRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface FeedItem {
  id: string;
  timestamp: string;
  isBot: boolean;
  location: string;
  device: string;
  url: string;
  isReturn: boolean;
  company?: string;
  visitorId: string;
  intentLevel: "Low" | "Medium" | "High";
  sessionViews: number;
}

interface LiveFeedProps {
  items: FeedItem[];
  delay?: number;
  onViewProfile?: (visitorId: string) => void;
}

export function LiveFeed({ items, delay = 0, onViewProfile }: LiveFeedProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col h-full overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 sticky top-0 z-10">
        <h2 className="text-neutral-300 text-sm font-semibold font-jakarta flex items-center gap-2 tracking-wide">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
          </span>
          Live Feed
        </h2>
        <div className="text-[10px] text-neutral-500 font-jakarta uppercase tracking-widest">{items.length} Active</div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        <div className="space-y-1">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-3 rounded-xl hover:bg-white/5 transition-colors group flex items-start gap-3 border border-transparent cursor-pointer"
                onClick={() => onViewProfile && onViewProfile(item.visitorId)}
              >
                <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                  item.isBot 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                    : item.intentLevel === "High"
                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      : item.isReturn
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-neutral-800 border-white/5 text-neutral-400'
                }`}>
                  {item.isBot ? <Bot size={14} /> : 
                   item.intentLevel === "High" ? <Briefcase size={14} /> : 
                   item.isReturn ? <Zap size={14} /> :
                   <User size={14} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`text-xs font-medium ${item.isBot ? 'text-neutral-500' : 'text-neutral-200'}`}>
                        {item.device}
                      </span>
                      {item.company && item.company !== "Unknown" && (
                        <span className="text-[9px] bg-white/5 border border-white/5 text-neutral-400 px-1 rounded font-jakarta tracking-wider truncate max-w-[80px]">
                          {item.company}
                        </span>
                      )}
                      {item.isReturn && !item.isBot && (
                         <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1 rounded font-jakarta tracking-wider">
                           Returning
                         </span>
                      )}
                    </div>
                    <span className="text-[9px] text-neutral-600 whitespace-nowrap font-outfit">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1 text-[10px]">
                    <div className="text-neutral-500 flex items-center gap-1.5 truncate">
                      <span className="w-1 h-1 rounded-full bg-neutral-700"></span>
                      {item.location} &bull; Page {item.sessionViews}
                    </div>
                    <div className="text-neutral-400 flex items-center gap-1.5 font-mono truncate">
                      <CornerDownRight size={10} className="text-neutral-600" />
                      {item.url}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <div className="flex items-center justify-center h-32 text-neutral-600 text-xs font-outfit border border-dashed border-white/5 m-2 rounded-xl">
              Waiting for activity...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
