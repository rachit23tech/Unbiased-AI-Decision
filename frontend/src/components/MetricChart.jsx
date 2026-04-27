import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import useAnalysisStore from "../store/useAnalysisStore";

const STATIC_DATA = [
  { label: "Jan", score: 84, threshold: 70 },
  { label: "Feb", score: 82, threshold: 70 },
  { label: "Mar", score: 79, threshold: 70 },
  { label: "Apr", score: 86, threshold: 70 },
  { label: "May", score: 88, threshold: 70 },
  { label: "Jun", score: 85, threshold: 70 },
  { label: "Jul", score: 81, threshold: 70 },
  { label: "Aug", score: 83, threshold: 70 },
];

function shortLabel(fileName, idx) {
  const base = fileName.replace(/\.[^.]+$/, "").slice(0, 12);
  return base || `Run ${idx + 1}`;
}

export default function MetricChart() {
  const history = useAnalysisStore((s) => s.history);

  // Build chart data from history (oldest → newest, up to 8 points)
  const liveData = [...history]
    .reverse()
    .slice(-8)
    .map((run, i) => ({
      label: shortLabel(run.fileName, i),
      score: run.overall,
      threshold: 70,
    }));

  const data = liveData.length > 0 ? liveData : STATIC_DATA;
  const isLive = liveData.length > 0;

  const minScore = Math.min(...data.map((d) => d.score));
  const yMin = Math.max(0, Math.floor(minScore / 10) * 10 - 10);

  return (
    <section className="chart-panel">
      <div className="panel-heading">
        <div>
          <h2 className="panel-title">Portfolio Fairness Trend</h2>
          <p className="panel-description">
            {isLive
              ? "Fairness scores across your recent analysis runs, measured against the governance threshold."
              : "Monthly average fairness score across active decisioning systems, measured against the board-approved operating threshold."}
          </p>
        </div>
        <span className="panel-note">
          {isLive ? `${liveData.length} runs` : "Threshold: 70"}
        </span>
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="executiveScoreFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#17324d" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#17324d" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e3e9f0" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6b7b8d", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              domain={[yMin, 100]}
              tick={{ fill: "#6b7b8d", fontSize: 12 }}
            />
            <ReferenceLine
              y={70}
              stroke="#b7791f"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid #d9e1ea",
                backgroundColor: "#ffffff",
                boxShadow: "0 16px 40px rgba(16, 32, 51, 0.08)",
              }}
              formatter={(v, name) =>
                name === "score" ? [`${v} / 100`, "Fairness Score"] : null
              }
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#17324d"
              strokeWidth={3}
              fill="url(#executiveScoreFill)"
              dot={{ r: 4, fill: "#17324d", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
