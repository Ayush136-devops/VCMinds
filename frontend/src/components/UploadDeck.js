import { useState } from 'react';
import axios from 'axios';

const professionalFont = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const UploadDeck = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://127.0.0.1:8000/upload_deck/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(res.data);
      if (onUploadSuccess) {
        onUploadSuccess(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.pptx'))) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a PDF or PPTX file');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Upload Pitch Deck</h2>
        <p style={styles.subtitle}>Upload your startup's pitch deck for AI analysis</p>
      </div>

      <div 
        style={{
          ...styles.uploadArea,
          ...(dragOver ? styles.uploadAreaDragOver : {}),
          ...(file ? styles.uploadAreaWithFile : {})
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file ? (
          <div style={styles.uploadPrompt}>
            <div style={styles.uploadIcon}>📄</div>
            <h3 style={styles.uploadTitle}>Drop your pitch deck here</h3>
            <p style={styles.uploadDescription}>
              Or click to browse files
            </p>
            <p style={styles.fileTypes}>
              Supports PDF and PPTX files
            </p>
            <input
              type="file"
              accept=".pdf,.pptx"
              onChange={handleFileSelect}
              style={styles.hiddenInput}
              id="file-upload"
            />
            <label htmlFor="file-upload" style={styles.browseButton}>
              Browse Files
            </label>
          </div>
        ) : (
          <div style={styles.filePreview}>
            <div style={styles.fileIcon}>
              {file.name.endsWith('.pdf') ? '📕' : '📊'}
            </div>
            <div style={styles.fileInfo}>
              <h4 style={styles.fileName}>{file.name}</h4>
              <p style={styles.fileSize}>{formatFileSize(file.size)}</p>
              <p style={styles.fileType}>
                {file.name.endsWith('.pdf') ? 'PDF Document' : 'PowerPoint Presentation'}
              </p>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
                setError(null);
              }}
              style={styles.removeButton}
              title="Remove file"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {file && !result && (
        <div style={styles.actionSection}>
          <button
            onClick={handleUpload}
            disabled={loading}
            style={{
              ...styles.uploadButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Uploading Document...' : 'Upload & Process'}
          </button>
        </div>
      )}

      {error && (
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>
          <div>
            <h4 style={styles.errorTitle}>Upload Error</h4>
            <p style={styles.errorMessage}>{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✅</div>
          <div style={styles.successContent}>
            <h4 style={styles.successTitle}>Upload Successful</h4>
            <div style={styles.resultDetails}>
              <div style={styles.resultItem}>
                <span style={styles.resultLabel}>File:</span>
                <span style={styles.resultValue}>{result.file_name}</span>
              </div>
              <div style={styles.resultItem}>
                <span style={styles.resultLabel}>Type:</span>
                <span style={styles.resultValue}>{result.doc_type?.toUpperCase()}</span>
              </div>
              <div style={styles.resultItem}>
                <span style={styles.resultLabel}>Document ID:</span>
                <span style={styles.resultValue}>{result.doc_id}</span>
              </div>
            </div>
            <p style={styles.nextStep}>
              Document is ready for analysis. Click "Run Analysis" below to continue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: professionalFont,
    maxWidth: '600px',
    margin: '0 auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
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
  uploadArea: {
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    padding: '40px 24px',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    marginBottom: '24px'
  },
  uploadAreaDragOver: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
    transform: 'scale(1.02)'
  },
  uploadAreaWithFile: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
    cursor: 'default'
  },
  uploadPrompt: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  uploadIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.7
  },
  uploadTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 8px 0'
  },
  uploadDescription: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 16px 0'
  },
  fileTypes: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0 0 20px 0'
  },
  hiddenInput: {
    display: 'none'
  },
  browseButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#3b82f6',
    backgroundColor: '#fff',
    border: '1px solid #3b82f6',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  filePreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    position: 'relative'
  },
  fileIcon: {
    fontSize: '32px',
    minWidth: '40px'
  },
  fileInfo: {
    flex: 1,
    textAlign: 'left'
  },
  fileName: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 4px 0',
    wordBreak: 'break-word'
  },
  fileSize: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 2px 0'
  },
  fileType: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0
  },
  removeButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionSection: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  uploadButton: {
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 600,
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: professionalFont,
    transition: 'background-color 0.2s'
  },
  errorCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '16px'
  },
  errorIcon: {
    fontSize: '20px',
    marginTop: '2px'
  },
  errorTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#dc2626',
    margin: '0 0 4px 0'
  },
  errorMessage: {
    fontSize: '14px',
    color: '#7f1d1d',
    margin: 0
  },
  successCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '6px',
    padding: '16px'
  },
  successIcon: {
    fontSize: '20px',
    marginTop: '2px'
  },
  successContent: {
    flex: 1
  },
  successTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#059669',
    margin: '0 0 12px 0'
  },
  resultDetails: {
    marginBottom: '12px'
  },
  resultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px'
  },
  resultLabel: {
    fontSize: '14px',
    color: '#374151',
    fontWeight: 500
  },
  resultValue: {
    fontSize: '14px',
    color: '#111827',
    fontWeight: 400
  },
  nextStep: {
    fontSize: '14px',
    color: '#065f46',
    margin: 0,
    fontStyle: 'italic'
  }
};

export default UploadDeck;
