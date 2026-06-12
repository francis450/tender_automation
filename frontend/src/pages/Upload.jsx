import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const isValidFile = (f) =>
    f && allowedTypes.includes(f.type);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please upload a PDF or DOCX file.');
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected && isValidFile(selected)) {
      setFile(selected);
      setError('');
    } else {
      setError('Please upload a PDF or DOCX file.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/analysis/${res.data.document_id}`);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Upload failed. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Tender Document
        </h1>
        <p className="text-gray-600 mb-6">
          Upload an RFP, Terms of Reference, or any tender document (PDF or
          DOCX). We'll extract all required sections automatically.
        </p>

        {/* Drop Zone */}
        <div
          className={`drop-zone ${dragging ? 'active' : ''} ${
            file ? 'border-primary-500 bg-primary-50' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? (
            <div>
              <span className="text-4xl block mb-3">
                {file.name.endsWith('.pdf') ? '📕' : '📘'}
              </span>
              <p className="text-lg font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="mt-3 text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <span className="text-4xl block mb-3">📄</span>
              <p className="text-lg font-medium text-gray-700 mb-1">
                Drop your file here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF and DOCX files
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </p>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`mt-6 w-full py-3 px-6 rounded-lg font-medium text-white transition-colors shadow-sm ${
            !file || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {uploading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing Document...
            </span>
          ) : (
            'Upload & Analyze'
          )}
        </button>
      </div>
    </div>
  );
}