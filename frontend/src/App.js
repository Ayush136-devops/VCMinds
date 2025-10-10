import React, { useState } from 'react';
import UploadDeck from './components/UploadDeck';
import AnalysisView from './components/AnalysisView';
import Dashboard from './components/Dashboard';

export default function App() {
  const [tab, setTab] = useState('analyze');
  const [uploadedDoc, setUploadedDoc] = useState(null);

  const handleUploadSuccess = (docData) => {
    setUploadedDoc(docData);
  };

  return (
    <div>
      {/* Tab Switcher */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 32, margin: '24px 0'
      }}>
        <button
          onClick={() => setTab('analyze')}
          style={{
            fontWeight: tab === 'analyze' ? 700 : 400,
            background: tab === 'analyze' ? '#397cf6' : '#eaeaea',
            color: tab === 'analyze' ? '#fff' : '#333',
            padding: '10px 24px', border: 'none', borderRadius: 8, cursor: 'pointer'
          }}
        >
          Analyze Pitch Deck
        </button>
        <button
          onClick={() => setTab('dashboard')}
          style={{
            fontWeight: tab === 'dashboard' ? 700 : 400,
            background: tab === 'dashboard' ? '#397cf6' : '#eaeaea',
            color: tab === 'dashboard' ? '#fff' : '#333',
            padding: '10px 24px', border: 'none', borderRadius: 8, cursor: 'pointer'
          }}
        >
          Portfolio Dashboard
        </button>
      </div>

      {/* Content */}
      {tab === 'analyze' && (
        <div>
          <UploadDeck onUploadSuccess={handleUploadSuccess} />
          {uploadedDoc && <AnalysisView docId={uploadedDoc.doc_id} />}
        </div>
      )}
      {tab === 'dashboard' && <Dashboard />}
    </div>
  );
}
