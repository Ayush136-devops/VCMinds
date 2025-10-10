import React, { useEffect, useState } from 'react';
import { ScoreChart, RiskPieChart } from './Charts';

const professionalFont = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const PRESETS_KEY = 'vcminds_filter_presets';

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
  const [minScore, setMinScore] = useState(1);
  const [maxScore, setMaxScore] = useState(10);
  const [riskKeyword, setRiskKeyword] = useState("");
  const [marketSize, setMarketSize] = useState("all");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const [presets, setPresets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(PRESETS_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [selectedPreset, setSelectedPreset] = useState("");

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

  // Filtering
  const filtered = startups.filter(s => {
    const analysis = s.analysis || {};
    const score = Number(analysis['Overall Score']) || 0;
    if (score < minScore || score > maxScore) return false;
    if (query && !safeDisplay(analysis['Company Name']).toLowerCase().includes(query.toLowerCase())) return false;
    if (bookmarkedOnly && !bookmarks.includes(s.id)) return false;
    const riskText = safeDisplay(analysis['Key Risks/Red Flags']).toLowerCase();
    if (riskKeyword && !riskText.includes(riskKeyword.toLowerCase())) return false;
    const marketText = safeDisplay(analysis['Market Size']).toLowerCase();
    if (marketSize !== 'all') {
      if (marketSize === 'small' && !marketText.includes('million')) return false;
      if (marketSize === 'medium' && !marketText.includes('billion')) return false;
      if (marketSize === 'large' && !marketText.includes('trillion')) return false;
    }
    return true;
  });

  function handleCheckbox(id) {
    setCompareIds((ids) =>
      ids.includes(id)
        ? ids.filter((i) => i !== id)
        : ids.length < 4 ? [...ids, id] : ids
    );
  }

  function toggleBookmark(id) {
    const isBookmarked = bookmarks.includes(id);
    setBookmarks(isBookmarked
      ? bookmarks.filter(bookmarkId => bookmarkId !== id)
      : [...bookmarks, id]);
  }

  // === Preset Management ===

  function savePreset() {
    const name = prompt("Name this filter preset:");
    if (!name) return;
    const newPreset = {
      name,
      query,
      minScore,
      maxScore,
      riskKeyword,
      marketSize,
      bookmarkedOnly
    };
    const updated = [...presets.filter(p => p.name !== name), newPreset];
    setPresets(updated);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
    setSelectedPreset(name);
  }

  function loadPreset(name) {
    const preset = presets.find(p => p.name === name);
    if (!preset) return;
    setQuery(preset.query);
    setMinScore(preset.minScore);
    setMaxScore(preset.maxScore);
    setRiskKeyword(preset.riskKeyword);
    setMarketSize(preset.marketSize);
    setBookmarkedOnly(preset.bookmarkedOnly);
    setSelectedPreset(name);
  }

  function deletePreset(name) {
    const updated = presets.filter(p => p.name !== name);
    setPresets(updated);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(updated));
    setSelectedPreset("");
  }

  return (
    <div style={{ 
      padding: "32px", 
      fontFamily: professionalFont, 
      background: '#fff',
      minHeight: '600px'
    }}>
      {/* Preset Save/Load UI */}
      <div style={{
        maxWidth: 1200,
        margin: "0 auto 18px auto",
        display: "flex",
        alignItems: "center",
        gap: 16
      }}>
        <select
          value={selectedPreset}
          onChange={e => loadPreset(e.target.value)}
          style={{
            ...filterInputStyle, width: 220, minWidth: 80
          }}
        >
          <option value="">— Load Saved Preset —</option>
          {presets.map(preset =>
            <option key={preset.name} value={preset.name}>{preset.name}</option>
          )}
        </select>
        <button onClick={savePreset} style={{...presetBtn, background: "#3b82f6", color:"#fff"}}>Save Filter</button>
        {selectedPreset &&
          <button onClick={() => deletePreset(selectedPreset)} style={{...presetBtn, background: "#f3f4f6", color:"#dc2626"}}>
            Delete Preset
          </button>
        }
      </div>
      {/* Advanced Filters */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        maxWidth: 1200,
        margin: "0 auto 32px auto",
        padding: "16px",
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: 8
      }}>
        <div>
          <label style={filterLabelStyle}>Company Search</label>
          <input
            type="text"
            placeholder="Search by company name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={filterInputStyle}
          />
        </div>
        <div>
          <label style={filterLabelStyle}>Score Range</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              min="1"
              max="10"
              value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              style={{ ...filterInputStyle, width: "60px" }}
            />
            <span>–</span>
            <input
              type="number"
              min="1"
              max="10"
              value={maxScore}
              onChange={e => setMaxScore(Number(e.target.value))}
              style={{ ...filterInputStyle, width: "60px" }}
            />
          </div>
        </div>
        <div>
          <label style={filterLabelStyle}>Risk Keyword</label>
          <input
            type="text"
            placeholder="Filter by risk..."
            value={riskKeyword}
            onChange={e => setRiskKeyword(e.target.value)}
            style={filterInputStyle}
          />
        </div>
        <div>
          <label style={filterLabelStyle}>Market Size</label>
          <select
            value={marketSize}
            onChange={e => setMarketSize(e.target.value)}
            style={filterInputStyle}
          >
            <option value="all">All Markets</option>
            <option value="small">Small (&lt;$1B)</option>
            <option value="medium">Medium ($1B-$10B)</option>
            <option value="large">Large (&gt;$10B)</option>
          </select>
        </div>
        <div>
          <label style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            color: "#374151",
            cursor: "pointer",
            marginTop: 20
          }}>
            <input
              type="checkbox"
              checked={bookmarkedOnly}
              onChange={e => setBookmarkedOnly(e.target.checked)}
            />
            Bookmarked Only
          </label>
        </div>
      </div>

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
            Score Distribution ({filtered.length} companies)
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

      {/* Compare Button */}
      {compareIds.length >= 2 && (
        <div style={{ textAlign: "center", marginBottom: 24 }}>
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
        </div>
      )}

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
                  <td style={{ ...cellStyle, fontWeight: 600, color: "#111827" }}>
                    {safeDisplay(s.analysis?.["Company Name"])}
                  </td>
                  <td style={{ ...cellStyle, color: "#6b7280" }}>
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

// Filter styles
const filterLabelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: "#374151",
  marginBottom: 4
};

const filterInputStyle = {
  width: "100%",
  padding: "8px 12px",
  fontSize: 14,
  border: "1px solid #d1d5db",
  borderRadius: 4,
  outline: "none",
  fontFamily: professionalFont
};

const presetBtn = {
  border: 'none',
  borderRadius: 4,
  fontSize: 13,
  fontWeight: 500,
  padding: "8px 18px",
  cursor: "pointer"
};

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
