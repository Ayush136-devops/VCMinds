import React, { useEffect, useState } from 'react';
import { ScoreChart, RiskPieChart } from './Charts';

// Defensive display util to avoid React errors for objects/arrays
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

export default function Dashboard() {
  const [startups, setStartups] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  // Bookmarks state and localStorage sync
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vcBookmarks') || '[]');
    } catch {
      return [];
    }
  });
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/docs/')
      .then(r => r.json())
      .then(data => {
        setStartups(
          (data.startups || []).map(doc => ({
            ...doc,
            analysis: typeof doc.analysis_result === "string"
              ? JSON.parse(doc.analysis_result)
              : doc.analysis_result,
            id: doc.id,
          }))
        );
      });
  }, []);

  // Sync bookmarks to localStorage when changed
  useEffect(() => {
    localStorage.setItem('vcBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Filter by either search or bookmarks checkbox
  const filtered = query === '__BOOKMARKS__'
    ? startups.filter(s => bookmarks.includes(s.id))
    : startups.filter(s =>
        (safeDisplay(s.analysis?.["Company Name"]) || "")
          .toLowerCase().includes(query.toLowerCase())
      );

  function showModal(analysis) {
    setSelected(analysis);
  }
  function closeModal() {
    setSelected(null);
  }
  function handleCheckbox(id) {
    setCompareIds((ids) =>
      ids.includes(id)
        ? ids.filter((i) => i !== id)
        : ids.length < 4 ? [...ids, id] : ids
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: 'Roboto, Arial, sans-serif', background: '#f6f7fb', minHeight: '100vh' }}>
      <h2 style={{ textAlign: 'center', fontWeight: 700 }}>VCMinds Analytics Dashboard</h2>

      <div style={{
        display: "flex", gap: 32, marginBottom: 32,
        justifyContent: "center"
      }}>
        <div>
          <h3>Score Distribution</h3>
          <ScoreChart startups={filtered} />
        </div>
        <div>
          <h3>Risk Breakdown</h3>
          <RiskPieChart startups={filtered} />
        </div>
      </div>

      {/* Bookmarks-only filter */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <label style={{ fontWeight: 500, marginRight: 12 }}>
          <input
            type="checkbox"
            checked={!!query && query === '__BOOKMARKS__'}
            onChange={e =>
              setQuery(e.target.checked ? '__BOOKMARKS__' : '')
            }
            style={{ marginRight: 7 }}
          />
          Show only bookmarked companies
        </label>
      </div>

      {/* Search & filter input */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <input
          type="text"
          value={query === '__BOOKMARKS__' ? '' : query}
          disabled={query === '__BOOKMARKS__'}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by company..."
          style={{
            padding: '8px 12px', fontSize: 16,
            borderRadius: 8, border: '1px solid #bbb', width: 280
          }}
        />
      </div>

      {compareIds.length >= 2 && (
        <div style={{ textAlign: "center", margin: "10px 0" }}>
          <button
            onClick={() => setShowCompare(true)}
            style={{
              background: '#ffb300', color: '#222', fontWeight: 700,
              border: 'none', borderRadius: 8, padding: '9px 20px',
              margin: '15px 0', cursor: 'pointer', fontSize: 18
            }}>
            Compare {compareIds.length} Startups
          </button>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%', background: '#fff', borderRadius: 8, boxShadow: "0 2px 8px #eee", borderCollapse: 'collapse', marginBottom: 24
        }}>
          <thead style={{ background: '#efefef' }}>
            <tr>
              <th>Select</th>
              <th>★</th>
              <th>Company</th>
              <th>Founder(s)</th>
              <th>Score</th>
              <th>Market Size</th>
              <th>Traction</th>
              <th>Risks</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, idx) => (
              <tr key={idx} style={{
                borderBottom: '1px solid #eee',
                background: idx % 2 === 0 ? '#fcfcfc' : '#f6f7fb'
              }}>
                <td>
                  <input
                    type="checkbox"
                    checked={compareIds.includes(s.id)}
                    onChange={() => handleCheckbox(s.id)}
                    disabled={compareIds.length >= 4 && !compareIds.includes(s.id)}
                  />
                </td>
                <td>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 22,
                      color: bookmarks.includes(s.id) ? '#fcbc0f' : '#bbb'
                    }}
                    onClick={() => {
                      const isBookmarked = bookmarks.includes(s.id);
                      const newBookmarks = isBookmarked
                        ? bookmarks.filter(id => id !== s.id)
                        : [...bookmarks, s.id];
                      setBookmarks(newBookmarks);
                    }}
                    aria-label="Bookmark"
                    title={bookmarks.includes(s.id) ? "Remove bookmark" : "Save bookmark"}
                  >
                    {bookmarks.includes(s.id) ? '★' : '☆'}
                  </button>
                </td>
                <td>{safeDisplay(s.analysis?.["Company Name"])}</td>
                <td>{safeDisplay(s.analysis?.["Founder(s)"])}</td>
                <td style={{
                  fontWeight: 700,
                  color:
                    Number(safeDisplay(s.analysis?.["Overall Score"])) >= 7 ? "#34c759"
                      : Number(safeDisplay(s.analysis?.["Overall Score"])) >= 4 ? "#ffa500"
                        : "#f44336"
                }}>{safeDisplay(s.analysis?.["Overall Score"])}</td>
                <td>{safeDisplay(s.analysis?.["Market Size"])}</td>
                <td>{safeDisplay(s.analysis?.["Traction"])}</td>
                <td>{safeDisplay(s.analysis?.["Key Risks/Red Flags"])}</td>
                <td>
                  <button
                    onClick={() => showModal(s.analysis)}
                    style={{
                      background: "#397cf6", color: "#fff",
                      borderRadius: 5, border: "none", padding: "7px 13px",
                      fontWeight: 700, cursor: "pointer"
                    }}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for details */}
      {selected && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.23)', zIndex: 10000
        }}>
          <div style={{
            background: "#fff", border: "2px solid #222",
            maxWidth: 600, margin: "60px auto", padding: 24,
            borderRadius: 16, boxShadow: "0 8px 32px #0002", position: "relative"
          }}>
            <button
              onClick={closeModal}
              style={{
                position: "absolute", top: 20, right: 20,
                background: "#fa4a4a", color: "#fff", border: "none", borderRadius: 6,
                fontWeight: 700, padding: "6px 14px", fontSize: 16, cursor: "pointer"
              }}>
              Close
            </button>
            <h3 style={{ marginBottom: 10 }}>{safeDisplay(selected?.["Company Name"])}</h3>
            <pre style={{
              whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              fontSize: 14, background: "#f7f7f7",
              borderRadius: 8, padding: 10, marginTop: 10,
              maxHeight: 390, overflow: "auto"
            }}>
              {JSON.stringify(selected, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showCompare && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999,
          background: 'rgba(0,0,0,0.35)'
        }}>
          <div style={{
            background: '#fff', maxWidth: '95vw', minWidth: 560,
            margin: '55px auto', borderRadius: 16,
            padding: 28, position: 'relative'
          }}>
            <button style={{
              position: 'absolute', right: 18, top: 18, background: '#111', color: '#fff',
              border: 'none', borderRadius: 5, fontWeight: 900, cursor: 'pointer', padding: '7px 14px'
            }} onClick={() => { setShowCompare(false); setCompareIds([]); }}>Close</button>
            <h2 style={{ textAlign: 'center', marginBottom: 20 }}>🚀 Startup Comparison</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Field</th>
                    {compareIds.map(id => {
                      const company = startups.find(s => s.id === id);
                      return (
                        <th key={id}>{safeDisplay(company?.analysis["Company Name"])}</th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {["Founder(s)", "Overall Score", "Market Size", "Traction", "Business Model", "Funding Ask", "Key Risks/Red Flags", "1-Sentence Investment Summary"].map(field => (
                    <tr key={field}>
                      <td style={{ fontWeight: 700, padding: '7px 10px', background: '#fafafa' }}>{field}</td>
                      {compareIds.map(id => {
                        const company = startups.find(s => s.id === id);
                        const value = company?.analysis[field] ?? "Not provided";
                        return <td key={id} style={{ padding: '7px 10px' }}>{safeDisplay(value)}</td>
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
