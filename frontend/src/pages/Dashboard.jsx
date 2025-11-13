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
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.section 
        className="space-y-6" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="text-center space-y-4 mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-tight">
              Secure Your Infrastructure
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
              Advanced security scanning for Terraform and Kubernetes configurations
            </p>
          </motion.div>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="w-2 h-2 rounded-full bg-slate-500"></div>
              <span className="font-medium">Real-time Analysis</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">SARIF Export</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Multiple Formats</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-8 sm:p-10 space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <svg className="w-6 h-6 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <div>
                  <label className="text-base font-semibold text-slate-900 dark:text-slate-100 block">Severity Threshold</label>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure minimum severity level for findings</p>
                </div>
              </div>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all w-full sm:w-64"
              >
                <option value="ALL">All Severities</option>
                <option value="LOW">Low and Above</option>
                <option value="MEDIUM">Medium and Above</option>
                <option value="HIGH">High and Above</option>
                <option value="CRITICAL">Critical Only</option>
              </select>
            </div>
            <FileUpload onResult={handleResult} severity={severity} />
          </div>
      </motion.section>

      {report && (
        <>
          {/* Summary Section */}
          <motion.section 
            className="space-y-6" 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Scan Results</h2>
                <p className="text-base text-slate-600 dark:text-slate-300 font-medium">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.count}</span> finding{stats.count !== 1 ? 's' : ''} detected across <span className="font-semibold text-slate-700 dark:text-slate-200">{stats.total_files}</span> file{stats.total_files !== 1 ? 's' : ''}
                </p>
              </div>
              <DownloadButtons report={report} />
            </div>
            
            <SeveritySummary summary={report.summary} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <motion.div 
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span>Severity Distribution</span>
                  </h3>
                  <SeverityChart summary={report.summary} />
                </motion.div>
                <motion.div 
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span>Severity Breakdown</span>
                  </h3>
                  <SeverityBarChart summary={report.summary} />
                </motion.div>
              </div>
              
              <motion.div 
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span>Scan Metrics</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Findings</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.count}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Files Scanned</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.total_files}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Terraform Resources</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.terraform_resources}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">K8s Documents</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.k8s_documents}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Scan Duration</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.elapsed.toFixed(2)}s</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Findings Table Section */}
          <motion.section 
            className="space-y-6" 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Security Findings</h2>
              <p className="text-base text-slate-600 dark:text-slate-300 font-medium">
                Comprehensive analysis of identified security vulnerabilities and remediation guidance
              </p>
            </div>
            <FindingsTable findings={report.findings || []} />
          </motion.section>
        </>
      )}
    </div>
  );
}
