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
        <div className="relative w-full md:w-64">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search findings..."
            className="pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 w-full focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
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
      <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide text-xs">Severity</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide text-xs">Rule ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide text-xs">File</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide text-xs">Resource</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide text-xs">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {paginated.map((f, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3">
                  <span className={
                    'inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ' +
                    (f.severity === 'CRITICAL' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                      f.severity === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                      f.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300')
                  }>
                    {f.severity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs">
                    {f.id}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 max-w-xs">
                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="truncate text-slate-700 dark:text-slate-200" title={f.file}>{f.file}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <code className="text-slate-700 dark:text-slate-200 font-mono text-xs">{f.resource}</code>
                </td>
                <td className="px-4 py-3 max-w-md">
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">{f.recommendation}</p>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No findings match your criteria</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your search or filter settings</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{(page - 1) * pageSize + 1}</span> - <span className="font-semibold text-slate-900 dark:text-slate-100">{Math.min(page * pageSize, filtered.length)}</span> of <span className="font-semibold text-slate-900 dark:text-slate-100">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => changePage(page - 1)} 
            disabled={page === 1} 
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400 px-4">Page {page} of {totalPages}</span>
          <button 
            onClick={() => changePage(page + 1)} 
            disabled={page === totalPages} 
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
          <select 
            value={pageSize} 
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} 
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
          >
            {[10,25,50,100].map(sz => <option key={sz} value={sz}>{sz}/page</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
