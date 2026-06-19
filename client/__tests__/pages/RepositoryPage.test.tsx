import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../helpers/render";
import { mockAnalysis, mockQueryResponse } from "../helpers/factories";

const fetchAnalysisQuery = vi.fn();
const queryAnalysisMutation = vi.fn();

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    use: vi.fn().mockReturnValue({ id: "analysis-1" }),
  };
});

vi.mock("client/hooks/use-analysis", () => ({
  useAnalysis: () => ({
    fetchAnalysisQuery: fetchAnalysisQuery(),
    queryAnalysisMutation: queryAnalysisMutation(),
  }),
}));

vi.mock("reactflow", () => ({
  default: () => <div data-testid="react-flow" />,
  Background: () => null,
  Controls: () => null,
  MiniMap: () => null,
}));

import RepositoryPage from "client/app/repositories/[id]/page";

async function renderPage() {
  return render(<RepositoryPage params={Promise.resolve({ id: "analysis-1" })} />);
}

describe("RepositoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    queryAnalysisMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      data: undefined,
    });
  });

  it("shows loading skeletons while fetching", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    const { container } = await renderPage();

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows the error state and retries on click", async () => {
    const refetch = vi.fn();

    fetchAnalysisQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("not found"),
      refetch,
    });

    const user = userEvent.setup();
    await renderPage();

    expect(screen.getByText("Failed to load analysis")).toBeInTheDocument();

    await user.click(screen.getByText("Retry"));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("renders repository name, owner and truncated commit SHA in the header", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    await renderPage();

    expect(screen.getByText("express")).toBeInTheDocument();
    expect(screen.getByText(/expressjs/)).toBeInTheDocument();
    expect(screen.getAllByText(/abc1234/).length).toBeGreaterThan(0);
  });

  it("renders all six tabs", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    await renderPage();

    expect(screen.getByRole("button", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Modules" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entry Points" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Learning Paths" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Graph" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ask AI" })).toBeInTheDocument();
  });

  it("shows the four overview stat cards with correct counts", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    await renderPage();

    expect(screen.getByText("Total Files")).toBeInTheDocument();
    expect(screen.getAllByText("Modules").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Entry Points").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Learning Paths").length).toBeGreaterThan(0);
  });

  it("shows language stats with percentage bars", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    await renderPage();

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("shows the no-language-data message when languageStats is empty", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis({ languageStats: [] }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    await renderPage();

    expect(screen.getByText("No language data available.")).toBeInTheDocument();
  });

  it("switches to the Modules tab and expands a module to show its files", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole("button", { name: "Modules" }));

    expect(
      screen.getByText("Top-level folders detected as modules in this repository.")
    ).toBeInTheDocument();

    expect(screen.getByText("src")).toBeInTheDocument();
    expect(screen.getByText("2 files")).toBeInTheDocument();

    await user.click(screen.getByText("src"));

    expect(screen.getByText("src/index.ts")).toBeInTheDocument();
    expect(screen.getByText("src/auth.ts")).toBeInTheDocument();
  });

  it("shows the empty state on the Modules tab when there are no modules", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis({ modules: [] }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole("button", { name: "Modules" }));

    expect(screen.getByText("No modules detected")).toBeInTheDocument();
  });

  it("switches to the Entry Points tab and shows entries with their type badge", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole("button", { name: "Entry Points" }));

    expect(screen.getByText("src/index.ts")).toBeInTheDocument();
    expect(screen.getByText("Main entry point")).toBeInTheDocument();
    expect(screen.getByText("server")).toBeInTheDocument();
  });

  it("shows the empty state on Entry Points when there are none", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis({ entryPoints: [] }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole("button", { name: "Entry Points" }));

    expect(screen.getByText("No entry points detected")).toBeInTheDocument();
  });

  it("switches to the Learning Paths tab and shows ordered steps", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole("button", { name: "Learning Paths" }));

    expect(screen.getByText("Authentication flow")).toBeInTheDocument();
    expect(screen.getByText("How auth works")).toBeInTheDocument();
    expect(screen.getByText("src/auth.ts")).toBeInTheDocument();
    expect(screen.getByText("Auth entry point")).toBeInTheDocument();
  });

  it("shows the empty state on Learning Paths when there are none", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis({ learningPaths: [] }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole("button", { name: "Learning Paths" }));

    expect(screen.getByText("No learning paths generated")).toBeInTheDocument();
  });

  it("switches to the Graph tab and renders the React Flow canvas", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole("button", { name: "Graph" }));

    expect(screen.getByTestId("react-flow")).toBeInTheDocument();
  });

  it("shows the empty state on the Graph tab when there are no nodes", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis({ graph: { nodes: [], edges: [] } }),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole("button", { name: "Graph" }));

    expect(screen.getByText("No graph data available")).toBeInTheDocument();
  });

  it("switches to the Ask AI tab and renders the question input with example chips", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole("button", { name: "Ask AI" }));

    expect(screen.getByText("Ask about this codebase")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("How does authentication work?")).toBeInTheDocument();
    expect(screen.getByText("What are the main entry points?")).toBeInTheDocument();
  });

  it("fills the question input when an example chip is clicked", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole("button", { name: "Ask AI" }));
    await user.click(screen.getByText("What are the main entry points?"));

    expect(screen.getByPlaceholderText("How does authentication work?")).toHaveValue(
      "What are the main entry points?"
    );
  });

  it("submits a question and renders the explanation, files, and reading order", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);

    queryAnalysisMutation.mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
      data: mockQueryResponse(),
    });

    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole("button", { name: "Ask AI" }));

    const input = screen.getByPlaceholderText("How does authentication work?");
    await user.type(input, "How does authentication work?");

    await user.click(screen.getByRole("button", { name: /submit ai question/i }));

    expect(mutateAsync).toHaveBeenCalledWith("How does authentication work?");

    expect(
      screen.getByText("Authentication works through magic links and GitHub OAuth.")
    ).toBeInTheDocument();

    expect(screen.getAllByText("src/auth/auth.service.ts").length).toBeGreaterThan(0);
    expect(screen.getByText("Core auth logic")).toBeInTheDocument();
    expect(screen.getByText("Flow analysis")).toBeInTheDocument();
  });

  it("shows the pending state with skeleton lines while the AI query is running", async () => {
    queryAnalysisMutation.mockReturnValue({
      mutateAsync: vi.fn(() => new Promise(() => {})),
      isPending: true,
      isError: false,
      data: undefined,
    });

    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole("button", { name: "Ask AI" }));

    expect(screen.getByText("Analyzing codebase...")).toBeInTheDocument();
  });

  it("shows an error message when the AI query fails", async () => {
    queryAnalysisMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: true,
      data: undefined,
    });

    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole("button", { name: "Ask AI" }));

    expect(screen.getByText("Failed to get a response. Please try again.")).toBeInTheDocument();
  });

  it("disables the Ask AI submit button when the question field is empty", async () => {
    fetchAnalysisQuery.mockReturnValue({
      data: mockAnalysis(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    await renderPage();

    await user.click(screen.getByRole("button", { name: "Ask AI" }));

    expect(screen.getByRole("button", { name: /submit ai question/i })).toBeDisabled();
  });
});
