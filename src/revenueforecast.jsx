import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

const DEFAULT_STREAMS = [
  {
    id: 1,
    name: "Product Sales",
    color: "#00C9A7",
    values: [42000,45000,47000,50000,53000,58000,61000,65000,68000,72000,76000,80000]
  },
  {
    id: 2,
    name: "Subscriptions",
    color: "#4B9FFF",
    values: [12000,12500,13000,13500,14000,14500,15000,15500,16000,16500,17000,17500]
  },
  {
    id: 3,
    name: "Services",
    color: "#F7B731",
    values: [8000,8000,9000,9000,10000,10000,11000,11000,12000,12000,13000,13000]
  }
];

const fmt = (n) =>
  n >= 1000000
    ? `$${(n / 1000000).toFixed(2)}M`
    : n >= 1000
    ? `$${(n / 1000).toFixed(1)}k`
    : `$${n}`;

const fmtFull = (n) => `$${Number(n).toLocaleString()}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((s, p) => s + (p.value || 0), 0);

  return (
    <div style={{
      background: "#0f1923",
      border: "1px solid #1e3048",
      borderRadius: 10,
      padding: "12px 16px",
      minWidth: 180
    }}>
      <div style={{
        color: "#7a9bbf",
        fontSize: 12,
        marginBottom: 8,
        fontFamily: "'DM Mono', monospace"
      }}>
        {label}
      </div>

      {payload.map((p) => (
        <div key={p.name} style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 4,
          fontSize: 13
        }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ color: "#e8f0fa", fontFamily: "'DM Mono', monospace" }}>
            {fmtFull(p.value)}
          </span>
        </div>
      ))}

      <div style={{
        borderTop: "1px solid #1e3048",
        marginTop: 8,
        paddingTop: 8,
        display: "flex",
        justifyContent: "space-between"
      }}>
        <span style={{ color: "#7a9bbf", fontSize: 12 }}>Total</span>
        <span style={{
          color: "#00C9A7",
          fontFamily: "'DM Mono', monospace",
          fontWeight: 700
        }}>
          {fmtFull(total)}
        </span>
      </div>
    </div>
  );
};

export default function RevenueForecast() {
  const [streams, setStreams] = useState(DEFAULT_STREAMS);
  const [selectedStream, setSelectedStream] = useState(1);
  const [editingName, setEditingName] = useState(null);
  const [growthRate, setGrowthRate] = useState("");
  const [newStreamName, setNewStreamName] = useState("");
  const [showAddStream, setShowAddStream] = useState(false);

  // =========================
  // SAFE chart data
  // =========================
  const chartData = useMemo(() => {
    return MONTHS.map((month, i) => {
      const row = { month };
      streams.forEach((s) => {
        row[s.name] = s.values[i];
      });
      return row;
    });
  }, [streams]);

  // =========================
  // SAFE totals (FIXED)
  // =========================
  const totals = useMemo(() => {
    const result = Array(12).fill(0);

    streams.forEach((s) => {
      s.values.forEach((v, i) => {
        result[i] += v;
      });
    });

    return result;
  }, [streams]);

  const annualTotal = totals.reduce((a, b) => a + b, 0);

  const currentStream = useMemo(() => {
    return streams.find((s) => s.id === selectedStream) || streams[0];
  }, [streams, selectedStream]);

  // =========================
  // UPDATE VALUE (SAFE IMMUTABLE)
  // =========================
  const updateValue = (monthIdx, raw) => {
    const val = parseFloat(raw.replace(/[^0-9.]/g, "")) || 0;

    setStreams((prev) =>
      prev.map((s) =>
        s.id === selectedStream
          ? {
              ...s,
              values: s.values.map((v, i) =>
                i === monthIdx ? val : v
              )
            }
          : s
      )
    );
  };

  // =========================
  // APPLY GROWTH RATE
  // =========================
  const applyGrowthRate = () => {
    if (!growthRate || !currentStream) return;

    const rate = parseFloat(growthRate) / 100;

    setStreams((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStream) return s;

        const newVals = [s.values[0]];

        for (let i = 1; i < 12; i++) {
          newVals.push(
            Math.round(newVals[i - 1] * (1 + rate))
          );
        }

        return { ...s, values: newVals };
      })
    );
  };

  // =========================
  // ADD STREAM (FIXED ID BUG)
  // =========================
  const addStream = () => {
    if (!newStreamName.trim()) return;

    const newId = Date.now();

    const colors = ["#FF6B6B","#A29BFE","#FD79A8","#55EFC4","#FDCB6E"];

    const newStream = {
      id: newId,
      name: newStreamName.trim(),
      color: colors[streams.length % colors.length],
      values: Array(12).fill(5000)
    };

    setStreams((prev) => [...prev, newStream]);
    setSelectedStream(newId); // ✅ FIXED

    setNewStreamName("");
    setShowAddStream(false);
  };

  // =========================
  // REMOVE STREAM (SAFE)
  // =========================
  const removeStream = (id) => {
    setStreams((prev) => {
      const updated = prev.filter((s) => s.id !== id);

      setSelectedStream((curr) => {
        if (curr !== id) return curr;
        return updated[0]?.id ?? null;
      });

      return updated;
    });
  };

  // =========================
  // GROWTH SAFE
  // =========================
  const prevTotal = totals.slice(0, 6).reduce((a, b) => a + b, 0);
  const nextTotal = totals.slice(6).reduce((a, b) => a + b, 0);

  const growth = useMemo(() => {
    if (!prevTotal) return 0;
    return ((nextTotal - prevTotal) / prevTotal) * 100;
  }, [prevTotal, nextTotal]);

  // =========================
  // UI
  // =========================
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #070d14 0%, #0b1622 50%, #070d14 100%)",
      color: "#e8f0fa",
      fontFamily: "'DM Sans', sans-serif",
      padding: "32px 24px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 4, color: "#00C9A7" }}>
              Revenue Forecast
            </div>
            <h1 style={{ margin: 0, fontSize: 32 }}>
              12-Month Outlook
            </h1>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#7a9bbf" }}>
              ANNUAL PROJECTION
            </div>
            <div style={{ fontSize: 28, color: "#00C9A7" }}>
              {fmt(annualTotal)}
            </div>
            <div style={{ fontSize: 12, color: growth >= 0 ? "#00C9A7" : "#FF6B6B" }}>
              {growth >= 0 ? "▲" : "▼"} {Math.abs(growth).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* CHART */}
        <div style={{ height: 260, marginBottom: 32 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x="Jun" stroke="#333" />

              {streams.map((s) => (
                <Area
                  key={s.id}
                  type="monotone"
                  dataKey={s.name}
                  stroke={s.color}
                  fill={s.color}
                  fillOpacity={0.2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* STREAM SELECT */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {streams.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStream(s.id)}
              style={{
                padding: "6px 12px",
                background: selectedStream === s.id ? "#1e2a3a" : "transparent",
                color: s.color,
                border: "1px solid #2a3a4a",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* EDITOR */}
        {currentStream && (
          <div>
            <h3>Editing: {currentStream.name}</h3>

            <input
              value={growthRate}
              onChange={(e) => setGrowthRate(e.target.value)}
              placeholder="% growth"
            />
            <button onClick={applyGrowthRate}>
              Apply
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)" }}>
              {MONTHS.map((m, i) => (
                <div key={m}>
                  <div>{m}</div>
                  <input
                    value={currentStream.values[i]}
                    onChange={(e) => updateValue(i, e.target.value)}
                  />
                  <small>{fmt(totals[i])}</small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}