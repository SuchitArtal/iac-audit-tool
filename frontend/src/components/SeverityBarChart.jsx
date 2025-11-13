import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function SeverityBarChart({ summary }) {
  if (!summary) return null;
  const data = [
    { name: 'CRITICAL', value: summary.CRITICAL || 0 },
    { name: 'HIGH', value: summary.HIGH || 0 },
    { name: 'MEDIUM', value: summary.MEDIUM || 0 },
    { name: 'LOW', value: summary.LOW || 0 },
  ];
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
