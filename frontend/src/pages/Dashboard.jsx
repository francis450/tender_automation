import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/documents')
      .then((res) => setDocuments(res.data.documents || []))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome to PropelProposal
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Upload a tender document (RFP, Terms of Reference, etc.) and let AI
          extract every required section — then draft each section on demand.
        </p>
        <Link
          to="/upload"
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <span className="mr-2">📄</span>
          Upload New Tender
        </Link>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Tenders
        </h2>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Loading your tenders...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No tenders yet</p>
            <p className="text-sm">
              Upload your first tender document to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {doc.filename?.endsWith('.pdf') ? '📕' : '📘'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{doc.filename}</p>
                    <p className="text-sm text-gray-500">
                      {doc.sections_count || 0} sections extracted
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/analysis/${doc.id}`}
                    className="px-3 py-1.5 text-sm bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition-colors"
                  >
                    View Sections
                  </Link>
                  <Link
                    to={`/preview/${doc.id}`}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Preview
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}