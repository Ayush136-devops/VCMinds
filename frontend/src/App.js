import { useState } from 'react';
import UploadDeck from './components/UploadDeck';
import AnalysisView from './components/AnalysisView';
import './App.css';

function App() {
  const [currentDocId, setCurrentDocId] = useState(null);

  const handleUploadSuccess = (data) => {
    setCurrentDocId(data.doc_id);
  };

  return (
    <div className="App">
      <header style={styles.header}>
        <h1>🚀 VCMinds - AI Startup Analyzer</h1>
        <p>Upload pitch decks and get instant AI-powered investment analysis</p>
      </header>

      <main style={styles.main}>
        <UploadDeck onUploadSuccess={handleUploadSuccess} />

        {currentDocId && (
          <div style={styles.divider}>
            <hr />
          </div>
        )}

        {currentDocId && <AnalysisView docId={currentDocId} />}
      </main>
    </div>
  );
}

const styles = {
  header: {
    backgroundColor: '#282c34',
    padding: '30px',
    color: 'white',
    textAlign: 'center',
  },
  main: {
    minHeight: '80vh',
    padding: '20px',
  },
  divider: {
    margin: '40px 0',
  },
};

export default App;

