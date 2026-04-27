import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="basic-page">
      <section className="page-panel not-found">
        <p className="section-kicker">Routing</p>
        <h2 className="panel-title">Page not found</h2>
        <p className="panel-description">
          The requested route is not part of the current executive review workspace.
        </p>
        <div>
          <Link to="/dashboard" className="btn btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
