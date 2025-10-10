import React from 'react';
import { BarChart, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const professionalFont = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 6,
          padding: '8px 12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          fontSize: 13,
          fontFamily: professionalFont
        }}>
          <p style={{ margin: 0, color: '#374151' }}>
            Score {label}: <span style={{ fontWeight: 600, color: '#111827' }}>{payload[0].value} companies</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={scoreCounts} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <XAxis 
          dataKey="score" 
          axisLine={false}
          tickLine={false}
          tick={{ 
            fontSize: 12, 
            fill: '#6b7280',
            fontFamily: professionalFont
          }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ 
            fontSize: 12, 
            fill: '#6b7280',
            fontFamily: professionalFont
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="count" 
          fill="#3b82f6" 
          radius={[2, 2, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
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
    .sort(([,a], [,b]) => b - a) // Sort by frequency
    .slice(0, 5) // Top 5 risks only
    .map(([name, value]) => ({ 
      name: name.length > 25 ? name.substring(0, 25) + '...' : name, 
      value,
      fullName: name
    }));

  // Professional color palette
  const PROFESSIONAL_COLORS = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6'  // Purple
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 6,
          padding: '8px 12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          fontSize: 13,
          fontFamily: professionalFont,
          maxWidth: 200
        }}>
          <p style={{ margin: 0, color: '#111827', fontWeight: 600 }}>
            {payload[0].payload.fullName}
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
            {payload[0].value} occurrences
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props) => {
    const { payload } = props;
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        fontSize: 12,
        fontFamily: professionalFont
      }}>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 12,
              height: 12,
              backgroundColor: entry.color,
              borderRadius: 2
            }} />
            <span style={{ color: '#374151' }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (pieData.length === 0) {
    return (
      <div style={{
        height: 220,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af',
        fontSize: 14,
        fontFamily: professionalFont
      }}>
        No risk data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <Pie 
          data={pieData} 
          dataKey="value" 
          nameKey="name" 
          cx="50%" 
          cy="50%" 
          innerRadius={30}
          outerRadius={80}
          paddingAngle={2}
        >
          {pieData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={PROFESSIONAL_COLORS[index % PROFESSIONAL_COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          content={<CustomLegend />}
          wrapperStyle={{
            paddingLeft: '20px',
            fontSize: '12px'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
