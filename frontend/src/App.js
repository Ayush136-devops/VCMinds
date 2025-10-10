import React, { useState, useEffect } from 'react';
import UploadDeck from './components/UploadDeck';
import AnalysisView from './components/AnalysisView';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';

const professionalFont = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export default function App() {
  const [tab, setTab] = useState('analyze');
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [startups, setStartups] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/docs/')
      .then(r => r.json())
      .then(data => {
        setStartups((data.startups || []).map(doc => ({
          ...doc,
          analysis: typeof doc.analysis_result === "string"
            ? JSON.parse(doc.analysis_result)
            : doc.analysis_result,
          id: doc.id,
        })));
      });
  }, []);

  const handleUploadSuccess = (docData) => setUploadedDoc(docData);

  return (
    <div style={{ 
      background: "#f8fafc", 
      minHeight: "100vh", 
      fontFamily: professionalFont 
    }}>
      {/* Header */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "24px 0",
        marginBottom: "32px"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          textAlign: "center"
        }}>
          <img 
            src="/vcminds.png" 
            alt="VCMinds" 
            style={{ 
              width: 64, 
              height: 64,
              marginBottom: 16 
            }} 
          />
          <h1 style={{
            fontFamily: professionalFont,
            fontWeight: 700,
            fontSize: 28,
            margin: 0,
            color: "#111827",
            letterSpacing: "-0.025em"
          }}>
            VCMinds
          </h1>
          <p style={{
            color: "#6b7280",
            margin: "8px 0 0 0",
            fontSize: 16,
            fontWeight: 500
          }}>
            AI-Powered Startup Due Diligence & Portfolio Analytics
          </p>
        </div>
      </div>

      {/* Navigation Steps */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto 40px auto",
        padding: "0 24px"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 32
        }}>
          <NavigationStep 
            number="1" 
            label="Upload" 
            active={tab === 'analyze'} 
          />
          <StepConnector />
          <NavigationStep 
            number="2" 
            label="Analysis" 
            active={tab === 'analyze'} 
          />
          <StepConnector />
          <NavigationStep 
            number="3" 
            label="Dashboard" 
            active={tab === 'dashboard'} 
          />
          <StepConnector />
          <NavigationStep 
            number="4" 
            label="Pipeline" 
            active={tab === 'kanban'} 
          />
        </div>
      </div>

      {/* Feature Overview */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto 40px auto",
        padding: "0 24px"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24
        }}>
          {[
            {
              title: "Instant Analysis",
              desc: "AI-powered pitch deck analysis extracting key investment metrics and insights."
            },
            {
              title: "Portfolio Dashboard",
              desc: "Comprehensive view with scoring, risk assessment, and comparison tools."
            },
            {
              title: "Deal Pipeline",
              desc: "Kanban-style workflow management from initial review to funding decision."
            },
            {
              title: "Export & Reporting",
              desc: "Professional reports and data export for stakeholders and LPs."
            }
          ].map((feature, i) => (
            <div key={feature.title} style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
              <h3 style={{
                fontWeight: 600,
                fontSize: 16,
                color: "#111827",
                margin: "0 0 8px 0"
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: "#6b7280",
                fontSize: 14,
                margin: 0,
                lineHeight: 1.5
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto 32px auto",
        padding: "0 24px"
      }}>
        <div style={{
          display: 'flex',
          gap: 4,
          background: "#f3f4f6",
          padding: 4,
          borderRadius: 8,
          width: "fit-content",
          margin: "0 auto"
        }}>
          <TabButton 
            active={tab === 'analyze'}
            onClick={() => setTab('analyze')}
          >
            Analyze Deck
          </TabButton>
          <TabButton 
            active={tab === 'dashboard'}
            onClick={() => setTab('dashboard')}
          >
            Dashboard
          </TabButton>
          <TabButton 
            active={tab === 'kanban'}
            onClick={() => setTab('kanban')}
          >
            Pipeline
          </TabButton>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        maxWidth: "1400px",
        margin: '0 auto 60px auto',
        padding: "0 24px"
      }}>
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          minHeight: 600,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          {tab === 'analyze' && (
            <div style={{ padding: "32px" }}>
              <UploadDeck onUploadSuccess={handleUploadSuccess} />
              {uploadedDoc && <AnalysisView docId={uploadedDoc.doc_id} />}
            </div>
          )}
          {tab === 'dashboard' && <Dashboard startups={startups} />}
          {tab === 'kanban' && <KanbanBoard startups={startups} />}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: "1px solid #e5e7eb",
        background: "#fff",
        padding: "24px 0",
        textAlign: 'center'
      }}>
        <p style={{
          color: '#9ca3af',
          fontSize: 14,
          margin: 0,
          fontWeight: 500
        }}>
          © {new Date().getFullYear()} VCMinds. Professional Investment Analytics Platform.
        </p>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.5)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 8,
            maxWidth: 480,
            width: "90%",
            padding: 32,
            position: "relative",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
          }}>
            <button
              onClick={() => setShowHelp(false)}
              style={{
                position: "absolute",
                right: 16,
                top: 16,
                background: "none",
                border: "none",
                fontSize: 24,
                color: "#9ca3af",
                cursor: "pointer",
                padding: 4
              }}
            >×</button>
            
            <h2 style={{
              fontWeight: 600,
              fontSize: 20,
              color: "#111827",
              margin: "0 0 16px 0"
            }}>Platform Overview</h2>
            
            <div style={{ color: "#374151", fontSize: 15, lineHeight: 1.6 }}>
              <div style={{ marginBottom: 16 }}>
                <strong>1. Upload & Analysis:</strong> Upload pitch decks for instant AI-powered analysis of key investment metrics.
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>2. Dashboard:</strong> Review comprehensive scoring, risk assessment, and comparative analytics.
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>3. Pipeline Management:</strong> Track deals through your investment workflow from review to funding.
              </div>
              <div>
                <strong>4. Export & Share:</strong> Generate professional reports for stakeholders and investment committees.
              </div>
            </div>
            
            <div style={{
              marginTop: 24,
              padding: 16,
              background: "#f9fafb",
              borderRadius: 6,
              border: "1px solid #e5e7eb"
            }}>
              <p style={{
                color: "#374151",
                fontSize: 14,
                margin: 0,
                textAlign: "center",
                fontWeight: 500
              }}>
                Ready to begin? Upload your first pitch deck to get started.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavigationStep({ number, label, active }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: "column",
      alignItems: 'center',
      opacity: active ? 1 : 0.6
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: active ? "#3b82f6" : "#e5e7eb",
        color: active ? "#fff" : "#6b7280",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 600,
        marginBottom: 8
      }}>
        {number}
      </div>
      <span style={{
        fontSize: 13,
        fontWeight: 500,
        color: active ? "#111827" : "#6b7280"
      }}>
        {label}
      </span>
    </div>
  );
}

function StepConnector() {
  return (
    <div style={{
      width: 24,
      height: 1,
      background: "#d1d5db",
      marginBottom: 32
    }} />
  );
}

function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "#fff" : "transparent",
        color: active ? "#111827" : "#6b7280",
        border: "none",
        padding: "8px 16px",
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: professionalFont,
        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
        transition: "all 0.2s ease"
      }}
    >
      {children}
    </button>
  );
}
