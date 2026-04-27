import { AlertTriangle, ShieldAlert } from "lucide-react";

export default function FlagBanner({
  title,
  message,
  severity = "medium",
  meta,
  action,
}) {
  const Icon = severity === "high" ? ShieldAlert : AlertTriangle;

  return (
    <section className="priority-banner" data-severity={severity}>
      <div className="priority-banner-main">
        <div className="priority-icon">
          <Icon size={20} />
        </div>
        <div>
          <h2 className="priority-title">{title}</h2>
          <p className="priority-message">{message}</p>
          {meta ? <p className="priority-meta">{meta}</p> : null}
        </div>
      </div>
      {action ? <div>{action}</div> : null}
    </section>
  );
}
