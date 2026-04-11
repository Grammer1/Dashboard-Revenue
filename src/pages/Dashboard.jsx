// src/pages/Dashboard.jsx

import { useMemo } from "react";
import AIInsightPanel from "../components/AIInsightPanel";
import { generateInsights } from "../services/aiInsightService";
import { simpleForecast } from "../utils/forecast";
import revenueData from "../data/revenueData";

export default function Dashboard() {
  const insights = useMemo(() => {
    return generateInsights(revenueData);
  }, []);

  const forecast = useMemo(() => {
    return simpleForecast(revenueData, 7);
  }, []);

  const latestRevenue =
    revenueData[revenueData.length - 1].revenue;

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      {/* KPI SECTION */}
      <div style={{ display: "flex", gap: 20 }}>
        <div style={cardStyle}>
          <h3>Revenue</h3>
          <p>${latestRevenue}</p>
        </div>

        <div style={cardStyle}>
          <h3>Forecast 7D</h3>
          <p>${forecast?.forecast}</p>
        </div>

        <div style={cardStyle}>
          <h3>Growth Rate</h3>
          <p>{forecast?.growthRate}%</p>
        </div>
      </div>

      {/* AI INSIGHT */}
      <div style={{ marginTop: 30 }}>
        <h2>AI Insight Engine</h2>
        <AIInsightPanel insights={insights} />
      </div>
    </div>
  );
}

const cardStyle = {
  padding: 15,
  border: "1px solid #ddd",
  borderRadius: 10,
  minWidth: 150,
};