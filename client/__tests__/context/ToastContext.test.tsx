import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "client/context/ToastContext";

function Trigger() {
  const { success, error } = useToast();
  return (
    <div>
      <button onClick={() => success("Saved successfully")}>trigger-success</button>
      <button onClick={() => error("Something failed")}>trigger-error</button>
    </div>
  );
}

describe("ToastContext", () => {
  it("throws if useToast is used outside a provider", () => {
    const Bare = () => {
      useToast();
      return null;
    };
    expect(() => render(<Bare />)).toThrow("useToast must be used within a ToastProvider");
  });

  it("renders a success toast with the given message", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );

    await user.click(screen.getByText("trigger-success"));
    expect(screen.getByText("Saved successfully")).toBeInTheDocument();
  });

  it("renders an error toast with the given message", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );

    await user.click(screen.getByText("trigger-error"));
    expect(screen.getByText("Something failed")).toBeInTheDocument();
  });

  it("dismisses a toast when its close button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );

    await user.click(screen.getByText("trigger-success"));
    expect(screen.getByText("Saved successfully")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Close toast"));

    await waitFor(() => {
      expect(screen.queryByText("Saved successfully")).not.toBeInTheDocument();
    });
  });

  it("can show multiple toasts at once", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );

    await user.click(screen.getByText("trigger-success"));
    await user.click(screen.getByText("trigger-error"));

    expect(screen.getByText("Saved successfully")).toBeInTheDocument();
    expect(screen.getByText("Something failed")).toBeInTheDocument();
  });
});
