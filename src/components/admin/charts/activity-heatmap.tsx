import { motion } from "framer-motion";

interface ActivityHeatmapProps {
  data: { day: string; hour: number; count: number }[];
  delay?: number;
}

export function ActivityHeatmap({ data, delay = 0 }: ActivityHeatmapProps) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Transform data into matrix
  const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
  let maxCount = 1;
  data.forEach(d => {
    const dayIdx = days.indexOf(d.day);
    if (dayIdx !== -1) {
      matrix[dayIdx][d.hour] = d.count;
      if (d.count > maxCount) maxCount = d.count;
    }
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl flex flex-col h-full shadow-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-neutral-200 text-sm font-semibold tracking-wide">Activity Heatmap</h2>
          <p className="text-neutral-500 text-xs mt-1">Traffic density by day and hour</p>
        </div>
      </div>

      <div className="flex-1 w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px] flex flex-col gap-1 text-xs">
          {/* X Axis Header */}
          <div className="flex ml-8">
            {hours.map(h => (
              <div key={h} className="flex-1 text-center text-neutral-600 text-[10px]">
                {h % 3 === 0 ? `${h}h` : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          {days.map((day, dayIdx) => (
            <div key={day} className="flex items-center gap-2">
              <div className="w-6 text-neutral-500 text-[10px] font-medium text-right shrink-0">
                {day}
              </div>
              <div className="flex flex-1 gap-1">
                {hours.map(hour => {
                  const count = matrix[dayIdx][hour];
                  const intensity = count === 0 ? 0 : Math.max(0.1, count / maxCount);
                  return (
                    <div 
                      key={`${day}-${hour}`}
                      className="flex-1 aspect-square rounded-[2px] transition-colors hover:ring-1 ring-white/30 cursor-pointer group relative"
                      style={{ 
                        backgroundColor: count === 0 ? "rgba(255,255,255,0.02)" : `rgba(59, 130, 246, ${intensity})` 
                      }}
                    >
                      <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-neutral-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
                        {count} hits at {hour}:00
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
