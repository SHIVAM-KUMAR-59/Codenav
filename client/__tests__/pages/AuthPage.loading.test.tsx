import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../helpers/render";
import AuthPage from "client/app/auth/page";

vi.mock("client/hooks/use-auth", () => ({
  useAuth: () => ({
    sendMagicLinkMutation: {
      mutateAsync: vi.fn(),
      isPending: true,
    },
  }),
}));

describe("AuthPage - loading state", () => {
  it("shows the loading label and hides the idle label while pending", () => {
    render(<AuthPage />);
    expect(screen.getByText("Sending you the link...")).toBeInTheDocument();
    expect(screen.queryByText("Continue with Email")).not.toBeInTheDocument();
  });

  it("disables the GitHub button while the email request is pending", () => {
    render(<AuthPage />);
    expect(screen.getByText("Continue with GitHub").closest("button")).toBeDisabled();
  });
});
