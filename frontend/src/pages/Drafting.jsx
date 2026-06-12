import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Drafting() {
  const { documentId, sectionId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [section, setSection] = useState(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`/api/documents/${documentId}`)
      .then((res) => {
        setDocument(res.data);
        const sections = res.data.sections || [];
        const idx = parseInt(sectionId);
        const sec = sections[idx] || sections.find((s) => s.id === sectionId);
        setSection(sec);
        if (sec?.draft_content) {
          setDraft(sec.draft_content);
        }
      })
      .catch(() => setError('Failed to load section.'))
      .finally(() => setLoading(false));
  }, [documentId, sectionId]);

  const handleGenerateDraft = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await axios.post(`/api/documents/${documentId}/draft`, {
        section_id: sectionId,
      });
      setDraft(res.data.draft_content);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Failed to generate draft. Try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setError('');
    try {
      await axios.put(`/api/documents/${documentId}/sections/${sectionId}`, {
        draft_content: draft,
      });
      navigate(`/analysis/${documentId}`);
    } catch (err) {
      setError('Failed to save draft.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">Loading section...</p>
      </div>
    );
  }

  if (error && !section) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error}</p>
        <Link
          to={`/analysis/${documentId}`}
          className="text-primary-600 hover:text-primary-800 underline"
        >
          Back to Analysis
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-500">
        <Link
          to={`/analysis/${documentId}`}
          className="hover:text-primary-600"
        >
          Analysis
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">
          {section?.title || 'Section'}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {section?.title || 'Section'}
            </h1>
            {section?.description && (
              <p className="text-gray-600 mt-1">{section.description}</p>
            )}
          </div>
          <button
            onClick={handleGenerateDraft}
            disabled={generating}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
          >
            {generating ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Generating...
              </span>
            ) : (
              <span>✨ Generate with AI</span>
            )}
          </button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </p>
        )}

        {/* Draft Editor */}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            draft
              ? ''
              : 'Click "Generate with AI" to create a draft, or write your own content here...'
          }
          className="w-full min-h-[400px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-y font-sans text-gray-800"
        />

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <Link
            to={`/analysis/${documentId}`}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to sections
          </Link>
          <button
            onClick={handleSaveDraft}
            disabled={saving || !draft}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
          >
            {saving ? 'Saving...' : '💾 Save Draft'}
          </button>
        </div>
      </div>
    </div>
  );
}