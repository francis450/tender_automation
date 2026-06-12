import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function ProposalPreview() {
  const { documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`/api/documents/${documentId}`)
      .then((res) => setDocument(res.data))
      .catch(() => setError('Failed to load proposal.'))
      .finally(() => setLoading(false));
  }, [documentId]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await axios.get(
        `/api/documents/${documentId}/export?format=${format}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `proposal-${documentId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">Loading proposal...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error || 'Proposal not found.'}</p>
        <Link
          to="/"
          className="text-primary-600 hover:text-primary-800 underline"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const sections = document.sections || [];
  const draftedCount = sections.filter((s) => s.draft_content).length;

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Proposal Preview
            </h1>
            <p className="text-gray-600">
              <span className="font-medium">{document.filename}</span> —{' '}
              {draftedCount} of {sections.length} sections drafted
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('docx')}
              disabled={exporting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 shadow-sm"
            >
              {exporting ? 'Exporting...' : '📄 Export DOCX'}
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-300 shadow-sm"
            >
              {exporting ? 'Exporting...' : '📕 Export PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Drafting Progress
          </span>
          <span className="text-sm text-gray-500">
            {draftedCount}/{sections.length} sections
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary-600 h-2.5 rounded-full transition-all"
            style={{
              width: `${
                sections.length > 0
                  ? (draftedCount / sections.length) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Proposal Sections */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div
            key={section.id || index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                  Section {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mt-1">
                  {section.title}
                </h3>
              </div>
              <Link
                to={`/drafting/${documentId}/${section.id || index}`}
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                {section.draft_content ? 'Edit' : 'Draft'}
              </Link>
            </div>

            {section.draft_content ? (
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {section.draft_content}
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-400">
                  This section has not been drafted yet.
                </p>
                <Link
                  to={`/drafting/${documentId}/${section.id || index}`}
                  className="mt-2 inline-block text-sm text-primary-600 hover:text-primary-800"
                >
                  Draft this section →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}