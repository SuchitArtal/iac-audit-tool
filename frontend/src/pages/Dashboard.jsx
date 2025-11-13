import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import FileUpload from '../components/FileUpload.jsx';
import SeveritySummary from '../components/SeveritySummary.jsx';
import SeverityChart from '../components/SeverityChart.jsx';
import SeverityBarChart from '../components/SeverityBarChart.jsx';
import FindingsTable from '../components/FindingsTable.jsx';
import DownloadButtons from '../components/DownloadButtons.jsx';

export default function Dashboard() {
  const [report, setReport] = useState(null);
  const [severity, setSeverity] = useState('ALL');

  const handleResult = (data) => setReport(data);

  // Derived stats consolidated for rendering; ensure backward compatibility if fields missing
  const stats = useMemo(() => {
    if (!report) return null;
    return {
      count: report.count ?? report.findings?.length ?? 0,
      total_files: report.total_files ?? report.metadata?.total_files ?? 0,
      terraform_resources: report.terraform_resources ?? report.metadata?.terraform_resources ?? 0,
      k8s_documents: report.k8s_documents ?? report.metadata?.k8s_documents ?? 0,
      elapsed: report.scan_time ?? report.metadata?.elapsed_seconds ?? 0,
    };
  }, [report]);

  return (
    <div className="space-y-6">
      <motion.section className="space-y-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h2 className="text-xl font-semibold">Upload IaC Files</h2>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <label className="text-sm font-medium">Severity filter:</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 w-full md:w-52"
            >
              <option value="ALL">All</option>
              <option value="LOW">Low+</option>
              <option value="MEDIUM">Medium+</option>
              <option value="HIGH">High+</option>
              <option value="CRITICAL">Critical only</option>
            </select>
          </div>
          <FileUpload onResult={handleResult} severity={severity} />
        </div>
      </motion.section>

      {report && (
        <>
          <motion.section className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Summary</h2>
              {report && (
                <DownloadButtons report={report} />
              )}
            </div>
            {/* Debug pill to confirm state received by UI */}
            <div className="text-xs text-gray-500 dark:text-gray-400">debug: findings={report?.count ?? report?.findings?.length ?? 0}, files={report?.total_files ?? 0}</div>
            <SeveritySummary summary={report.summary} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                <h3 className="text-sm font-medium mb-2">Severity Pie</h3>
                <SeverityChart summary={report.summary} />
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                <h3 className="text-sm font-medium mb-2">Severity Bar</h3>
                <SeverityBarChart summary={report.summary} />
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <div>Total findings: <span className="font-semibold">{stats.count}</span></div>
                  <div>Total files: <span className="font-semibold">{stats.total_files}</span></div>
                  <div>Terraform resources: <span className="font-semibold">{stats.terraform_resources}</span></div>
                  <div>K8s documents: <span className="font-semibold">{stats.k8s_documents}</span></div>
                  <div>Elapsed: <span className="font-semibold">{stats.elapsed}s</span></div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <h2 className="text-xl font-semibold">Findings</h2>
            <FindingsTable findings={report.findings || []} />
          </motion.section>
        </>
      )}
    </div>
  );
}
