import React from 'react';
import { motion } from 'framer-motion';

const levels = [
  { 
    name: 'CRITICAL', 
    bg: 'bg-red-50 dark:bg-red-950/20', 
    border: 'border border-red-200 dark:border-red-800', 
    text: 'text-red-700 dark:text-red-300',
    badge: 'bg-red-600 dark:bg-red-500'
  },
  { 
    name: 'HIGH', 
    bg: 'bg-orange-50 dark:bg-orange-950/20', 
    border: 'border border-orange-200 dark:border-orange-800', 
    text: 'text-orange-700 dark:text-orange-300',
    badge: 'bg-orange-600 dark:bg-orange-500'
  },
  { 
    name: 'MEDIUM', 
    bg: 'bg-yellow-50 dark:bg-yellow-950/20', 
    border: 'border border-yellow-200 dark:border-yellow-800', 
    text: 'text-yellow-700 dark:text-yellow-300',
    badge: 'bg-yellow-500 dark:bg-yellow-400'
  },
  { 
    name: 'LOW', 
    bg: 'bg-green-50 dark:bg-green-950/20', 
    border: 'border border-green-200 dark:border-green-800', 
    text: 'text-green-700 dark:text-green-300',
    badge: 'bg-green-600 dark:bg-green-500'
  },
];

export default function SeveritySummary({ summary }) {
  if (!summary) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {levels.map((level, idx) => {
        const count = summary[level.name] ?? 0;
        return (
          <motion.div
            key={level.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className={`rounded-xl ${level.border} ${level.bg} p-6 hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wide ${level.text} px-2 py-1 rounded bg-white/50 dark:bg-slate-800/50`}>
                {level.name}
              </span>
              <div className={`w-3 h-3 rounded-full ${level.badge}`}></div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${level.text} leading-none`}>
                {count}
              </span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 pb-1">
                {count === 1 ? 'finding' : 'findings'}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
