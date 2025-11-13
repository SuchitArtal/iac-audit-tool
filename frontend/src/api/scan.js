import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function scanFiles({ files, zip, severity }) {
  const formData = new FormData();
  if (zip) {
    formData.append('archive', zip, zip.name);
  } else if (files && files.length) {
    files.forEach(f => formData.append('files', f, f.name));
  } else {
    throw new Error('No files provided');
  }
  const params = {};
  if (severity && severity !== 'ALL') params.severity = severity;
  const res = await axios.post(`${API_BASE}/scan`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params,
  });
  // Defensive: ensure we always return an object, never a raw primitive
  const data = res.data;
  if (typeof data !== 'object' || data === null) {
    console.warn('[scanFiles] Unexpected non-object response', data);
    return { error: 'unexpected_response', raw: data };
  }
  return data;
}
