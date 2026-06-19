import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "../helpers/render";
import AuthCallbackClient from "client/components/auth/AuthCallback";
import { tokenStore } from "client/lib/api/axios";

const me = vi.fn();
const setAuth = vi.fn();
const replace = vi.fn();

vi.mock("client/lib/api/auth", () => ({
  authApi: {
    me: (...args: unknown[]) => me(...args),
  },
}));

vi.mock("client/context/AuthContext", () => ({
  useAuth: () => ({ setAuth }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => mockSearchParams,
}));

let mockSearchParams: URLSearchParams;

describe("AuthCallbackClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams("accessToken=token-abc");
  });

  it("redirects to /auth if no access token is present", async () => {
    mockSearchParams = new URLSearchParams();
    render(<AuthCallbackClient />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/auth");
    });
    expect(me).not.toHaveBeenCalled();
  });

  it("stores the token, fetches the user, and redirects to the dashboard", async () => {
    me.mockResolvedValueOnce({ id: "user-1", email: "test@example.com" });

    render(<AuthCallbackClient />);

    await waitFor(() => {
      expect(tokenStore.set).toHaveBeenCalledWith("token-abc");
    });

    await waitFor(() => {
      expect(setAuth).toHaveBeenCalledWith("token-abc", {
        id: "user-1",
        email: "test@example.com",
      });
    });

    expect(replace).toHaveBeenCalledWith("/dashboard");
  });

  it("clears the token and redirects to /auth if fetching the user fails", async () => {
    me.mockRejectedValueOnce(new Error("Unauthorized"));

    render(<AuthCallbackClient />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/auth");
    });
    expect(tokenStore.set).toHaveBeenCalledWith(null);
  });

  it("shows the signing-in loader while resolving", () => {
    me.mockImplementation(() => new Promise(() => {}));
    render(<AuthCallbackClient />);
    expect(screen.getByText("Signing you in...")).toBeInTheDocument();
  });
});
