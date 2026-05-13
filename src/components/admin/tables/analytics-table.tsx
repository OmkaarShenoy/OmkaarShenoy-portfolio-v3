"use client";

import { motion } from "framer-motion";

interface Column {
  header: string;
  key: string;
  align?: "left" | "right" | "center";
}

interface AnalyticsTableProps {
  title: string;
  columns: Column[];
  data: any[];
  delay?: number;
}

export function AnalyticsTable({ title, columns, data, delay = 0 }: AnalyticsTableProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col h-full shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] overflow-hidden"
    >
      <div className="p-4 border-b border-white/5 bg-white/5">
        <h2 className="text-neutral-300 text-sm font-semibold font-jakarta tracking-wide">{title}</h2>
      </div>
      
      <div className="overflow-x-auto flex-1">
        {data.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th 
                    key={i} 
                    className={`py-3 px-4 text-neutral-500 text-[10px] tracking-widest uppercase font-medium font-jakarta border-b border-white/5 ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-outfit text-sm">
              {data.map((row, i) => (
                <tr key={i} className="group odd:bg-transparent even:bg-white/5 hover:bg-white/5 transition-colors">
                  {columns.map((col, j) => (
                    <td 
                      key={j} 
                      className={`py-2.5 px-4 text-neutral-300 whitespace-nowrap relative ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {/* For text paths/sources, we can add a subtle progress bar if 'progress' is defined */}
                      {j === 0 && row.progress !== undefined && (
                        <div 
                           className="absolute left-0 top-0 bottom-0 bg-emerald-500/5 -z-10 group-hover:bg-emerald-500/10 transition-colors"
                           style={{ width: `${row.progress}%` }}
                        />
                      )}
                      
                      <span className={j === 0 ? "font-medium text-neutral-200" : "text-neutral-400 font-mono text-xs"}>
                         {row[col.key]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-600 text-sm font-outfit">
            No data available
          </div>
        )}
      </div>
    </motion.div>
  );
}
