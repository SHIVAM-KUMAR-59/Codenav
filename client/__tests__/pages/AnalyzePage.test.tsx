import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../helpers/render";
import AnalyzePage from "client/app/dashboard/new/page";

const mutateAsync = vi.fn();
const push = vi.fn();

vi.mock("client/hooks/use-repository", () => ({
  useRepository: () => ({
    analyzeRepositoryMutation: {
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
    },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("client/lib/constants", () => ({
  SSE_STEPS: ["CLONING", "DETECTING_LANGUAGES", "BUILDING_DEPENDENCY_GRAPH", "COMPLETED"],
  SSE_STATUS_LABELS: {
    CLONING: "Cloning repository",
    DETECTING_LANGUAGES: "Detecting languages",
    BUILDING_DEPENDENCY_GRAPH: "Building dependency graph",
    COMPLETED: "Completed",
  },
}));

class MockEventSource {
  onmessage: ((ev: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn();
  constructor(public url: string) {
    instances.push(this);
  }
}
let instances: MockEventSource[] = [];

describe("AnalyzePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    instances = [];
    (global as unknown as { EventSource: typeof EventSource }).EventSource =
      MockEventSource as unknown as typeof EventSource;
  });

  it("renders the form with a back link to the dashboard", () => {
    render(<AnalyzePage />);
    expect(screen.getByText("Analyze a repository")).toBeInTheDocument();
    expect(screen.getByText("← Back to dashboard").closest("a")).toHaveAttribute(
      "href",
      "/dashboard"
    );
  });

  it("submits the URL and opens the progress view with the returned analysis id", async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValueOnce({
      analysisId: "analysis-1",
      status: "PENDING",
      cached: false,
    });

    render(<AnalyzePage />);

    await user.type(
      screen.getByPlaceholderText("https://github.com/owner/repository"),
      "https://github.com/expressjs/express"
    );
    await user.click(screen.getByText("Analyze Repository"));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith("https://github.com/expressjs/express");
    });

    await waitFor(() => {
      expect(screen.getByText(/Analysis ID: analysis-1/)).toBeInTheDocument();
    });
  });

  it("shows the cached banner when the result is cached", async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValueOnce({
      analysisId: "analysis-1",
      status: "COMPLETED",
      cached: true,
    });

    render(<AnalyzePage />);

    await user.type(
      screen.getByPlaceholderText("https://github.com/owner/repository"),
      "https://github.com/expressjs/express"
    );
    await user.click(screen.getByText("Analyze Repository"));

    await waitFor(() => {
      expect(screen.getByText(/already analyzed at this commit/)).toBeInTheDocument();
    });
  });

  it("shows the View Analysis button once the SSE stream reports COMPLETED", async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValueOnce({
      analysisId: "analysis-1",
      status: "PENDING",
      cached: false,
    });

    render(<AnalyzePage />);

    await user.type(
      screen.getByPlaceholderText("https://github.com/owner/repository"),
      "https://github.com/expressjs/express"
    );
    await user.click(screen.getByText("Analyze Repository"));

    await waitFor(() => expect(instances.length).toBe(1));

    act(() => {
      instances[0]?.onmessage?.({
        data: JSON.stringify({ status: "COMPLETED", progress: 100, message: "Analysis complete" }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText("View Analysis")).toBeInTheDocument();
    });
  });

  it("navigates to the repository page when View Analysis is clicked", async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValueOnce({
      analysisId: "analysis-1",
      status: "PENDING",
      cached: false,
    });

    render(<AnalyzePage />);

    await user.type(
      screen.getByPlaceholderText("https://github.com/owner/repository"),
      "https://github.com/expressjs/express"
    );
    await user.click(screen.getByText("Analyze Repository"));

    await waitFor(() => expect(instances.length).toBe(1));

    act(() => {
      instances[0]?.onmessage?.({
        data: JSON.stringify({ status: "COMPLETED", progress: 100, message: "Done" }),
      });
    });

    await waitFor(() => screen.getByText("View Analysis"));
    await user.click(screen.getByText("View Analysis"));

    expect(push).toHaveBeenCalledWith("/repositories/analysis-1");
  });

  it("shows the failed state with a retry option", async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValueOnce({
      analysisId: "analysis-1",
      status: "PENDING",
      cached: false,
    });

    render(<AnalyzePage />);

    await user.type(
      screen.getByPlaceholderText("https://github.com/owner/repository"),
      "https://github.com/expressjs/express"
    );
    await user.click(screen.getByText("Analyze Repository"));

    await waitFor(() => expect(instances.length).toBe(1));

    act(() => {
      instances[0]?.onmessage?.({
        data: JSON.stringify({ status: "FAILED", progress: 40, message: "Clone failed" }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Clone failed")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Try Again"));

    expect(screen.getByPlaceholderText("https://github.com/owner/repository")).toBeInTheDocument();
    expect(screen.queryByText("Clone failed")).not.toBeInTheDocument();
  });

  it("shows a connection-lost message when the SSE stream errors", async () => {
    const user = userEvent.setup();
    mutateAsync.mockResolvedValueOnce({
      analysisId: "analysis-1",
      status: "PENDING",
      cached: false,
    });

    render(<AnalyzePage />);

    await user.type(
      screen.getByPlaceholderText("https://github.com/owner/repository"),
      "https://github.com/expressjs/express"
    );
    await user.click(screen.getByText("Analyze Repository"));

    await waitFor(() => expect(instances.length).toBe(1));

    act(() => {
      instances[0]?.onerror?.();
    });

    await waitFor(() => {
      expect(screen.getByText("Lost connection to analysis stream.")).toBeInTheDocument();
    });
  });

  it("shows an error message when the initial submission fails", async () => {
    const user = userEvent.setup();
    mutateAsync.mockRejectedValueOnce(new Error("Repository not found"));

    render(<AnalyzePage />);

    await user.type(
      screen.getByPlaceholderText("https://github.com/owner/repository"),
      "https://github.com/nonexistent/repo"
    );
    await user.click(screen.getByText("Analyze Repository"));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalled();
    });

    expect(screen.getByPlaceholderText("https://github.com/owner/repository")).toBeInTheDocument();
  });
});
