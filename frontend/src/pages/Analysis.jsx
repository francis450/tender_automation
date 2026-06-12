import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function Analysis() {
  const { documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`/api/documents/${documentId}`)
      .then((res) => setDocument(res.data))
      .catch(() => setError('Failed to load document analysis.'))
      .finally(() => setLoading(false));
  }, [documentId]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">Loading analysis results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error}</p>
        <Link
          to="/upload"
          className="text-primary-600 hover:text-primary-800 underline"
        >
          Upload a document
        </Link>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Document not found.</p>
        <Link
          to="/upload"
          className="text-primary-600 hover:text-primary-800 underline"
        >
          Upload a document
        </Link>
      </div>
    );
  }

  const sections = document.sections || [];

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Document Analysis
            </h1>
            <p className="text-gray-600">
              <span className="font-medium">{document.filename}</span> —{' '}
              {sections.length} sections identified
            </p>
          </div>
          <Link
            to={`/preview/${documentId}`}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Proposal Preview
          </Link>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((section, index) => (
          <div
            key={section.id || index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                    Section {index + 1}
                  </span>
                  {section.category && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {section.category}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h3>
                {section.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {section.description}
                  </p>
                )}
                {section.required !== undefined && (
                  <p className="text-xs mt-2">
                    <span
                      className={
                        section.required
                          ? 'text-amber-600'
                          : 'text-green-600'
                      }
                    >
                      {section.required ? '⚠ Required' : '✓ Optional'}
                    </span>
                  </p>
                )}
              </div>

              <div className="ml-4 flex flex-col items-end space-y-2">
                {section.drafted ? (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Drafted
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    Not Drafted
                  </span>
                )}
                <Link
                  to={`/drafting/${documentId}/${section.id || index}`}
                  className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  {section.drafted ? 'Edit Draft' : 'Draft Section'}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}