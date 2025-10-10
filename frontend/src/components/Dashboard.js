import React, { useEffect, useState } from 'react';
import { ScoreChart, RiskPieChart } from './Charts';

// Defensive display util to avoid React errors for objects/arrays
function safeDisplay(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null) {
    // Gemini/OpenAI validation object, prefer msg
    if ("msg" in value) return value.msg;
    // If it's something else, just stringify
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return value.join(", ");
  return "Not provided";
}

export default function Dashboard() {
  const [startups, setStartups] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch('http://localhost:8000/docs/')
      .then(r => r.json())
      .then(data => {
        setStartups(
          (data.startups || []).map(doc => ({
            ...doc,
            analysis: typeof doc.analysis_result === "string"
              ? JSON.parse(doc.analysis_result)
              : doc.analysis_result
          }))
        );
      });
  }, []);

  // Search by safe company name
  const filtered = startups.filter(s =>
    (safeDisplay(s.analysis?.["Company Name"] || "")).toLowerCase().includes(query.toLowerCase())
  );

  function showModal(analysis) { setSelected(analysis); }
  function closeModal() { setSelected(null); }

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

      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by company..."
          style={{
            padding: '8px 12px', fontSize: 16,
            borderRadius: 8, border: '1px solid #bbb', width: 280
          }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%', background: '#fff', borderRadius: 8, boxShadow: "0 2px 8px #eee", borderCollapse: 'collapse', marginBottom: 24
        }}>
          <thead style={{ background: '#efefef' }}>
            <tr>
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

    </div>
  );
}
