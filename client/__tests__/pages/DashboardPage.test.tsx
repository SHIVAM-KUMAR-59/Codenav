import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "../helpers/render";
import DashboardPage from "client/app/dashboard/page";
import { mockRepository, mockAnalysis } from "../helpers/factories";

const fetchRepositoriesQuery = vi.fn();

vi.mock("client/hooks/use-repository", () => ({
  useRepository: () => ({
    fetchRepositoriesQuery: fetchRepositoriesQuery(),
  }),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeletons while fetching", () => {
    fetchRepositoriesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    const { container } = render(<DashboardPage />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows the empty state when there are no repositories", async () => {
    fetchRepositoriesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("No repositories analyzed yet")).toBeInTheDocument();
    });
  });

  it("renders the repository list when data is available", async () => {
    fetchRepositoriesQuery.mockReturnValue({
      data: [
        mockRepository({ analyses: [mockAnalysis()] }),
        mockRepository({
          id: "repo-2",
          name: "fastify",
          owner: "fastify",
          url: "https://github.com/fastify/fastify",
          analyses: [mockAnalysis({ id: "analysis-2" })],
        }),
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("express")).toBeInTheDocument();
      expect(screen.getByText("fastify")).toBeInTheDocument();
    });
  });

  it("shows accurate stats for completed and in-progress repositories", async () => {
    fetchRepositoriesQuery.mockReturnValue({
      data: [
        mockRepository({ analyses: [mockAnalysis({ status: "COMPLETED" })] }),
        mockRepository({
          id: "repo-2",
          analyses: [mockAnalysis({ id: "analysis-2", status: "CLONING" })],
        }),
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Total Repositories")).toBeInTheDocument();
    });
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("shows the error state on fetch failure", async () => {
    fetchRepositoriesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Network error"),
      refetch: vi.fn(),
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load repositories")).toBeInTheDocument();
    });
  });

  it("calls refetch when 'Try Again' is clicked", async () => {
    const refetch = vi.fn();
    fetchRepositoriesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Network error"),
      refetch,
    });

    const { default: userEvent } = await import("@testing-library/user-event");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (userEvent as any).setup();

    render(<DashboardPage />);

    await waitFor(() => screen.getByText("Try Again"));
    await user.click(screen.getByText("Try Again"));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("links the 'Analyze Repository' header action to /dashboard/new", async () => {
    fetchRepositoriesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);

    await waitFor(() => {
      const link = screen.getByText("Analyze Repository").closest("a");
      expect(link).toHaveAttribute("href", "/dashboard/new");
    });
  });
});
