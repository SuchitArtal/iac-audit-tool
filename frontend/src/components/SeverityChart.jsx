import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = {
  CRITICAL: '#dc2626',
  HIGH: '#f97316',
  MEDIUM: '#fbbf24',
  LOW: '#16a34a'
};

export default function SeverityChart({ summary }) {
  if (!summary) return null;
  const data = Object.entries(summary)
    .filter(([k]) => ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(k))
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] || '#64748b'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
