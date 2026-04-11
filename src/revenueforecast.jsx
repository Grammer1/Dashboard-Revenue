import { useState, useMemo, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const DEFAULT_STREAMS = [
  { id: 1, name: "Product Sales", color: "#00C9A7", values: [42000,45000,47000,50000,53000,58000,61000,65000,68000,72000,76000,80000] },
  { id: 2, name: "Subscriptions", color: "#4B9FFF", values: [12000,12500,13000,13500,14000,14500,15000,15500,16000,16500,17000,17500] },
  { id: 3, name: "Services", color: "#F7B731", values: [8000,8000,9000,9000,10000,10000,11000,11000,12000,12000,13000,13000] },
];

const fmt = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(2)}M` : n >= 1000 ? `$${(n/1000).toFixed(1)}k` : `$${n}`;
const fmtFull = (n) => `$${Number(n).toLocaleString()}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
  return (
    <div style={{ background: "#0f1923", border: "1px solid #1e3048", borderRadius: 10, padding: "12px 16px", minWidth: 180 }}>
      <div style={{ color: "#7a9bbf", fontSize: 12, marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4, fontSize: 13 }}>
          <span style={{ color: p.color, fontFamily: "'DM Sans', sans-serif" }}>{p.name}</span>
          <span style={{ color: "#e8f0fa", fontFamily: "'DM Mono', monospace" }}>{fmtFull(p.value)}</span>
        </div>
      ))}
      <div style={{ borderTop: "1px solid #1e3048", marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#7a9bbf", fontSize: 12 }}>Total</span>
        <span style={{ color: "#00C9A7", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{fmtFull(total)}</span>
      </div>
    </div>
  );
};

export default function RevenueForecast({ onLogout }) {
  const [streams, setStreams] = useState(() => {
  try {
    const saved = localStorage.getItem("streams");
    return saved ? JSON.parse(saved) : DEFAULT_STREAMS;
  } catch (err) {
    console.error("Failed to load streams:", err);
    return DEFAULT_STREAMS;
  }
});
  const [selectedStream, setSelectedStream] = useState(1);
  const [editingName, setEditingName] = useState(null);
  const [growthRate, setGrowthRate] = useState(null);
  const [newStreamName, setNewStreamName] = useState("");
  const [showAddStream, setShowAddStream] = useState(false);

useEffect(() => {
    try {
      localStorage.setItem("streams", JSON.stringify(streams));
    } catch (err) {
      console.error("Failed to save streams:", err);
    }
  }, [streams]);

  const chartData = useMemo(() =>
    MONTHS.map((month, i) => {
      const row = { month };
      streams.forEach(s => { row[s.name] = s.values[i]; });
      return row;
    }), [streams]);

  const totals = useMemo(() =>
    streams.reduce((acc, s) => s.values.map((v, i) => (acc[i] || 0) + v), []), [streams]);

  const annualTotal = totals.reduce((a, b) => a + b, 0);
  const currentStream = streams.find(s => s.id === selectedStream);

  const updateValue = (monthIdx, raw) => {
    const val = parseFloat(raw.replace(/[^0-9.]/g, "")) || 0;
    setStreams(prev => prev.map(s =>
      s.id === selectedStream
        ? { ...s, values: s.values.map((v, i) => i === monthIdx ? val : v) }
        : s
    ));
  };

  const applyGrowthRate = () => {
    if (!growthRate || !currentStream) return;
    const rate = parseFloat(growthRate) / 100;
    setStreams(prev => prev.map(s => {
      if (s.id !== selectedStream) return s;
      const newVals = [s.values[0]];
      for (let i = 1; i < 12; i++) newVals.push(Math.round(newVals[i - 1] * (1 + rate)));
      return { ...s, values: newVals };
    }));
  };

  const addStream = () => {
    if (!newStreamName.trim()) return;
    const colors = ["#FF6B6B","#A29BFE","#FD79A8","#55EFC4","#FDCB6E"];
    setStreams(prev => [...prev, {
      id: Date.now(),
      name: newStreamName.trim(),
      color: colors[prev.length % colors.length],
      values: Array(12).fill(5000)
    }]);
    setSelectedStream(streams.length > 0 ? Date.now() : selectedStream);
    setNewStreamName("");
    setShowAddStream(false);
  };

  const removeStream = (id) => {
    setStreams(prev => prev.filter(s => s.id !== id));
    if (selectedStream === id && streams.length > 1) setSelectedStream(streams.find(s => s.id !== id)?.id);
  };

  const prevTotal = totals.slice(0,6).reduce((a,b)=>a+b,0);
  const nextTotal = totals.slice(6).reduce((a,b)=>a+b,0);
  const growth = prevTotal ? ((nextTotal - prevTotal) / prevTotal * 100).toFixed(1) : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #070d14 0%, #0b1622 50%, #070d14 100%)",
      color: "#e8f0fa",
      fontFamily: "'DM Sans', sans-serif",
      padding: "32px 24px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      {/* Header */}

      <button
  onClick={() => {
    localStorage.removeItem("auth");
    onLogout();
  }}
  style={{
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "#00C9A7",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 1,
    textTransform: "uppercase",
    transition: "all 0.15s ease"
  }}
  onMouseEnter={e => {
    e.target.style.background = "rgba(0,201,167,0.08)";
    e.target.style.borderColor = "#00C9A7";
  }}
  onMouseLeave={e => {
    e.target.style.background = "rgba(255,255,255,0.03)";
    e.target.style.borderColor = "rgba(255,255,255,0.08)";
  }}
>
  Logout
</button>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 4, color: "#00C9A7", fontFamily: "'DM Mono', monospace", marginBottom: 6, textTransform: "uppercase" }}>
              Revenue Forecast
            </div>
            <h1 style={{ margin: 0, fontSize: 32, fontFamily: "'Playfair Display', serif", fontWeight: 700, letterSpacing: -0.5 }}>
              12-Month Outlook
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#7a9bbf", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>ANNUAL PROJECTION</div>
            <div style={{ fontSize: 28, fontFamily: "'DM Mono', monospace", color: "#00C9A7", fontWeight: 500 }}>{fmt(annualTotal)}</div>
            <div style={{ fontSize: 12, color: growth >= 0 ? "#00C9A7" : "#FF6B6B" }}>
              {growth >= 0 ? "▲" : "▼"} {Math.abs(growth)}% H2 vs H1
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Best Month", value: fmt(Math.max(...totals)), sub: MONTHS[totals.indexOf(Math.max(...totals))] },
            { label: "Avg / Month", value: fmt(Math.round(annualTotal / 12)), sub: "across all streams" },
            { label: "H2 Growth", value: `${growth}%`, sub: "vs first half" },
          ].map(kpi => (
            <div key={kpi.label} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: "16px 20px",
            }}>
              <div style={{ fontSize: 11, color: "#7a9bbf", fontFamily: "'DM Mono', monospace", letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>{kpi.label}</div>
              <div style={{ fontSize: 22, fontFamily: "'DM Mono', monospace", color: "#e8f0fa" }}>{kpi.value}</div>
              <div style={{ fontSize: 12, color: "#4a6b8a", marginTop: 2 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "24px 16px 16px", marginBottom: 32 }}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                {streams.map(s => (
                  <linearGradient key={s.id} id={`grad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={s.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#4a6b8a", fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmt(v)} tick={{ fill: "#4a6b8a", fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} width={56} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x="Jun" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" label={{ value: "H1 | H2", fill: "#4a6b8a", fontSize: 10, fontFamily: "'DM Mono', monospace" }} />
              {streams.map(s => (
                <Area key={s.id} type="monotone" dataKey={s.name} stackId="1"
                  stroke={s.color} strokeWidth={2}
                  fill={`url(#grad-${s.id})`} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stream tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          {streams.map(s => (
            <button key={s.id}
              onClick={() => setSelectedStream(s.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                background: selectedStream === s.id ? "rgba(255,255,255,0.08)" : "transparent",
                color: selectedStream === s.id ? s.color : "#4a6b8a",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                transition: "all 0.15s",
              }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              {editingName === s.id
                ? <input autoFocus defaultValue={s.name}
                    onBlur={e => { setStreams(p => p.map(x => x.id === s.id ? {...x, name: e.target.value || x.name} : x)); setEditingName(null); }}
                    onKeyDown={e => e.key === "Enter" && e.target.blur()}
                    style={{ background: "transparent", border: "none", borderBottom: `1px solid ${s.color}`, color: s.color, width: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none" }} />
                : <span onDoubleClick={() => setEditingName(s.id)}>{s.name}</span>
              }
              {streams.length > 1 &&
                <span onClick={(e) => { e.stopPropagation(); removeStream(s.id); }}
                  style={{ marginLeft: 2, opacity: 0.4, fontSize: 14, lineHeight: 1 }}>×</span>
              }
            </button>
          ))}
          {showAddStream
            ? <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input value={newStreamName} onChange={e => setNewStreamName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addStream()}
                  placeholder="Stream name…"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "6px 12px", color: "#e8f0fa", fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", width: 130 }} />
                <button onClick={addStream} style={{ background: "#00C9A7", color: "#070d14", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Add</button>
                <button onClick={() => setShowAddStream(false)} style={{ background: "transparent", color: "#4a6b8a", border: "none", cursor: "pointer", fontSize: 18 }}>×</button>
              </div>
            : <button onClick={() => setShowAddStream(true)}
                style={{ padding: "8px 14px", borderRadius: 8, border: "1px dashed rgba(255,255,255,0.15)", background: "transparent", color: "#4a6b8a", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                + Add stream
              </button>
          }
        </div>

        {/* Monthly editor */}
        {currentStream && (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: currentStream.color, fontWeight: 500 }}>
                Editing: {currentStream.name}
                <span style={{ color: "#4a6b8a", marginLeft: 8, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>· double-click tab to rename</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#4a6b8a" }}>Apply monthly growth:</span>
                <input value={growthRate || ""} onChange={e => setGrowthRate(e.target.value)}
                  placeholder="%"
                  style={{ width: 56, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "5px 8px", color: "#e8f0fa", fontFamily: "'DM Mono', monospace", fontSize: 12, outline: "none", textAlign: "center" }} />
                <button onClick={applyGrowthRate}
                  style={{ background: currentStream.color, color: "#070d14", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                  Apply
                </button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
              {MONTHS.map((month, i) => (
                <div key={month}>
                  <div style={{ fontSize: 10, color: "#4a6b8a", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" }}>{month}</div>
                  <input
                    value={currentStream.values[i]}
                    onChange={e => updateValue(i, e.target.value)}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      background: "rgba(255,255,255,0.04)", border: `1px solid rgba(${hexToRgb(currentStream.color)},0.25)`,
                      borderRadius: 8, padding: "8px 10px", color: "#e8f0fa",
                      fontFamily: "'DM Mono', monospace", fontSize: 13, outline: "none",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={e => e.target.style.borderColor = currentStream.color}
                    onBlur={e => e.target.style.borderColor = `rgba(${hexToRgb(currentStream.color)},0.25)`}
                  />
                  <div style={{ fontSize: 10, color: "#4a6b8a", marginTop: 3, fontFamily: "'DM Mono', monospace" }}>
                    {fmt(totals[i])} total
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 20, fontSize: 11, color: "#2a4060", textAlign: "center", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
          EDIT ANY VALUE · DOUBLE-CLICK STREAM NAME TO RENAME · ADD OR REMOVE STREAMS
        </div>
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}