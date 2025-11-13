import React from 'react';

export default function DownloadButtons({ report }) {
  if (!report) return null;
  const jsonBlob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const mdBlob = new Blob([report.markdown || ''], { type: 'text/markdown' });
  const sarifBlob = new Blob([JSON.stringify(report.sarif || {}, null, 2)], { type: 'application/json' });

  const buttons = [
    { label: 'JSON', blob: jsonBlob, ext: 'json' },
    { label: 'Markdown', blob: mdBlob, ext: 'md' },
    { label: 'SARIF', blob: sarifBlob, ext: 'sarif.json' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map((btn) => (
        <a
          key={btn.label}
          href={URL.createObjectURL(btn.blob)}
          download={`iac-audit-report-${Date.now()}.${btn.ext}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm hover:shadow"
        >
          <span>{btn.label}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      ))}
    </div>
  );
}
