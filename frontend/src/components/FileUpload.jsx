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
          `border-2 border-dashed rounded-lg p-8 text-center transition ` +
          (isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-gray-300 dark:border-gray-700')
        }
      >
        <p className="mb-2">Drag & drop IaC files here (.tf, .yml, .yaml) or a .zip archive</p>
        <p className="text-sm text-gray-500 mb-4">You can also browse your files</p>
        <button
          className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          {loading ? 'Scanning…' : 'Browse Files'}
        </button>
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
