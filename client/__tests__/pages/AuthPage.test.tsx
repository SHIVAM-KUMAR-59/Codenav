import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../helpers/render";
import AuthPage from "client/app/auth/page";

const mutateAsync = vi.fn();

vi.mock("client/hooks/use-auth", () => ({
  useAuth: () => ({
    sendMagicLinkMutation: {
      mutateAsync,
      isPending: false,
    },
  }),
}));

describe("AuthPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the header and form", () => {
    render(<AuthPage />);
    expect(screen.getByText("Codenav")).toBeInTheDocument();
    expect(screen.getByText("Repository intelligence for contributors")).toBeInTheDocument();
    expect(screen.getByText("Understand any repository in minutes")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByText("Continue with Email")).toBeInTheDocument();
    expect(screen.getByText("Continue with GitHub")).toBeInTheDocument();
  });

  it("requires the email field", () => {
    render(<AuthPage />);
    const input = screen.getByLabelText("Email address");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("type", "email");
  });

  it("submits the email and shows the magic link sent screen on success", async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValueOnce(undefined);

    render(<AuthPage />);

    await user.type(screen.getByLabelText("Email address"), "test@example.com");
    await user.click(screen.getByText("Continue with Email"));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith("test@example.com");
    });

    await waitFor(() => {
      expect(screen.getByText("Check your inbox")).toBeInTheDocument();
    });
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("returns to the form from the sent screen via 'Use a different email'", async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValueOnce(undefined);

    render(<AuthPage />);

    await user.type(screen.getByLabelText("Email address"), "test@example.com");
    await user.click(screen.getByText("Continue with Email"));

    await waitFor(() => screen.getByText("Check your inbox"));

    await user.click(screen.getByText("Use a different email"));

    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.queryByText("Check your inbox")).not.toBeInTheDocument();
  });

  it("does not navigate to the sent screen if the request fails", async () => {
    const user = userEvent.setup();
    mutateAsync.mockRejectedValueOnce(new Error("Network error"));

    render(<AuthPage />);

    await user.type(screen.getByLabelText("Email address"), "test@example.com");
    await user.click(screen.getByText("Continue with Email"));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalled();
    });

    expect(screen.queryByText("Check your inbox")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });

  it("redirects to the GitHub OAuth endpoint when the GitHub button is clicked", async () => {
    const user = userEvent.setup();
    const originalLocation = window.location;

    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: { ...originalLocation, href: "" },
    });

    render(<AuthPage />);
    await user.click(screen.getByText("Continue with GitHub"));

    expect(window.location.href).toContain("/api/v1/auth/github");

    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
  });
});
