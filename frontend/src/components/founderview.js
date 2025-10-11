import React from "react";

function FoundersView({ startups }) {
  const founders = [];
  
  startups.forEach(s => {
    let founderArray = [];
    try {
      let analysis = typeof s.analysis === "string" ? JSON.parse(s.analysis) : s.analysis;
      
      // Get founder details array
      founderArray = Array.isArray(analysis?.["Founder Details"])
        ? analysis["Founder Details"]
        : [];
      
      // If no Founder Details array, try to parse from "Founder(s)" string
      if (founderArray.length === 0 && analysis["Founder(s)"]) {
        const founderNames = analysis["Founder(s)"].split(',').map(n => n.trim());
        founderArray = founderNames.map(name => ({
          "Founder Name": name,
          "Title": "",
          "Educational Background": "Not mentioned in pitch deck",
          "Previous Experience": "Not mentioned in pitch deck",
          "Previous Startups": "Not mentioned in pitch deck",
          "Key Achievements": "Not mentioned in pitch deck",
          "LinkedIn Mentioned": "",
          "Years of Experience": "Not mentioned in pitch deck"
        }));
      }
      
      founderArray.forEach(f =>
        founders.push({
          ...f,
          company: analysis["Company Name"],
          companyScore: analysis["Overall Score"],
        })
      );
    } catch (e) {
      console.error("Error parsing founder data:", e);
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
          key={f.company + (f["Founder Name"] || f.name) + idx}
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
            {f["Founder Name"] || f.name || "Unnamed founder"}
            <span style={{ color: "#aaa", fontWeight: 400, fontSize: 13, marginLeft: 10 }}>
              {f["Title"] || f.title || ""}
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
          
          {/* Only show fields with actual data */}
          {f["Educational Background"] && !f["Educational Background"].includes("Not mentioned") && (
            <div>
              <span style={{ color: "#64748b", fontWeight: 600 }}>Education:</span>
              <div style={{ fontSize: 14, margin: '2px 0 7px 0' }}>
                {f["Educational Background"]}
              </div>
            </div>
          )}
          
          {f["Previous Experience"] && !f["Previous Experience"].includes("Not mentioned") && (
            <div>
              <span style={{ color: "#64748b", fontWeight: 600 }}>Previous Experience:</span>
              <div style={{ fontSize: 14, margin: '2px 0 7px 0' }}>
                {f["Previous Experience"]}
              </div>
            </div>
          )}
          
          {f["Previous Startups"] && !f["Previous Startups"].includes("Not mentioned") && (
            <div>
              <span style={{ color: "#64748b", fontWeight: 600 }}>Previous Startups:</span>
              <div style={{ fontSize: 14, margin: '2px 0 7px 0' }}>
                {f["Previous Startups"]}
              </div>
            </div>
          )}
          
          {f["Key Achievements"] && !f["Key Achievements"].includes("Not mentioned") && (
            <div>
              <span style={{ color: "#64748b", fontWeight: 600 }}>Key Achievements:</span>
              <div style={{ fontSize: 14, margin: '2px 0 7px 0' }}>
                {f["Key Achievements"]}
              </div>
            </div>
          )}
          
          {f["LinkedIn Mentioned"] && !f["LinkedIn Mentioned"].includes("Not mentioned") && (
            <div>
              <span style={{ color: "#64748b", fontWeight: 600 }}>LinkedIn:</span>
              <div style={{ fontSize: 14, margin: '2px 0 7px 0' }}>
                {f["LinkedIn Mentioned"]}
              </div>
            </div>
          )}
          
          {f["Years of Experience"] && !f["Years of Experience"].includes("Not mentioned") && (
            <div>
              <span style={{ color: "#64748b", fontWeight: 600 }}>Years of Experience:</span>
              <div style={{ fontSize: 14, margin: '2px 0 7px 0' }}>
                {f["Years of Experience"]}
              </div>
            </div>
          )}
          
          {/* Show message if no detailed data available */}
          {!f["Educational Background"]?.length && 
           !f["Previous Experience"]?.length &&
           !f["LinkedIn Mentioned"]?.length && (
            <div style={{
              marginTop: 12,
              padding: 12,
              background: "#fef3c7",
              borderRadius: 6,
              fontSize: 13,
              color: "#92400e"
            }}>
              Limited information available in pitch deck. Name extracted from founder list.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default FoundersView;
