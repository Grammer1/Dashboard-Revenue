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

 const sorted = [...data].sort((a, b) => b.revenue - a.revenue);

const top = sorted[0];
const bottom = sorted[sorted.length - 1];

const total = data.reduce((sum, item) => sum + item.revenue, 0);

 insights.push({
  type: "positive",
  category: "ranking",
  message: `${top.name} adalah kontributor utama dengan ${((top.revenue / total) * 100).toFixed(1)}% dari total revenue`,
  confidence: 0.9,
});

  insights.push({
    type: "warning",
    category: "ranking",
    message: `${bottom.name} memiliki kontribusi terendah dan perlu optimasi strategi`,
    confidence: 0.85,
  });

  const gap = top.revenue - bottom.revenue;

  insights.push({
    type: "warning",
    category: "gap",
    message: `Gap antara stream tertinggi dan terendah sebesar ${gap.toLocaleString()}`,
    confidence: 0.8,
  });

  return insights;
}