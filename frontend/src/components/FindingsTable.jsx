import React, { useMemo, useState } from 'react';

export default function FindingsTable({ findings }) {
  const [query, setQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    if (!findings) return [];
    return findings.filter(f => {
      const matchesQuery = query === '' || (
        f.title.toLowerCase().includes(query.toLowerCase()) ||
        f.file.toLowerCase().includes(query.toLowerCase()) ||
        f.resource.toLowerCase().includes(query.toLowerCase()) ||
        f.id.toLowerCase().includes(query.toLowerCase())
      );
      const matchesSeverity = severityFilter === 'ALL' || f.severity === severityFilter;
      return matchesQuery && matchesSeverity;
    });
  }, [findings, query, severityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const changePage = (newPage) => setPage(Math.min(Math.max(newPage, 1), totalPages));

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Search findings..."
          className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 w-full md:w-64"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 w-full md:w-40"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>
      <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Severity</th>
              <th className="px-3 py-2 text-left font-medium">Rule ID</th>
              <th className="px-3 py-2 text-left font-medium">File</th>
              <th className="px-3 py-2 text-left font-medium">Resource</th>
              <th className="px-3 py-2 text-left font-medium">Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((f, idx) => (
              <tr key={idx} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-3 py-2 font-semibold">
                  <span className={
                    'inline-block px-2 py-1 rounded text-xs ' +
                    (f.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                      f.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                      f.severity === 'MEDIUM' ? 'bg-yellow-400 text-black' :
                      'bg-green-600 text-white')
                  }>{f.severity}</span>
                </td>
                <td className="px-3 py-2">{f.id}</td>
                <td className="px-3 py-2 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis" title={f.file}>{f.file}</td>
                <td className="px-3 py-2 whitespace-nowrap">{f.resource}</td>
                <td className="px-3 py-2 max-w-md whitespace-pre-line">{f.recommendation}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">No findings match criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}</div>
        <div className="flex items-center gap-2">
          <button onClick={() => changePage(page - 1)} disabled={page === 1} className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 disabled:opacity-40">Prev</button>
          <span className="text-sm">Page {page} / {totalPages}</span>
          <button onClick={() => changePage(page + 1)} disabled={page === totalPages} className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 disabled:opacity-40">Next</button>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-sm">
            {[10,25,50,100].map(sz => <option key={sz} value={sz}>{sz}/page</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
