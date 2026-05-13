"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  sparklineData?: number[];
  icon?: React.ReactNode;
  delay?: number;
}

export function MetricCard({ title, value, trend, trendLabel, sparklineData, icon, delay = 0 }: MetricCardProps) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  const chartData = sparklineData?.map((val, i) => ({ value: val, index: i })) || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] flex items-center justify-between group hover:bg-neutral-800/40 transition-colors duration-300 h-24"
    >
      <div className="flex flex-col h-full justify-center">
        <div className="flex items-center gap-2 mb-1">
          {icon && <div className="text-neutral-500">{icon}</div>}
          <h3 className="text-neutral-400 text-[11px] font-jakarta uppercase tracking-wider font-medium">{title}</h3>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold font-outfit text-neutral-100 tracking-tight">{value}</span>
          {trend !== undefined && (
             <span className={`flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-sm ${
                isPositive ? 'bg-emerald-500/10 text-emerald-400' : 
                isNegative ? 'bg-rose-500/10 text-rose-400' : 
                'bg-neutral-800 text-neutral-400'
             }`}>
                {isPositive && <ArrowUpRight size={10} className="mr-0.5" />}
                {isNegative && <ArrowDownRight size={10} className="mr-0.5" />}
                {Math.abs(trend)}%
             </span>
          )}
        </div>
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="w-24 h-12 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={isPositive ? '#10b981' : isNegative ? '#f43f5e' : '#3b82f6'} 
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
