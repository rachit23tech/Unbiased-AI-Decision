const PARAMS_KEY = "approval_params";

export const DEFAULT_PARAMS = {
  minOverallScore:    70,  // overall fairness score must be ≥ this
  minAttributeScore:  60,  // every attribute score must be ≥ this
  maxFailingAttrs:     0,  // how many attributes may fall below min (0 = all must pass)
};

export function loadParams() {
  try {
    const saved = JSON.parse(localStorage.getItem(PARAMS_KEY) || "null");
    return saved ? { ...DEFAULT_PARAMS, ...saved } : { ...DEFAULT_PARAMS };
  } catch {
    return { ...DEFAULT_PARAMS };
  }
}

export function saveParams(params) {
  try { localStorage.setItem(PARAMS_KEY, JSON.stringify(params)); }
  catch {}
}

/**
 * Returns { passed: bool, failures: string[] }
 * failures lists the human-readable reasons the report was rejected.
 */
export function runApprovalCheck(result) {
  const params = loadParams();
  const failures = [];

  const overall = result.overall ?? 0;
  if (overall < params.minOverallScore) {
    failures.push(
      `Overall score ${overall} is below the required minimum of ${params.minOverallScore}`,
    );
  }

  if (result.scores) {
    const failingAttrs = Object.entries(result.scores)
      .filter(([, score]) => score < params.minAttributeScore)
      .map(([attr]) => attr);

    if (failingAttrs.length > params.maxFailingAttrs) {
      failures.push(
        `${failingAttrs.length} attribute(s) scored below ${params.minAttributeScore}: ${failingAttrs.join(", ")}`,
      );
    }
  }

  return { passed: failures.length === 0, failures };
}
