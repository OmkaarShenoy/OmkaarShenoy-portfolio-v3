"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

interface DeviceChartProps {
  data: { name: string; value: number }[];
  title?: string;
  delay?: number;
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#64748b'];

export function DeviceChart({ data, title = "Device Profile", delay = 0 }: DeviceChartProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 p-5 rounded-2xl flex flex-col h-full shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
    >
      <h2 className="text-neutral-300 text-sm font-semibold font-jakarta tracking-wide mb-4">{title}</h2>
      
      <div className="flex-1 w-full min-h-[220px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="40%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(23,23,23,0.95)', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '12px', 
                  color: '#f5f5f5',
                  fontFamily: 'var(--font-outfit)',
                  fontSize: '12px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  padding: '8px 12px'
                }}
                itemStyle={{ color: '#fff', padding: '2px 0' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={40} 
                iconType="circle"
                wrapperStyle={{ 
                  fontSize: '11px', 
                  fontFamily: 'var(--font-outfit)', 
                  color: 'rgba(255,255,255,0.5)',
                  paddingTop: '20px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-600 text-sm font-outfit border border-dashed border-white/5 rounded-xl bg-white/5">
            No device telemetry
          </div>
        )}
      </div>
    </motion.div>
  );
}
