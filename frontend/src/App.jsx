import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Drafting from './pages/Drafting';
import ProposalPreview from './pages/ProposalPreview';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/analysis/:documentId" element={<Analysis />} />
        <Route path="/drafting/:documentId/:sectionId" element={<Drafting />} />
        <Route path="/preview/:documentId" element={<ProposalPreview />} />
      </Routes>
    </Layout>
  );
}