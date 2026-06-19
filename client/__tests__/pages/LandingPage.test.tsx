import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import LandingPage from "client/app/page";

describe("LandingPage", () => {
  it("renders the navbar and footer brand name", () => {
    render(<LandingPage />);
    expect(screen.getAllByText("Codenav").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the hero headline and primary CTAs", () => {
    render(<LandingPage />);
    expect(
      screen.getByText("Understand repositories without getting lost in the files.")
    ).toBeInTheDocument();

    expect(screen.getByText("Start analyzing").closest("a")).toHaveAttribute("href", "/auth");
    expect(screen.getByText("See how it works").closest("a")).toHaveAttribute(
      "href",
      "#how-it-works"
    );
  });

  it("renders all four feature cards", () => {
    render(<LandingPage />);
    expect(screen.getByText("Repository understanding")).toBeInTheDocument();
    expect(screen.getByText("Ask AI about the code")).toBeInTheDocument();
    expect(screen.getByText("Generated learning paths")).toBeInTheDocument();
    expect(screen.getByText("Dependency graph")).toBeInTheDocument();
  });

  it("renders the three how-it-works steps", () => {
    render(<LandingPage />);
    expect(screen.getByText("Paste a public GitHub repository URL")).toBeInTheDocument();
    expect(
      screen.getByText("Codenav analyzes structure, files, modules, and graph")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Explore tabs or ask AI questions about the codebase")
    ).toBeInTheDocument();
  });

  it("renders the why-use-it reasons", () => {
    render(<LandingPage />);
    expect(screen.getByText("Onboard faster to large repositories")).toBeInTheDocument();
    expect(screen.getByText("Contribute to open source with more confidence")).toBeInTheDocument();
  });

  it("renders the closing CTA section linking to /auth", () => {
    render(<LandingPage />);
    expect(
      screen.getByText("Stop opening random files. Start navigating with intent.")
    ).toBeInTheDocument();
    expect(screen.getByText("Try Codenav").closest("a")).toHaveAttribute("href", "/auth");
  });

  it("renders the footer with a sign-in link and the current year", () => {
    render(<LandingPage />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();

    const signInLinks = screen.getAllByText("Sign in");
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
    signInLinks.forEach((link) => {
      expect(link.closest("a")).toHaveAttribute("href", "/auth");
    });
  });
});
