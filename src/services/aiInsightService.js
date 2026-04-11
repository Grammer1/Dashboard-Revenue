// src/services/aiInsightService.js

export function generateInsights(data) {
  const insights = [];

  if (!data || data.length < 2) {
    return [
      {
        type: "warning",
        category: "revenue",
        message: "Data tidak cukup untuk analisis AI",
        confidence: 0.3,
      },
    ];
  }

  const latest = data[data.length - 1];
  const previous = data[data.length - 2];

  const growth =
    ((latest.revenue - previous.revenue) / previous.revenue) * 100;

  // Revenue trend insight
  if (growth > 0) {
    insights.push({
      type: "positive",
      category: "revenue",
      message: `Revenue naik ${growth.toFixed(1)}% dibanding periode sebelumnya`,
      confidence: 0.85,
    });
  } else {
    insights.push({
      type: "warning",
      category: "revenue",
      message: `Revenue turun ${Math.abs(growth).toFixed(1)}% dibanding periode sebelumnya`,
      confidence: 0.85,
    });
  }

  // Simple anomaly detection
  const avg =
    data.reduce((sum, item) => sum + item.revenue, 0) / data.length;

  const deviation = ((latest.revenue - avg) / avg) * 100;

  if (Math.abs(deviation) > 20) {
    insights.push({
      type: "warning",
      category: "anomaly",
      message: `Terjadi anomali: revenue berbeda ${deviation.toFixed(
        1
      )}% dari rata-rata`,
      confidence: 0.7,
    });
  }

  // Momentum insight
  if (latest.revenue > previous.revenue) {
    insights.push({
      type: "positive",
      category: "trend",
      message: "Momentum bisnis sedang naik (bullish trend)",
      confidence: 0.8,
    });
  } else {
    insights.push({
      type: "warning",
      category: "trend",
      message: "Momentum bisnis melemah (bearish trend)",
      confidence: 0.8,
    });
  }

  return insights;
}