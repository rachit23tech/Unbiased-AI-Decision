import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import App from "../src/App";

vi.mock("../src/components/MetricChart", () => ({
  default: function MetricChart() {
    return <div>Portfolio Fairness Trend</div>;
  },
}));

test("renders executive dashboard content", () => {
  render(
    <MemoryRouter
      initialEntries={["/dashboard"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByText(/Fairness Command Center/i)).toBeInTheDocument();
  expect(screen.getByText(/Governance Summary/i)).toBeInTheDocument();
  expect(screen.getByText(/Compliance Rate/i)).toBeInTheDocument();
  expect(screen.getByText(/Flagged Portfolio Items/i)).toBeInTheDocument();
});
