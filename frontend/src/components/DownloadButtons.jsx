import React from 'react';

export default function DownloadButtons({ report }) {
  if (!report) return null;
  const jsonBlob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const mdBlob = new Blob([report.markdown || ''], { type: 'text/markdown' });
  const sarifBlob = new Blob([JSON.stringify(report.sarif || {}, null, 2)], { type: 'application/json' });

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={URL.createObjectURL(jsonBlob)}
        download={`iac-audit-report-${Date.now()}.json`}
        className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
      >JSON</a>
      <a
        href={URL.createObjectURL(mdBlob)}
        download={`iac-audit-report-${Date.now()}.md`}
        className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
      >Markdown</a>
      <a
        href={URL.createObjectURL(sarifBlob)}
        download={`iac-audit-report-${Date.now()}.sarif.json`}
        className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
      >SARIF</a>
    </div>
  );
}
