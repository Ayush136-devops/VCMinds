import React, { useEffect, useState } from 'react';
import { ScoreChart, RiskPieChart } from './Charts';

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

export default function Dashboard({ startups = [] }) {
  const [query, setQuery] = useState("");
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vcBookmarks') || '[]');
    } catch {
      return [];
    }
  });
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    localStorage.setItem('vcBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const filtered = query === '__BOOKMARKS__'
    ? startups.filter(s => bookmarks.includes(s.id))
    : startups.filter(s =>
        (safeDisplay(s.analysis?.["Company Name"]) || "")
          .toLowerCase().includes(query.toLowerCase())
      );

  function handleCheckbox(id) {
    setCompareIds((ids) =>
      ids.includes(id)
        ? ids.filter((i) => i !== id)
        : ids.length < 4 ? [...ids, id] : ids
    );
  }

  function toggleBookmark(id) {
    const isBookmarked = bookmarks.includes(id);
    const newBookmarks = isBookmarked
      ? bookmarks.filter(bookmarkId => bookmarkId !== id)
      : [...bookmarks, id];
    setBookmarks(newBookmarks);
  }

  return (
    <div style={{ 
      padding: "32px", 
      fontFamily: professionalFont, 
      background: '#fff',
      minHeight: '600px'
    }}>
      {/* Analytics Overview */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 40,
        marginBottom: 40,
        maxWidth: 1000,
        margin: "0 auto 40px auto"
      }}>
        <div style={{
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 24
        }}>
          <h3 style={{ 
            margin: "0 0 16px 0", 
            fontSize: 16, 
            fontWeight: 600, 
            color: "#111827" 
          }}>
            Score Distribution
          </h3>
          <ScoreChart startups={filtered} />
        </div>
        <div style={{
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 24
        }}>
          <h3 style={{ 
            margin: "0 0 16px 0", 
            fontSize: 16, 
            fontWeight: 600, 
            color: "#111827" 
          }}>
            Risk Analysis
          </h3>
          <RiskPieChart startups={filtered} />
        </div>
      </div>

      {/* Controls */}
      <div style={{ 
        maxWidth: 1200, 
        margin: "0 auto 24px auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "center"
      }}>
        {/* Bookmarks Filter */}
        <div>
          <label style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 8, 
            fontSize: 14, 
            color: "#374151",
            cursor: "pointer"
          }}>
            <input
              type="checkbox"
              checked={!!query && query === '__BOOKMARKS__'}
              onChange={e => setQuery(e.target.checked ? '__BOOKMARKS__' : '')}
              style={{ margin: 0 }}
            />
            Show bookmarked companies only
          </label>
        </div>

        {/* Search */}
        <div style={{ position: "relative", width: "100%", maxWidth: 400 }}>
          <input
            type="text"
            value={query === '__BOOKMARKS__' ? '' : query}
            disabled={query === '__BOOKMARKS__'}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search companies..."
            style={{
              width: "100%",
              padding: '12px 16px',
              fontSize: 15,
              borderRadius: 6,
              border: '1px solid #d1d5db',
              background: '#fff',
              fontFamily: professionalFont,
              outline: "none"
            }}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e => e.target.style.borderColor = "#d1d5db"}
          />
        </div>

        {/* Compare Button */}
        {compareIds.length >= 2 && (
          <button
            onClick={() => setShowCompare(true)}
            style={{
              background: '#3b82f6',
              color: '#fff',
              fontWeight: 600,
              border: 'none',
              borderRadius: 6,
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: professionalFont
            }}
          >
            Compare {compareIds.length} Companies
          </button>
        )}
      </div>

      {/* Data Table */}
      <div style={{ 
        maxWidth: 1200, 
        margin: "0 auto",
        overflowX: 'auto' 
      }}>
        <table style={{
          width: '100%',
          background: '#fff',
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          borderCollapse: 'separate',
          borderSpacing: 0,
          overflow: "hidden"
        }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={headerStyle}>Select</th>
              <th style={headerStyle}>Bookmark</th>
              <th style={headerStyle}>Company</th>
              <th style={headerStyle}>Founder(s)</th>
              <th style={headerStyle}>Score</th>
              <th style={headerStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, idx) => (
              <React.Fragment key={s.id}>
                <tr style={{
                  borderBottom: '1px solid #f3f4f6',
                  background: idx % 2 === 0 ? '#fff' : '#f9fafb'
                }}>
                  <td style={cellStyle}>
                    <input
                      type="checkbox"
                      checked={compareIds.includes(s.id)}
                      onChange={() => handleCheckbox(s.id)}
                      disabled={compareIds.length >= 4 && !compareIds.includes(s.id)}
                    />
                  </td>
                  <td style={cellStyle}>
                    <button
                      onClick={() => toggleBookmark(s.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 18,
                        color: bookmarks.includes(s.id) ? '#f59e0b' : '#d1d5db',
                        padding: 4
                      }}
                      title={bookmarks.includes(s.id) ? "Remove bookmark" : "Add bookmark"}
                    >
                      ★
                    </button>
                  </td>
                  <td style={{...cellStyle, fontWeight: 600, color: "#111827"}}>
                    {safeDisplay(s.analysis?.["Company Name"])}
                  </td>
                  <td style={{...cellStyle, color: "#6b7280"}}>
                    {safeDisplay(s.analysis?.["Founder(s)"])}
                  </td>
                  <td style={{
                    ...cellStyle,
                    fontWeight: 700,
                    color: getScoreColor(s.analysis?.["Overall Score"])
                  }}>
                    {safeDisplay(s.analysis?.["Overall Score"])}
                  </td>
                  <td style={cellStyle}>
                    <button
                      onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                      style={{
                        background: "none",
                        border: "1px solid #d1d5db",
                        color: "#374151",
                        fontWeight: 500,
                        fontSize: 13,
                        cursor: "pointer",
                        padding: "6px 12px",
                        borderRadius: 4,
                        fontFamily: professionalFont
                      }}
                    >
                      {expanded === s.id ? "Hide Details" : "View Details"}
                    </button>
                  </td>
                </tr>
                {expanded === s.id && (
                  <tr>
                    <td colSpan={6} style={{ padding: 0, border: "none" }}>
                      <div style={{
                        background: "#f8fafc",
                        border: "1px solid #e5e7eb",
                        borderRadius: 6,
                        margin: "8px 16px",
                        padding: "24px"
                      }}>
                        <div style={{ 
                          display: "grid", 
                          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                          gap: 24 
                        }}>
                          <DetailSection 
                            title="Market Size" 
                            value={safeDisplay(s.analysis?.["Market Size"])} 
                          />
                          <DetailSection 
                            title="Traction" 
                            value={safeDisplay(s.analysis?.["Traction"])} 
                          />
                          <DetailSection 
                            title="Key Risks" 
                            value={safeDisplay(s.analysis?.["Key Risks/Red Flags"])} 
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Comparison Modal */}
      {showCompare && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          background: 'rgba(0,0,0,0.5)',
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: '#fff',
            maxWidth: '90vw',
            maxHeight: '80vh',
            borderRadius: 8,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: 18, 
                fontWeight: 600, 
                color: "#111827" 
              }}>
                Company Comparison
              </h2>
              <button 
                onClick={() => { setShowCompare(false); setCompareIds([]); }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: 4
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "24px", overflow: "auto" }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: 14
              }}>
                <thead>
                  <tr>
                    <th style={comparisonHeaderStyle}>Metric</th>
                    {compareIds.map(id => {
                      const company = startups.find(s => s.id === id);
                      return (
                        <th key={id} style={comparisonHeaderStyle}>
                          {safeDisplay(company?.analysis["Company Name"])}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {[
                    "Founder(s)", 
                    "Overall Score", 
                    "Market Size", 
                    "Traction", 
                    "Business Model", 
                    "Funding Ask", 
                    "Key Risks/Red Flags"
                  ].map(field => (
                    <tr key={field}>
                      <td style={comparisonCellStyle}>
                        <strong>{field}</strong>
                      </td>
                      {compareIds.map(id => {
                        const company = startups.find(s => s.id === id);
                        const value = company?.analysis[field] ?? "Not provided";
                        return (
                          <td key={id} style={comparisonCellStyle}>
                            {safeDisplay(value)}
                          </td>
                        );
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

function DetailSection({ title, value }) {
  return (
    <div>
      <h4 style={{
        margin: "0 0 8px 0",
        fontSize: 14,
        fontWeight: 600,
        color: "#374151"
      }}>
        {title}
      </h4>
      <p style={{
        margin: 0,
        fontSize: 14,
        color: "#6b7280",
        lineHeight: 1.5
      }}>
        {value}
      </p>
    </div>
  );
}

function getScoreColor(score) {
  const numScore = Number(score);
  if (numScore >= 7) return "#059669";
  if (numScore >= 4) return "#d97706";
  return "#dc2626";
}

const headerStyle = {
  textAlign: "left",
  padding: '16px',
  fontWeight: 600,
  fontSize: 14,
  color: "#374151",
  background: "#f8fafc",
  borderBottom: "1px solid #e5e7eb"
};

const cellStyle = {
  padding: '16px',
  fontSize: 14,
  color: "#111827",
  verticalAlign: "middle",
  borderBottom: "1px solid #f3f4f6"
};

const comparisonHeaderStyle = {
  textAlign: "left",
  padding: '12px 16px',
  fontWeight: 600,
  fontSize: 13,
  color: "#374151",
  background: "#f8fafc",
  borderBottom: "1px solid #e5e7eb"
};

const comparisonCellStyle = {
  padding: '12px 16px',
  fontSize: 13,
  color: "#111827",
  verticalAlign: "top",
  borderBottom: "1px solid #f3f4f6",
  maxWidth: "200px",
  wordWrap: "break-word"
};
