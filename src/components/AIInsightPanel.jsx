// src/components/AIInsightPanel.jsx

export default function AIInsightPanel({ insights }) {
  return (
    <div className="grid gap-3">
      {insights.map((insight, i) => (
        <div
          key={i}
          className={`p-4 rounded-xl border shadow-sm ${
            insight.type === "positive"
              ? "border-green-500 bg-green-50"
              : insight.type === "warning"
              ? "border-yellow-500 bg-yellow-50"
              : "border-red-500 bg-red-50"
          }`}
        >
          <div className="flex justify-between items-center">
            <p className="font-semibold text-sm">🤖 AI Insight</p>
            <span className="text-xs opacity-60">
              {(insight.confidence * 100).toFixed(0)}%
            </span>
          </div>

          <p className="mt-2 text-sm">{insight.message}</p>

          <p className="text-xs mt-2 opacity-60">
            Category: {insight.category}
          </p>
        </div>
      ))}
    </div>
  );
}