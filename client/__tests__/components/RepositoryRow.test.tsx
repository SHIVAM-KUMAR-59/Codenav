import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import RepositoryRow from "client/components/dashboard/RepositoryRow";
import { mockRepository, mockAnalysis } from "../helpers/factories";

describe("RepositoryRow", () => {
  it("renders the repository name and owner/branch line", () => {
    const repo = mockRepository({ analyses: [mockAnalysis()] });
    render(<RepositoryRow repo={repo} />);

    expect(screen.getByText("express")).toBeInTheDocument();
    expect(screen.getByText(/expressjs/)).toBeInTheDocument();
    expect(screen.getByText(/master/)).toBeInTheDocument();
  });

  it("shows the commit SHA truncated to 7 characters", () => {
    const repo = mockRepository({ latestCommitSha: "abc1234567890", analyses: [mockAnalysis()] });
    render(<RepositoryRow repo={repo} />);
    expect(screen.getByText(/abc1234\b/)).toBeInTheDocument();
  });

  it("shows the COMPLETED status badge with its check icon state", () => {
    const repo = mockRepository({ analyses: [mockAnalysis({ status: "COMPLETED" })] });
    render(<RepositoryRow repo={repo} />);
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
  });

  it("shows the FAILED status badge", () => {
    const repo = mockRepository({ analyses: [mockAnalysis({ status: "FAILED" })] });
    render(<RepositoryRow repo={repo} />);
    expect(screen.getByText("FAILED")).toBeInTheDocument();
  });

  it("shows PENDING when there is no analysis yet", () => {
    const repo = mockRepository({ analyses: [] });
    render(<RepositoryRow repo={repo} />);
    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.textContent === "Last analyzed: Not analyzed yet")
    ).toBeInTheDocument();
  });

  it("links the Open button to the latest analysis id", () => {
    const repo = mockRepository({ analyses: [mockAnalysis({ id: "analysis-99" })] });
    render(<RepositoryRow repo={repo} />);
    const link = screen.getByText("Open").closest("a");
    expect(link).toHaveAttribute("href", "/repositories/analysis-99");
  });

  it("shows the last analyzed timestamp when an analysis exists", () => {
    const repo = mockRepository({ analyses: [mockAnalysis()] });
    render(<RepositoryRow repo={repo} />);
    expect(screen.getByText(/Last analyzed:/)).toBeInTheDocument();
  });
});
