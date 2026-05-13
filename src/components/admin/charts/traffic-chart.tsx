"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface TrafficChartProps {
  data: { date: string; human: number; bot: number }[];
  delay?: number;
}

export function TrafficChart({ data, delay = 0 }: TrafficChartProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl flex flex-col h-full shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-neutral-200 text-sm font-semibold font-jakarta tracking-wide">Traffic Velocity</h2>
          <p className="text-neutral-500 text-xs mt-1 font-outfit">Verified humans vs automated requests over 30 days</p>
        </div>
        <div className="flex gap-4 text-[11px] font-jakarta font-medium uppercase tracking-widest bg-neutral-900/50 px-3 py-1.5 rounded-lg border border-white/5">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            Humans
          </div>
          <div className="flex items-center gap-2 text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
            Bots
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[300px] relative z-10">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: -25 }}>
              <defs>
                <linearGradient id="colorHuman" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBot" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2}/>
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={11} 
                fontFamily="var(--font-outfit)"
                tickLine={false} 
                axisLine={false} 
                dy={15} 
                minTickGap={30}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={11} 
                fontFamily="var(--font-outfit)"
                tickLine={false} 
                axisLine={false} 
                dx={-10}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(23,23,23,0.95)', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '12px', 
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  color: '#f5f5f5',
                  fontFamily: 'var(--font-outfit)',
                  fontSize: '12px',
                  padding: '12px 16px'
                }}
                itemStyle={{ fontWeight: 500, padding: '2px 0' }}
                cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="bot" 
                stroke="#f43f5e" 
                fillOpacity={1} 
                fill="url(#colorBot)" 
                strokeWidth={2}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#f43f5e' }}
              />
              <Area 
                type="monotone" 
                dataKey="human" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorHuman)" 
                strokeWidth={2}
                activeDot={{ r: 5, strokeWidth: 0, fill: '#10b981', filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.6))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-600 text-sm font-outfit border border-dashed border-white/5 rounded-xl bg-white/5">
            Awaiting telemetry...
          </div>
        )}
      </div>
    </motion.div>
  );
}
