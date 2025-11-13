import React from 'react';

const levels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function SeveritySummary({ summary }) {
  if (!summary) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {levels.map(lvl => (
        <div key={lvl} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{lvl}</span>
            <span className="text-xl font-semibold">{summary[lvl] ?? 0}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
