import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";

test("lets the user configure a new upload review", () => {
  render(
    <MemoryRouter
      initialEntries={["/upload"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>,
  );

  const fileInput = screen.getByLabelText(/upload file/i);
  const targetSelect = screen.getByLabelText(/target outcome/i);
  const ownerSelect = screen.getByLabelText(/business owner/i);
  const launchButton = screen.getByRole("button", { name: /launch analysis/i });

  expect(launchButton).toBeDisabled();

  fireEvent.change(fileInput, {
    target: {
      files: [new File(["id,score"], "fairness-review.csv", { type: "text/csv" })],
    },
  });
  fireEvent.change(targetSelect, { target: { value: "loan_approved" } });
  fireEvent.change(ownerSelect, { target: { value: "Credit Risk" } });
  fireEvent.click(screen.getByLabelText(/gender/i));

  expect(screen.getByText(/fairness-review\.csv/i)).toBeInTheDocument();
  expect(launchButton).toBeEnabled();
});
