import { motion } from "framer-motion";

export default function GaugeChart({ score = 78, size = 180 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 18;
  const strokeWidth = 12;

  const leftX = cx - r;
  const leftY = cy;
  const rightX = cx + r;
  const rightY = cy;

  const arcLength = Math.PI * r;
  const offset = arcLength - (score / 100) * arcLength;

  const color =
    score >= 70 ? "var(--green)" : score >= 40 ? "var(--amber)" : "var(--red)";
  const label =
    score >= 70 ? "Low Bias" : score >= 40 ? "Medium Bias" : "High Bias";

  const arcPath = `M ${leftX} ${leftY} A ${r} ${r} 0 0 0 ${rightX} ${rightY}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg
        width={size}
        height={size / 2 + 38}
        viewBox={`0 0 ${size} ${size / 2 + 38}`}
      >
        {/* Background track */}
        <path
          d={arcPath}
          fill="none"
          stroke="var(--line)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored score arc */}
        {score > 0 && (
          <motion.path
            d={arcPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ strokeDasharray: arcLength, strokeDashoffset: arcLength }}
            animate={{ strokeDasharray: arcLength, strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
          />
        )}

        {/* Score value */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fill="var(--text-strong)"
          fontSize={size / 5}
          fontWeight="700"
          fontFamily="Outfit, Segoe UI, sans-serif"
        >
          {score}
        </text>

        {/* /100 sub-label */}
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fill="var(--muted)"
          fontSize="11"
          fontFamily="Outfit, Segoe UI, sans-serif"
        >
          / 100
        </text>

        {/* Min label */}
        <text
          x={leftX + 2}
          y={leftY + 20}
          fill="var(--muted)"
          fontSize="9"
          fontFamily="Outfit, Segoe UI, sans-serif"
        >
          0
        </text>

        {/* Max label */}
        <text
          x={rightX - 14}
          y={rightY + 20}
          fill="var(--muted)"
          fontSize="9"
          fontFamily="Outfit, Segoe UI, sans-serif"
        >
          100
        </text>
      </svg>

      <span style={{ fontSize: "0.85rem", fontWeight: 700, color }}>
        {label} Risk
      </span>
    </div>
  );
}
