import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "../helpers/render";
import MagicLinkVerifyClient from "client/components/auth/MagicLinkVerify";

const mutateAsync = vi.fn();
const setAuth = vi.fn();
const replace = vi.fn();

vi.mock("client/hooks/use-auth", () => ({
  useAuth: () => ({
    verifyMagicLinkMutation: { mutateAsync },
  }),
}));

vi.mock("client/context/AuthContext", () => ({
  useAuth: () => ({ setAuth }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => mockSearchParams,
}));

let mockSearchParams: URLSearchParams;

describe("MagicLinkVerifyClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams("token=valid-token-123");
  });

  it("shows the verifying state immediately", () => {
    mutateAsync.mockImplementation(() => new Promise(() => {}));
    render(<MagicLinkVerifyClient />);
    expect(screen.getByText("Verifying magic link...")).toBeInTheDocument();
  });

  it("shows an error state when no token is present in the URL", async () => {
    mockSearchParams = new URLSearchParams();
    render(<MagicLinkVerifyClient />);

    await waitFor(() => {
      expect(screen.getByText("Invalid magic link")).toBeInTheDocument();
    });
    expect(screen.getByText("Magic link token is missing.")).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("verifies the token and shows the success state", async () => {
    mutateAsync.mockResolvedValueOnce({
      accessToken: "access-token-123",
      user: { id: "user-1", email: "test@example.com" },
    });

    render(<MagicLinkVerifyClient />);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith("valid-token-123");
    });

    await waitFor(() => {
      expect(screen.getByText("You're signed in")).toBeInTheDocument();
    });

    expect(setAuth).toHaveBeenCalledWith("access-token-123", {
      id: "user-1",
      email: "test@example.com",
    });
  });

  it("shows the error state when verification fails", async () => {
    mutateAsync.mockRejectedValueOnce(new Error("Magic link expired"));

    render(<MagicLinkVerifyClient />);

    await waitFor(() => {
      expect(screen.getByText("Invalid magic link")).toBeInTheDocument();
    });
    expect(screen.getByText("Magic link expired")).toBeInTheDocument();
    expect(screen.getByText("Request a new link").closest("a")).toHaveAttribute("href", "/auth");
  });

  it("only verifies the token once even if the component re-renders", async () => {
    mutateAsync.mockResolvedValueOnce({
      accessToken: "access-token-123",
      user: { id: "user-1", email: "test@example.com" },
    });

    const { rerender } = render(<MagicLinkVerifyClient />);
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));

    rerender(<MagicLinkVerifyClient />);
    expect(mutateAsync).toHaveBeenCalledTimes(1);
  });
});
