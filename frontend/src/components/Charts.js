import React from 'react';
import { BarChart, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

function safeDisplay(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null) {
    if ("msg" in value) return value.msg;
    return JSON.stringify(value);
  }
  return "Not provided";
}

export function ScoreChart({ startups }) {
  const scoreCounts = Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: startups.filter(s => Number(safeDisplay(s.analysis?.["Overall Score"])) === (i + 1)).length
  }));

  return (
    <BarChart width={600} height={250} data={scoreCounts}>
      <XAxis dataKey="score" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" fill="#8884d8" />
    </BarChart>
  );
}

export function RiskPieChart({ startups }) {
  const risks = startups.flatMap(s =>
    (safeDisplay(s.analysis?.["Key Risks/Red Flags"]) || "").split(/[.,;]/)
      .map(r => r.trim())
      .filter(r => r && r.length > 3)
  );
  
  const riskStats = {};
  risks.forEach(risk => {
    riskStats[risk] = (riskStats[risk] || 0) + 1;
  });
  
  const pieData = Object.entries(riskStats)
    .slice(0, 6) // Top 6 risks only
    .map(([name, value]) => ({ name: name.substring(0, 30), value }));
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#da3b3b', '#b041d7'];

  return (
    <PieChart width={400} height={250}>
      <Pie 
        data={pieData} 
        dataKey="value" 
        nameKey="name" 
        cx="50%" 
        cy="50%" 
        outerRadius={70}
        fill="#8884d8"
      >
        {pieData.map((entry, idx) => (
          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}
