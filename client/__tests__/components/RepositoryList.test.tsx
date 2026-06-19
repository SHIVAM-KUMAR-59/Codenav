import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RepositoryList from "client/components/dashboard/RepositoryList";
import { mockRepository, mockAnalysis } from "../helpers/factories";

describe("RepositoryList", () => {
  it("renders skeleton rows while loading", () => {
    const { container } = render(<RepositoryList repositories={[]} loading={true} />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders the error state and wires the retry action", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <RepositoryList
        repositories={[]}
        loading={false}
        error={new Error("fail")}
        onRetry={onRetry}
      />
    );

    expect(screen.getByText("Failed to load repositories")).toBeInTheDocument();
    await user.click(screen.getByText("Try Again"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders the empty state with a call to action", () => {
    render(<RepositoryList repositories={[]} loading={false} />);
    expect(screen.getByText("No repositories analyzed yet")).toBeInTheDocument();
    expect(screen.getByText("Analyze your first repository").closest("a")).toHaveAttribute(
      "href",
      "/dashboard/new"
    );
  });

  it("renders one row per repository", () => {
    const repos = [
      mockRepository({ analyses: [mockAnalysis()] }),
      mockRepository({ id: "repo-2", name: "fastify", analyses: [mockAnalysis({ id: "a-2" })] }),
    ];
    render(<RepositoryList repositories={repos} loading={false} />);

    expect(screen.getByText("express")).toBeInTheDocument();
    expect(screen.getByText("fastify")).toBeInTheDocument();
  });
});
