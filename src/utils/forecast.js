// src/utils/forecast.js

export function simpleForecast(data, daysAhead = 3) {
  if (!data || data.length < 2) return null;

  const last = data[data.length - 1];
  const prev = data[data.length - 2];

  const growthRate = (last.revenue - prev.revenue) / prev.revenue;

  let forecast = last.revenue;

  for (let i = 0; i < daysAhead; i++) {
    forecast = forecast + forecast * growthRate;
  }

  return {
    forecast: forecast.toFixed(2),
    growthRate: (growthRate * 100).toFixed(2),
  };
}