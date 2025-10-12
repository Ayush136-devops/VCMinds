import { useState } from 'react';
import axios from 'axios';

const professionalFont = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const api = import.meta.env.VITE_BACKEND_URL;

const UploadDeck = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

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
      const res = await axios.post(`${api}/upload_deck/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(res.data);
      setUploadComplete(true);
      
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

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setUploadComplete(false);
    setDragOver(false);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
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

  // Show success state after upload
  if (uploadComplete && result) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        fontFamily: professionalFont
      }}>
        <div style={{
          background: 'linear-gradient(160deg, #323232ff 0%, #5a5a5aff 50%, #1e1e1eff 100%)',
          borderRadius: '16px',
          padding: '2rem',
          color: 'white',
          textAlign: 'center',
          marginBottom: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>Upload Successful!</h2>
          <p style={{ margin: 0, opacity: 0.9 }}>Your pitch deck has been uploaded and is ready for analysis</p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          marginBottom: '2rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ 
            margin: '0 0 1rem 0', 
            color: '#1a202c',
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📄 Document Details
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            background: '#f8fafc',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <div>
              <strong>File Name:</strong>
              <div style={{ color: '#4a5568', marginTop: '0.25rem' }}>{file.name}</div>
            </div>
            <div>
              <strong>File Size:</strong>
              <div style={{ color: '#4a5568', marginTop: '0.25rem' }}>{formatFileSize(file.size)}</div>
            </div>
            <div>
              <strong>Document ID:</strong>
              <div style={{ color: '#4a5568', marginTop: '0.25rem', fontFamily: 'monospace' }}>{result.doc_id}</div>
            </div>
            <div>
              <strong>Type:</strong>
              <div style={{ color: '#4a5568', marginTop: '0.25rem' }}>
                {file.name.endsWith('.pdf') ? 'PDF Document' : 'PowerPoint Presentation'}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleReset}
            style={{
              background: 'linear-gradient(135deg, #2d2f36ff 0%, #656567ff 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: professionalFont,
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Upload Another Deck
          </button>
          
          
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: '#718096',
          fontSize: '0.9rem'
        }}>
          💡 Tip: Head to the Analysis tab to run AI analysis on your uploaded deck
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: professionalFont
    }}>
      <div style={{
        background: 'linear-gradient(160deg, #323232ff 0%, #5a5a5aff 50%, #1e1e1eff 100%)',
        borderRadius: '16px',
        padding: '2rem',
        color: 'white',
        textAlign: 'center',
        marginBottom: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>Upload Pitch Deck</h2>
        <p style={{ margin: 0, opacity: 0.9 }}>Upload your startup's pitch deck for AI analysis</p>
      </div>

      {error && (
        <div style={{
          background: '#fed7d7',
          color: '#c53030',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: '1px solid #feb2b2'
        }}>
          {error}
        </div>
      )}

      {!file && (
        <div
          style={{
            border: dragOver ? '2px dashed #667eea' : '2px dashed #cbd5e0',
            borderRadius: '12px',
            padding: '3rem 2rem',
            textAlign: 'center',
            background: dragOver ? '#edf2f7' : 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>
            Drag & Drop your file here
          </h3>
          <p style={{ margin: '0 0 1rem 0', color: '#718096' }}>
            Or click to browse files
          </p>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0aec0' }}>
            Supports PDF and PPTX files
          </p>
          
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.pptx"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {file && !uploadComplete && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              background: '#e4e7f5ff',
              color: 'white',
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              📄
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '0.25rem' }}>
                {file.name}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                {formatFileSize(file.size)} • {file.name.endsWith('.pdf') ? 'PDF Document' : 'PowerPoint Presentation'}
              </div>
            </div>
            <button
              onClick={handleReset}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#718096',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{
            background: '#f0fff4',
            color: '#22543d',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #c6f6d5'
          }}>
            ✅ Document is ready for analysis. Click "Run Analysis" below to continue.
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={handleUpload}
              disabled={loading}
              style={{
                background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #cabdd8ff 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: professionalFont,
                boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? ' Uploading...' : ' Run Analysis'}
            </button>
            
            <button
              onClick={handleReset}
              style={{
                background: 'white',
                color: '#718096',
                border: '2px solid #e2e8f0',
                padding: '12px 28px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: professionalFont,
                transition: 'all 0.2s ease'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDeck;