import { useState } from 'react';
import axios from 'axios';

const UploadDeck = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

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

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Upload Pitch Deck</h2>
      <div style={styles.uploadBox}>
        <input
          type="file"
          accept=".pdf,.pptx"
          onChange={(e) => setFile(e.target.files[0])}
          style={styles.fileInput}
        />
        {file && <p style={styles.fileName}>Selected: {file.name}</p>}
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          style={{
            ...styles.button,
            opacity: loading || !file ? 0.5 : 1,
          }}
        >
          {loading ? '⏳ Uploading...' : '📤 Upload'}
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          ❌ {error}
        </div>
      )}

      {result && (
        <div style={styles.success}>
          <h3>✅ Upload Successful!</h3>
          <p><strong>File:</strong> {result.file_name}</p>
          <p><strong>Type:</strong> {result.doc_type}</p>
          <p><strong>Document ID:</strong> {result.doc_id}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  uploadBox: {
    border: '2px dashed #ccc',
    borderRadius: '8px',
    padding: '30px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  fileInput: {
    marginBottom: '15px',
  },
  fileName: {
    margin: '10px 0',
    color: '#555',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  error: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '5px',
    border: '1px solid #ef5350',
  },
  success: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '5px',
    border: '1px solid #66bb6a',
  },
};

export default UploadDeck;
