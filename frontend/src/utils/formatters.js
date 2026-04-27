export function formatPercent(value) {
  if (typeof value !== "number") {
    return "--";
  }

  return `${value.toFixed(1)}%`;
}

export function formatRiskLabel(score) {
  if (typeof score !== "number") {
    return "Unknown";
  }

  if (score >= 80) {
    return "Low Risk";
  }

  if (score >= 50) {
    return "Medium Risk";
  }

  return "High Risk";
}
