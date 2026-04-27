import os, datetime
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import cm

def generate_pdf_report(job_id: str, bias_score: int, results: list, recommendations: list, output_dir: str = "./uploads") -> str:
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, f"report_{job_id}.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    story.append(Paragraph("Unbiased AI — Bias Audit Report", styles["Title"]))
    story.append(Paragraph(f"Generated: {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]))
    story.append(Spacer(1, 0.5*cm))
    risk = "LOW RISK" if bias_score >= 80 else ("MEDIUM RISK" if bias_score >= 50 else "HIGH RISK")
    story.append(Paragraph(f"Overall Bias Score: {bias_score}/100 — {risk}", styles["Heading2"]))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("Fairness Metrics", styles["Heading3"]))
    table_data = [["Metric", "Value", "Threshold", "Status"]]
    for r in results:
        table_data.append([r["metric_name"], str(r["metric_value"]), str(r["threshold"]), "PASS" if r["passed"] else "FAIL"])
    t = Table(table_data, colWidths=[8*cm, 3*cm, 3*cm, 2.5*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.darkblue),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.whitesmoke, colors.white]),
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("Recommendations", styles["Heading3"]))
    for rec in recommendations:
        story.append(Paragraph(f"• {rec}", styles["Normal"]))
    doc.build(story)
    return filepath

def generate_recommendations(results: list) -> list:
    recs = []
    for r in results:
        if not r["passed"]:
            col = r["metric_name"].split("_")[-1]
            if "demographic_parity" in r["metric_name"]:
                recs.append(f"Re-weight training data to balance selection rates for '{col}'.")
            elif "equalized_odds" in r["metric_name"]:
                recs.append(f"Apply post-processing calibration to equalize TPR/FPR for '{col}'.")
            elif "disparate_impact" in r["metric_name"]:
                recs.append(f"Remove or transform proxy features correlated with '{col}'.")
    if not recs:
        recs.append("Model meets all fairness thresholds. Continue monitoring with new data.")
    return recs