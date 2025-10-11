import React from "react";

function FoundersView({ startups }) {
  // Flatten founders from each startup, tagging with company & score
  const founders = [];
  startups.forEach(s => {
    let founderArray = [];
    try {
      // Try parse JSON if it's a string
      let analysis = typeof s.analysis === "string" ? JSON.parse(s.analysis) : s.analysis;
      founderArray = Array.isArray(analysis?.["Founder Details"])
        ? analysis["Founder Details"]
        : [];
      founderArray.forEach(f =>
        founders.push({
          ...f,
          company: analysis["Company Name"],
          companyScore: analysis["Overall Score"],
        })
      );
    } catch {
      // fallback: skip badly formatted results
    }
  });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 28 }}>
      <h2 style={{ textAlign: "center", marginBottom: 32 }}>
        Founders Backgrounds
      </h2>
      {founders.length === 0 && (
        <div style={{ color: "#888", textAlign: "center", marginTop: 40 }}>
          No founder information available. Please analyze decks first.
        </div>
      )}
      {founders.map((f, idx) => (
        <div
          key={f.company + f.name + idx}
          style={{
            background: "#fff",
            borderRadius: 8,
            padding: 20,
            marginBottom: 20,
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 6px #eff1f6",
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            {f.name || "Unnamed founder"}
            <span style={{ color: "#aaa", fontWeight: 400, fontSize: 13, marginLeft: 10 }}>
              {f.title || ""}
            </span>
          </div>
          <div style={{ color: "#374151", fontSize: 15, marginBottom: 7 }}>
            Company: <b>{f.company || "Unknown"}</b>
            {typeof f.companyScore !== "undefined" &&
              <span style={{ color: "#059669", fontWeight: 500, fontSize: 14, marginLeft: 12 }}>
                Score: {f.companyScore}
              </span>
            }
          </div>
          <div>
            <span style={{ color: "#64748b", fontWeight: 600 }}>Education:</span>
            <ul style={{ margin: '3px 0 10px 22px', padding: 0 }}>
              {(f.educational_background?.split("\n") || [f.educational_background])
                .filter(v => v && v !== "Not provided")
                .map((ed, i) => <li key={i} style={{ fontSize: 14 }}>{ed}</li>)}
            </ul>
          </div>
          <div>
            <span style={{ color: "#64748b", fontWeight: 600 }}>Previous Experience:</span>
            <div style={{ fontSize: 14, margin: '2px 0 7px 0' }}>{f.previous_experience || "Not provided"}</div>
          </div>
          <div>
            <span style={{ color: "#64748b", fontWeight: 600 }}>Previous Startups:</span>
            <div style={{ fontSize: 14, margin: '2px 0 7px 0' }}>{f.previous_startups || "Not provided"}</div>
          </div>
          <div>
            <span style={{ color: "#64748b", fontWeight: 600 }}>Key Achievements:</span>
            <div style={{ fontSize: 14, margin: '2px 0 7px 0' }}>{f.key_achievements || "Not provided"}</div>
          </div>
          <div>
            <span style={{ color: "#64748b", fontWeight: 600 }}>LinkedIn:</span>
            <div style={{ fontSize: 14, margin: '2px 0 7px 0' }}>{f.linkedin_mentioned || "Not provided"}</div>
          </div>
          <div>
            <span style={{ color: "#64748b", fontWeight: 600 }}>Years of Experience:</span>
            <div style={{ fontSize: 14, margin: '2px 0 7px 0' }}>{f.years_of_experience || "Not provided"}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FoundersView;
