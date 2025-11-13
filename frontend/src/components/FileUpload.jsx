import React, { useCallback, useRef, useState } from 'react';
import { scanFiles } from '../api/scan';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function FileUpload({ onResult, severity = 'ALL' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const onDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const items = Array.from(e.dataTransfer.files || []);
    await handleUpload(items);
  }, []);

  const handleUpload = async (items) => {
    if (!items || !items.length) return;
    setLoading(true);
    try {
      const promise = (async () => {
        let data;
        if (items.length === 1 && items[0].name.toLowerCase().endsWith('.zip')) {
          data = await scanFiles({ zip: items[0], severity });
        } else {
          data = await scanFiles({ files: items, severity });
        }
        return data;
      })();

      // Show toast updates for the in-flight promise. Note: toast.promise returns a toast ID, not the data.
      toast.promise(promise, {
        loading: 'Scanning files...',
        success: 'Scan completed',
        error: 'Scan failed',
      });
      const data = await promise; // Await the original promise to get the API response data
      try { console.debug('[FileUpload] scan response', data); } catch {}
      onResult?.(data);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.detail || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={
          `border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ` +
          (isDragging 
            ? 'border-slate-400 bg-slate-50 dark:bg-slate-800 shadow-lg scale-[1.01] ring-2 ring-slate-300 dark:ring-slate-600' 
            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-md')
        }
      >
        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isDragging 
              ? 'bg-slate-900 dark:bg-slate-100 shadow-lg scale-110' 
              : 'bg-slate-100 dark:bg-slate-700'
          }`}>
            <svg className={`w-8 h-8 ${isDragging ? 'text-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {isDragging ? 'Drop files to scan' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Supports: <span className="font-mono">.tf</span>, <span className="font-mono">.yaml</span>, <span className="font-mono">.yml</span>, or <span className="font-mono">.zip</span> archive
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">or click the button below to browse</p>
          </div>
          <button
            className="px-6 py-3 rounded-lg font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md hover:shadow-lg hover:bg-slate-800 dark:hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Scanning…</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Browse Files</span>
              </>
            )}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          onChange={(e) => handleUpload(Array.from(e.target.files || []))}
          accept=".tf,.yaml,.yml,.zip"
        />
      </motion.div>
    </div>
  );
}
