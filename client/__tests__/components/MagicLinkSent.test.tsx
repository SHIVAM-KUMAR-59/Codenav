import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../helpers/render";
import { MagicLinkSent } from "client/components/auth/MagicLinkSent";

describe("MagicLinkSent", () => {
  it("shows the provided email and expiry copy", () => {
    render(<MagicLinkSent email="dev@example.com" onBack={vi.fn()} />);

    expect(screen.getByText("Check your inbox")).toBeInTheDocument();
    expect(screen.getByText("dev@example.com")).toBeInTheDocument();
    expect(screen.getByText("15 mins")).toBeInTheDocument();
  });

  it("calls onBack when 'Use a different email' is clicked", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<MagicLinkSent email="dev@example.com" onBack={onBack} />);

    await user.click(screen.getByText("Use a different email"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
