import { useState } from 'react';
import axios from 'axios';

const AnalysisView = ({ docId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`http://127.0.0.1:8000/analyze/${docId}`);
      setAnalysis(res.data.analysis_result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 7) return '#4CAF50';
    if (score >= 4) return '#FF9800';
    return '#f44336';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>AI Analysis</h2>

      {!analysis && (
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            ...styles.analyzeButton,
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? '🔄 Analyzing...' : '🤖 Run AI Analysis'}
        </button>
      )}

      {error && (
        <div style={styles.error}>
          ❌ {error}
        </div>
      )}

      {analysis && (
        <div style={styles.results}>
          <h3 style={styles.sectionTitle}>📊 Analysis Results</h3>

          <div style={styles.scoreBox}>
            <h2 style={{ color: getScoreColor(analysis['Overall Score']) }}>
              Score: {analysis['Overall Score']}/10
            </h2>
          </div>

          <div style={styles.field}>
            <strong>🏢 Company Name:</strong>
            <p>{analysis['Company Name']}</p>
          </div>

          <div style={styles.field}>
            <strong>👥 Founder(s):</strong>
            <p>{analysis['Founder(s)']}</p>
          </div>

          <div style={styles.field}>
            <strong>❓ Problem Statement:</strong>
            <p>{analysis['Problem Statement']}</p>
          </div>

          <div style={styles.field}>
            <strong>💡 Solution Overview:</strong>
            <p>{analysis['Solution Overview']}</p>
          </div>

          <div style={styles.field}>
            <strong>📈 Market Size:</strong>
            <p>{analysis['Market Size']}</p>
          </div>

          <div style={styles.field}>
            <strong>💰 Business Model:</strong>
            <p>{analysis['Business Model']}</p>
          </div>

          <div style={styles.field}>
            <strong>🚀 Traction:</strong>
            <p>{analysis['Traction']}</p>
          </div>

          <div style={styles.field}>
            <strong>💵 Funding Ask:</strong>
            <p>{analysis['Funding Ask']}</p>
          </div>

          <div style={styles.redFlags}>
            <strong>🚩 Key Risks/Red Flags:</strong>
            <p>{analysis['Key Risks/Red Flags']}</p>
          </div>

          <div style={styles.summary}>
            <strong>📝 Investment Summary:</strong>
            <p>{analysis['1-Sentence Investment Summary']}</p>
          </div>

          <button onClick={handleAnalyze} style={styles.reanalyzeButton}>
            🔄 Re-analyze
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  analyzeButton: {
    padding: '15px 30px',
    fontSize: '18px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
  },
  error: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '5px',
    border: '1px solid #ef5350',
  },
  results: {
    marginTop: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    marginBottom: '15px',
    color: '#333',
  },
  scoreBox: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '2px solid #ddd',
  },
  field: {
    marginBottom: '15px',
    padding: '15px',
    backgroundColor: '#fafafa',
    borderRadius: '5px',
    borderLeft: '4px solid #2196F3',
  },
  redFlags: {
    marginBottom: '15px',
    padding: '15px',
    backgroundColor: '#fff3e0',
    borderRadius: '5px',
    borderLeft: '4px solid #f44336',
  },
  summary: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
    border: '2px solid #2196F3',
    fontSize: '16px',
  },
  reanalyzeButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default AnalysisView;
