import { useState } from 'react';
import axios from 'axios';

const professionalFont = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

function safeDisplay(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value;
  if (Array.isArray(value)) return value.map(safeDisplay).join(", ");
  if (typeof value === "object" && value !== null) {
    if ("msg" in value) return value.msg;
    return JSON.stringify(value);
  }
  return "Not provided";
}

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
    const nScore = Number(safeDisplay(score));
    if (nScore >= 7) return '#059669';
    if (nScore >= 4) return '#d97706';
    return '#dc2626';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Investment Analysis</h2>
        <p style={styles.subtitle}>AI-powered due diligence report</p>
      </div>

      {!analysis && (
        <div style={styles.actionSection}>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              ...styles.analyzeButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Analyzing Document...' : 'Run Analysis'}
          </button>
          <p style={styles.helpText}>
            Click to generate comprehensive investment analysis using AI
          </p>
        </div>
      )}

      {error && (
        <div style={styles.errorCard}>
          <h4 style={styles.errorTitle}>Analysis Error</h4>
          <p style={styles.errorMessage}>{safeDisplay(error)}</p>
        </div>
      )}

      {analysis && (
        <div style={styles.resultsContainer}>
          {/* Score Section */}
          <div style={styles.scoreSection}>
            <div style={styles.scoreCard}>
              <h3 style={styles.scoreLabel}>Investment Score</h3>
              <div style={{
                ...styles.scoreValue,
                color: getScoreColor(analysis['Overall Score'])
              }}>
                {safeDisplay(analysis['Overall Score'])}/10
              </div>
            </div>
          </div>

          {/* Company Overview */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Company Overview</h3>
            <div style={styles.grid}>
              <DataField 
                label="Company Name" 
                value={safeDisplay(analysis['Company Name'])} 
              />
              <DataField 
                label="Founder(s)" 
                value={safeDisplay(analysis['Founder(s)'])} 
              />
            </div>
          </div>

          {/* Business Analysis */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Business Analysis</h3>
            <div style={styles.fieldGroup}>
              <DataField 
                label="Problem Statement" 
                value={safeDisplay(analysis['Problem Statement'])}
                multiline 
              />
              <DataField 
                label="Solution Overview" 
                value={safeDisplay(analysis['Solution Overview'])}
                multiline 
              />
              <DataField 
                label="Business Model" 
                value={safeDisplay(analysis['Business Model'])}
                multiline 
              />
            </div>
          </div>

          {/* Market & Traction */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Market & Traction</h3>
            <div style={styles.fieldGroup}>
              <DataField 
                label="Market Size" 
                value={safeDisplay(analysis['Market Size'])}
                multiline 
              />
              <DataField 
                label="Traction" 
                value={safeDisplay(analysis['Traction'])}
                multiline 
              />
              <DataField 
                label="Funding Ask" 
                value={safeDisplay(analysis['Funding Ask'])} 
              />
            </div>
          </div>

          {/* Risk Assessment */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Risk Assessment</h3>
            <div style={styles.riskCard}>
              <h4 style={styles.riskTitle}>Key Risks & Red Flags</h4>
              <p style={styles.riskContent}>
                {safeDisplay(analysis['Key Risks/Red Flags'])}
              </p>
            </div>
          </div>

          {/* Investment Summary */}
          <div style={styles.section}>
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Investment Summary</h3>
              <p style={styles.summaryContent}>
                {safeDisplay(analysis['1-Sentence Investment Summary'])}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actionSection}>
            <button 
              onClick={handleAnalyze} 
              style={styles.reanalyzeButton}
              disabled={loading}
            >
              {loading ? 'Re-analyzing...' : 'Re-analyze Document'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function DataField({ label, value, multiline = false }) {
  return (
    <div style={styles.dataField}>
      <label style={styles.fieldLabel}>{label}</label>
      <div style={multiline ? styles.fieldValueMultiline : styles.fieldValue}>
        {value}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: professionalFont,
    maxWidth: '800px',
    margin: '0 auto',
    background: '#fff'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e5e7eb'
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0
  },
  actionSection: {
    textAlign: 'center',
    margin: '32px 0'
  },
  analyzeButton: {
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 600,
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: professionalFont,
    transition: 'background-color 0.2s'
  },
  helpText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '12px 0 0 0'
  },
  errorCard: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '16px',
    margin: '16px 0'
  },
  errorTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#dc2626',
    margin: '0 0 8px 0'
  },
  errorMessage: {
    fontSize: '14px',
    color: '#7f1d1d',
    margin: 0
  },
  resultsContainer: {
    marginTop: '24px'
  },
  scoreSection: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px'
  },
  scoreCard: {
    background: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    minWidth: '200px'
  },
  scoreLabel: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#374151',
    margin: '0 0 8px 0'
  },
  scoreValue: {
    fontSize: '32px',
    fontWeight: 700,
    margin: 0
  },
  section: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 16px 0',
    paddingBottom: '8px',
    borderBottom: '2px solid #e5e7eb'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  dataField: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '16px'
  },
  fieldLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    display: 'block',
    marginBottom: '8px'
  },
  fieldValue: {
    fontSize: '14px',
    color: '#111827',
    lineHeight: 1.5
  },
  fieldValueMultiline: {
    fontSize: '14px',
    color: '#111827',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap'
  },
  riskCard: {
    background: '#fef7f0',
    border: '1px solid #fed7aa',
    borderLeft: '4px solid #f59e0b',
    borderRadius: '6px',
    padding: '16px'
  },
  riskTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#92400e',
    margin: '0 0 8px 0'
  },
  riskContent: {
    fontSize: '14px',
    color: '#451a03',
    margin: 0,
    lineHeight: 1.6
  },
  summaryCard: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderLeft: '4px solid #3b82f6',
    borderRadius: '6px',
    padding: '20px'
  },
  summaryTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e40af',
    margin: '0 0 12px 0'
  },
  summaryContent: {
    fontSize: '15px',
    color: '#1e3a8a',
    margin: 0,
    lineHeight: 1.6,
    fontStyle: 'italic'
  },
  reanalyzeButton: {
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: 500,
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: professionalFont
  }
};

export default AnalysisView;
