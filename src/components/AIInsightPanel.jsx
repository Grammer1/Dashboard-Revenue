export default function AIInsightPanel({ insights = [] }) {
  const theme = {
    bg: "rgba(255,255,255,0.02)",
    border: "rgba(255,255,255,0.07)",
    text: "#e8f0fa",
    muted: "#7a9bbf",
    accent: "#00C9A7",
    warning: "#FF6B6B",
  };

  const getColor = (type) => {
    switch (type) {
      case "positive":
        return theme.accent;
      case "warning":
        return theme.warning;
      default:
        return theme.muted;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {insights.length === 0 && (
        <div
          style={{
            color: theme.muted,
            fontSize: 13,
            fontFamily: "'DM Mono', monospace",
          }}
        >
          No insights available
        </div>
      )}

      {insights.map((item, index) => (
        <div
          key={index}
          style={{
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {/* CATEGORY + CONFIDENCE */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              color: theme.muted,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: getColor(item.type) }}>
              {item.category}
            </span>

            <span>{Math.round((item.confidence || 0) * 100)}%</span>
          </div>

          {/* MESSAGE */}
          <div
            style={{
              fontSize: 13,
              color: theme.text,
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.4,
            }}
          >
            {item.message}
          </div>

          {/* ACCENT BAR */}
          <div
            style={{
              height: 2,
              width: "100%",
              background: `linear-gradient(90deg, ${getColor(
                item.type
              )}, transparent)`,
              borderRadius: 999,
              opacity: 0.6,
            }}
          />
        </div>
      ))}
    </div>
  );
}