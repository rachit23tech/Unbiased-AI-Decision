"""
Gemini AI Integration Service
──────────────────────────────
Uses the Google Gemini API (google-generativeai SDK) to generate
natural-language explanations and tailored mitigation recommendations
from the bias analysis results produced by the fairness engine.
"""

import os
import json
import google.generativeai as genai
from app.config import settings


# ── Configure the SDK ────────────────────────────────────────────────────────
genai.configure(api_key=settings.GEMINI_API_KEY)

# Model to use — Gemini 1.5 Flash is fast and cost-effective
_MODEL_NAME = "gemini-1.5-flash"


def _build_prompt(bias_data: dict) -> str:
    """Build a detailed prompt for Gemini from the bias analysis payload."""

    metrics_block = json.dumps(bias_data.get("metrics", []), indent=2)
    attributes    = ", ".join(bias_data.get("attributes", []))
    overall_score = bias_data.get("overall_score", "N/A")
    target        = bias_data.get("target_outcome", "unknown")
    file_name     = bias_data.get("file_name", "uploaded dataset")

    return f"""You are an AI fairness expert. A bias audit has just been completed on the dataset "{file_name}".

**Target outcome column:** {target}
**Sensitive attributes analysed:** {attributes}
**Overall fairness score:** {overall_score} / 100

**Detailed fairness metrics:**
{metrics_block}

Based on the above results, please provide:

1. **Plain-English Summary** (2-3 sentences): Explain the overall fairness posture in language a non-technical stakeholder could understand.

2. **Key Findings** (bullet list): Highlight which attributes are most problematic and why, referencing the specific metric values.

3. **Tailored Mitigation Recommendations** (numbered list): Provide 3-5 actionable, specific steps the team should take to reduce bias, ordered by impact. Reference the relevant metrics and attributes.

4. **Regulatory Risk Note** (1-2 sentences): Flag any potential regulatory concerns (GDPR Article 22, EU AI Act, ECOA, EEOC 4/5ths rule) based on the results.

Keep the language professional but accessible. Use markdown formatting."""


async def generate_bias_insights(bias_data: dict) -> dict:
    """
    Send bias analysis results to Gemini and return structured AI insights.

    Parameters
    ----------
    bias_data : dict
        Must include: metrics (list), attributes (list), overall_score (int),
        target_outcome (str), file_name (str).

    Returns
    -------
    dict  – { "insights": str, "model": str, "status": "ok" | "error" }
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key or api_key == "your-gemini-api-key":
        return _fallback_insights(bias_data)

    try:
        model = genai.GenerativeModel(_MODEL_NAME)
        prompt = _build_prompt(bias_data)
        response = model.generate_content(prompt)
        return {
            "insights": response.text,
            "model": _MODEL_NAME,
            "status": "ok",
        }
    except Exception as e:
        # If Gemini call fails (no key, quota, network), return smart fallback
        print(f"[Gemini] API call failed: {e}")
        return _fallback_insights(bias_data)


def _fallback_insights(bias_data: dict) -> dict:
    """
    Generate rule-based insights when the Gemini API is not available.
    This ensures the feature always works, even without an API key.
    """
    overall = bias_data.get("overall_score", 50)
    attrs   = bias_data.get("attributes", [])
    metrics = bias_data.get("metrics", [])
    target  = bias_data.get("target_outcome", "outcome")

    failed = [m for m in metrics if not m.get("passed", True)]
    passed = [m for m in metrics if m.get("passed", True)]

    if overall >= 80:
        summary = f"The model demonstrates strong fairness across all monitored attributes for **{target}** predictions. All key metrics are within acceptable thresholds."
    elif overall >= 50:
        summary = f"The model shows moderate fairness for **{target}** predictions, but some attributes are approaching risk thresholds and should be monitored closely."
    else:
        summary = f"Significant bias has been detected in **{target}** predictions. Multiple fairness metrics have breached acceptable thresholds, requiring immediate remediation."

    findings = []
    for m in failed:
        name = m.get("metric_name", "unknown")
        val  = m.get("metric_value", 0)
        thr  = m.get("threshold", 0)
        findings.append(f"- **{name}**: value {val} exceeds threshold {thr} — indicates measurable disparity.")
    for m in passed[:2]:
        name = m.get("metric_name", "unknown")
        findings.append(f"- **{name}**: within acceptable range ✓")

    recs = []
    recs.append("1. Re-balance training data representation across all sensitive attribute groups.")
    if any("demographic_parity" in m.get("metric_name", "") for m in failed):
        recs.append("2. Apply a demographic parity constraint during model re-training to equalize selection rates.")
    if any("equalized_odds" in m.get("metric_name", "") for m in failed):
        recs.append("3. Calibrate decision thresholds independently per group to equalize true/false positive rates.")
    if any("disparate_impact" in m.get("metric_name", "") for m in failed):
        recs.append("4. Identify and remove proxy features that indirectly encode protected attribute information.")
    recs.append(f"{len(recs)+1}. Establish a recurring fairness review cadence and integrate bias checks into the CI/CD pipeline.")

    reg_note = "Based on the metrics, this model should be reviewed against GDPR Article 22 (right to explanation) and the EU AI Act high-risk classification requirements before production deployment."

    insights = f"""## Summary\n{summary}\n\n## Key Findings\n{chr(10).join(findings)}\n\n## Mitigation Recommendations\n{chr(10).join(recs)}\n\n## Regulatory Risk Note\n{reg_note}"""

    return {
        "insights": insights,
        "model": "rule-based-fallback (Gemini API key not configured)",
        "status": "fallback",
    }
