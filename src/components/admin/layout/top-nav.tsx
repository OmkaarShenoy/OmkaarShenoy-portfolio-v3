"use client";

import { Search, Calendar, Bell, Circle, UserCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TopNavProps {
  onRefresh: () => void;
  onLogout: () => void;
  isRefreshing?: boolean;
}

export function TopNav({ onRefresh, onLogout, isRefreshing }: TopNavProps) {
  return (
    <nav className="w-full flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/5 bg-neutral-900/40 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" className="text-neutral-300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" className="text-neutral-300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" className="text-neutral-300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-outfit font-medium text-neutral-200 tracking-wide text-sm">Omkaar<span className="text-neutral-500">/Analytics</span></span>
        </div>
        
        <div className="h-4 w-[1px] bg-neutral-800 hidden md:block"></div>
        
        <div className="hidden md:flex items-center gap-2 text-[11px] font-medium font-jakarta tracking-wider uppercase px-2 py-1 rounded bg-neutral-800/30 text-neutral-400">
          Environment
          <span className="text-neutral-300 flex items-center gap-1.5 ml-1">
            Production <Circle className="text-emerald-500 fill-emerald-500" size={6} />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 bg-neutral-900/50 border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] rounded-md px-3 py-1.5 w-56 text-neutral-500 text-xs font-outfit transition-colors hover:border-white/10">
          <Search size={14} />
          <span>Search telemetry...</span>
          <span className="ml-auto text-[10px] border border-white/5 px-1 rounded bg-white/5 text-neutral-400">⌘K</span>
        </div>

        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 text-xs font-medium font-outfit bg-neutral-800/30 hover:bg-neutral-800/60 transition-colors px-3 py-1.5 rounded-md text-neutral-300 border border-transparent hover:border-white/5"
        >
          <Calendar size={14} />
          Last 7 Days
          {isRefreshing && (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Circle className="text-neutral-500" size={12} />
            </motion.div>
          )}
        </button>
        
        <div className="h-4 w-[1px] bg-neutral-800"></div>
        
        <button className="text-neutral-500 hover:text-neutral-300 transition-colors relative p-1.5 hover:bg-neutral-800/50 rounded-md">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-neutral-900"></span>
        </button>

        <button onClick={onLogout} className="text-neutral-500 hover:text-neutral-300 transition-colors p-1 hover:bg-neutral-800/50 rounded-md">
          <UserCircle size={20} />
        </button>
      </div>
    </nav>
  );
}
