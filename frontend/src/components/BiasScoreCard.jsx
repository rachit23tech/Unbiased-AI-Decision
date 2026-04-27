import { TrendingDown, TrendingUp, Minus } from "lucide-react";

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export default function BiasScoreCard({
  label,
  value,
  tone = "neutral",
  trend = "neutral",
  trendValue,
  detail,
}) {
  const TrendIcon = trendIcon[trend] ?? Minus;

  return (
    <section className={`metric-card tone-${tone}`}>
      <p className="metric-label">{label}</p>
      <div className="metric-value-row">
        <p className="metric-value">{value}</p>
        {trendValue ? (
          <span className="metric-trend">
            <TrendIcon size={14} />
            {trendValue}
          </span>
        ) : null}
      </div>
      {detail ? <p className="metric-detail">{detail}</p> : null}
    </section>
  );
}
