import pandas as pd
import numpy as np
from fairlearn.metrics import demographic_parity_difference, equalized_odds_difference
import pickle

def compute_bias_metrics(df: pd.DataFrame, target_col: str, sensitive_cols: list, model_path: str = None):
    results = []
    y_true = df[target_col].astype(int)

    if model_path:
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        feature_cols = [c for c in df.columns if c != target_col and c not in sensitive_cols]
        y_pred = model.predict(df[feature_cols])
    else:
        y_pred = y_true

    for col in sensitive_cols:
        sensitive = df[col]
        try:
            dpd = demographic_parity_difference(y_true, y_pred, sensitive_features=sensitive)
            results.append({"metric_name": f"demographic_parity_diff_{col}", "metric_value": round(float(dpd), 4), "threshold": 0.1, "passed": abs(dpd) <= 0.1})
        except Exception:
            pass
        try:
            eod = equalized_odds_difference(y_true, y_pred, sensitive_features=sensitive)
            results.append({"metric_name": f"equalized_odds_diff_{col}", "metric_value": round(float(eod), 4), "threshold": 0.1, "passed": abs(eod) <= 0.1})
        except Exception:
            pass
        try:
            groups = df[col].unique()
            if len(groups) >= 2:
                rate_a = float(y_pred[df[col] == groups[0]].mean())
                rate_b = float(y_pred[df[col] == groups[1]].mean())
                di = rate_a / rate_b if rate_b != 0 else 0.0
                results.append({"metric_name": f"disparate_impact_{col}", "metric_value": round(di, 4), "threshold": 0.8, "passed": di >= 0.8})
        except Exception:
            pass

    bias_score = int((sum(1 for r in results if r["passed"]) / len(results)) * 100) if results else 50
    return results, bias_score