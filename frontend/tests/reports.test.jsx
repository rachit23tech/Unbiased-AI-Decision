import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";

test("lets the user filter and search reports", () => {
  render(
    <MemoryRouter
      initialEntries={["/reports"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>,
  );

  const searchInput = screen.getByLabelText(/search reports/i);
  const filterSelect = screen.getByLabelText(/risk filter/i);

  expect(
    screen.getByText(/Hiring Model Fairness Audit/i),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Loan Approval Scoring Review/i),
  ).toBeInTheDocument();

  fireEvent.change(filterSelect, { target: { value: "high" } });

  expect(
    screen.queryByText(/Hiring Model Fairness Audit/i),
  ).not.toBeInTheDocument();
  expect(
    screen.getByText(/Loan Approval Scoring Review/i),
  ).toBeInTheDocument();

  fireEvent.change(filterSelect, { target: { value: "all" } });
  fireEvent.change(searchInput, { target: { value: "claims" } });

  expect(
    screen.getByText(/Claims Triage Quarterly Audit/i),
  ).toBeInTheDocument();
  expect(
    screen.queryByText(/Loan Approval Scoring Review/i),
  ).not.toBeInTheDocument();
});
