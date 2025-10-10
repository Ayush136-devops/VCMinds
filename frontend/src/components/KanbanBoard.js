import React, { useEffect, useState } from 'react';

const PIPELINE_STAGES = [
  { key: 'new', name: 'New', color: '#1976d2' },
  { key: 'reviewing', name: 'Reviewing', color: '#26a69a' },
  { key: 'shortlisted', name: 'Shortlisted', color: '#fbc02d' },
  { key: 'funded', name: 'Funded', color: '#388e3c' }
];

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

export default function KanbanBoard({ startups }) {
  const [statuses, setStatuses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vcStatuses') || '{}');
    } catch {
      return {};
    }
  });
  const [moveMenu, setMoveMenu] = useState(null);
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('vcBookmarks') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('vcStatuses', JSON.stringify(statuses));
  }, [statuses]);

  useEffect(() => {
    localStorage.setItem('vcBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const filteredStartups = startups.filter(s =>
    (safeDisplay(s.analysis?.["Company Name"]) + " " + safeDisplay(s.analysis?.["Founder(s)"])).toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  const dealsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.key] = [];
    return acc;
  }, {});

  filteredStartups.forEach(s => {
    const status = statuses[s.id] || 'new';
    if (dealsByStage[status]) {
      dealsByStage[status].push(s);
    } else {
      dealsByStage['new'].push(s);
    }
  });

  function moveDeal(id, targetStage) {
    setStatuses(statuses => ({ ...statuses, [id]: targetStage }));
    setMoveMenu(null);
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
      padding: "20px", 
      width: '100%', 
      minHeight: 520, 
      background: "#f8fafd",
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Search Bar */}
      <div style={{ 
        textAlign: "center", 
        marginBottom: 24
      }}>
        <div style={{ position: "relative", display: "inline-block", maxWidth: 400, width: "100%" }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search company or founder..."
            style={{
              padding: "12px 16px",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              width: "100%",
              fontSize: 15,
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              outline: "none",
              fontFamily: 'inherit'
            }}
            onFocus={e => {
              e.target.style.borderColor = "#1976d2";
              e.target.style.boxShadow = "0 0 0 3px rgba(25, 118, 210, 0.1)";
            }}
            onBlur={e => {
              e.target.style.borderColor = "#d1d5db";
              e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "none",
                fontSize: 16,
                color: "#6b7280",
                cursor: "pointer",
                padding: "4px"
              }}
            >×</button>
          )}
        </div>
      </div>

      {/* Kanban Board - Grid Layout (No Horizontal Scroll) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        {PIPELINE_STAGES.map(stage => (
          <div key={stage.key}
            style={{
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #e5e7eb",
              overflow: "hidden"
            }}>
            
            {/* Column Header */}
            <div style={{
              background: "#f9fafb",
              padding: "16px",
              borderBottom: "1px solid #e5e7eb"
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h3 style={{
                  margin: 0,
                  fontWeight: 600,
                  fontSize: 16,
                  color: "#111827"
                }}>
                  {stage.name}
                </h3>
                <span style={{
                  background: stage.color,
                  color: "#fff",
                  borderRadius: 4,
                  padding: "2px 8px",
                  fontSize: 12,
                  fontWeight: 600
                }}>
                  {dealsByStage[stage.key].length}
                </span>
              </div>
            </div>

            {/* Cards Container */}
            <div style={{ 
              padding: "12px",
              minHeight: 300,
              maxHeight: "60vh",
              overflowY: "auto"
            }}>
              {dealsByStage[stage.key].length === 0 && (
                <div style={{
                  color: "#9ca3af",
                  fontSize: 14,
                  margin: "40px 0",
                  textAlign: "center"
                }}>
                  No deals
                </div>
              )}
              
              {dealsByStage[stage.key].map(s => (
                <div key={s.id}
                  style={{
                    marginBottom: 12,
                    background: "#fff",
                    borderRadius: 6,
                    padding: "14px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    border: "1px solid #e5e7eb",
                    borderLeft: `4px solid ${stage.color}`,
                    position: "relative",
                    cursor: "pointer"
                  }}
                  onMouseEnter={() => setMoveMenu(s.id)}
                  onMouseLeave={() => setMoveMenu(null)}
                >
                  {/* Company Name */}
                  <div style={{ 
                    fontWeight: 600, 
                    fontSize: 15, 
                    color: "#111827", 
                    marginBottom: 6,
                    paddingRight: 24
                  }}>
                    {safeDisplay(s.analysis?.["Company Name"])}
                  </div>
                  
                  {/* Founders */}
                  <div style={{ 
                    color: "#6b7280", 
                    fontSize: 13, 
                    marginBottom: 8
                  }}>
                    {safeDisplay(s.analysis?.["Founder(s)"])}
                  </div>
                  
                  {/* Score */}
                  <div style={{
                    color: scoreColor(s.analysis?.["Overall Score"]),
                    fontSize: 13,
                    fontWeight: 600
                  }}>
                    Score: {safeDisplay(s.analysis?.["Overall Score"])}
                  </div>

                  {/* Bookmark */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(s.id);
                    }}
                    style={{
                      position: "absolute",
                      right: 8,
                      top: 8,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 16,
                      color: bookmarks.includes(s.id) ? "#fbbf24" : "#d1d5db",
                      padding: 4
                    }}
                  >
                    ★
                  </button>

                  {/* Move Menu */}
                  {moveMenu === s.id && (
                    <div style={{
                      position: "absolute",
                      right: 8,
                      bottom: 8,
                      background: "#fff",
                      borderRadius: 6,
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      border: "1px solid #e5e7eb",
                      padding: "8px",
                      zIndex: 100,
                      minWidth: 120
                    }}>
                      <div style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#6b7280",
                        marginBottom: 6,
                        textAlign: "center"
                      }}>
                        Move to:
                      </div>
                      {PIPELINE_STAGES.filter(st => st.key !== stage.key).map(st => (
                        <button
                          key={st.key}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveDeal(s.id, st.key);
                          }}
                          style={{
                            border: 'none',
                            borderRadius: 4,
                            background: "#f9fafb",
                            color: "#374151",
                            fontWeight: 500,
                            fontSize: 12,
                            padding: "6px 10px",
                            marginBottom: 4,
                            cursor: "pointer",
                            width: "100%",
                            textAlign: "left"
                          }}
                          onMouseEnter={(e) => e.target.style.background = "#f3f4f6"}
                          onMouseLeave={(e) => e.target.style.background = "#f9fafb"}
                        >
                          {st.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function scoreColor(score) {
  score = Number(score);
  if (score >= 7) return "#059669";
  if (score >= 4) return "#d97706";
  return "#dc2626";
}
