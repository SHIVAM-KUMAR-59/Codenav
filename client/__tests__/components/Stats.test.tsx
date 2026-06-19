import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import Stats from "client/components/dashboard/Stats";
import { mockRepository, mockAnalysis } from "../helpers/factories";

describe("Stats", () => {
  it("shows skeletons while loading", () => {
    const { container } = render(<Stats repositories={[]} loading={true} />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows zero for every metric with no repositories", () => {
    render(<Stats repositories={[]} loading={false} />);
    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(3);
  });

  it("counts total repositories correctly", () => {
    const repos = [
      mockRepository({ analyses: [mockAnalysis({ status: "COMPLETED" })] }),
      mockRepository({ id: "repo-2", analyses: [mockAnalysis({ id: "a-2", status: "FAILED" })] }),
    ];
    render(<Stats repositories={repos} loading={false} />);
    expect(screen.getByText("Total Repositories")).toBeInTheDocument();
  });

  it("counts completed repositories correctly", () => {
    const repos = [
      mockRepository({ analyses: [mockAnalysis({ status: "COMPLETED" })] }),
      mockRepository({
        id: "repo-2",
        analyses: [mockAnalysis({ id: "a-2", status: "COMPLETED" })],
      }),
      mockRepository({ id: "repo-3", analyses: [mockAnalysis({ id: "a-3", status: "FAILED" })] }),
    ];
    render(<Stats repositories={repos} loading={false} />);

    const completedLabel = screen.getByText("Completed");
    const completedValue = completedLabel.parentElement?.querySelector("h2");
    expect(completedValue?.textContent).toBe("2");
  });

  it("counts in-progress repositories across QUEUED, CLONING, and PENDING", () => {
    const repos = [
      mockRepository({ analyses: [mockAnalysis({ status: "QUEUED" })] }),
      mockRepository({ id: "repo-2", analyses: [mockAnalysis({ id: "a-2", status: "CLONING" })] }),
      mockRepository({ id: "repo-3", analyses: [mockAnalysis({ id: "a-3", status: "PENDING" })] }),
      mockRepository({ id: "repo-4", analyses: [mockAnalysis({ id: "a-4", status: "FAILED" })] }),
    ];
    render(<Stats repositories={repos} loading={false} />);

    const inProgressLabel = screen.getByText("In Progress");
    const inProgressValue = inProgressLabel.parentElement?.querySelector("h2");
    expect(inProgressValue?.textContent).toBe("3");
  });
});
