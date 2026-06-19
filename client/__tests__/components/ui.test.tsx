import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/react";
import { Button } from "client/components/ui/Button";
import { Loader } from "client/components/ui/Loader";
import { Skeleton } from "client/components/ui/Skeleton";
import { ErrorState } from "client/components/ui/ErrorState";

describe("Button", () => {
  it("renders children when not loading", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await user.click(screen.getByText("Click me"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("replaces children with the loader and loadingText while loading", () => {
    render(
      <Button loading loadingText="Working...">
        Click me
      </Button>
    );
    expect(screen.getByText("Working...")).toBeInTheDocument();
    expect(screen.queryByText("Click me")).not.toBeInTheDocument();
  });

  it("is disabled while loading", () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when the disabled prop is set", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders left and right icons alongside children", () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon" />}
        rightIcon={<span data-testid="right-icon" />}
      >
        Click me
      </Button>
    );
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });
});

describe("Loader", () => {
  it("renders the given text", () => {
    render(<Loader text="Loading data..." />);
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  it("renders without text when none is provided", () => {
    const { container } = render(<Loader />);
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });
});

describe("Skeleton", () => {
  it("renders with the animate-pulse class", () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    expect(container.firstChild).toHaveClass("animate-pulse");
    expect(container.firstChild).toHaveClass("h-4");
    expect(container.firstChild).toHaveClass("w-20");
  });
});

describe("ErrorState", () => {
  it("renders default title and description", () => {
    render(<ErrorState />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("An unexpected error occurred. Please try again later.")
    ).toBeInTheDocument();
  });

  it("renders custom title and description", () => {
    render(<ErrorState title="Failed to load" description="Try again shortly." />);
    expect(screen.getByText("Failed to load")).toBeInTheDocument();
    expect(screen.getByText("Try again shortly.")).toBeInTheDocument();
  });

  it("renders the action node when provided", () => {
    render(<ErrorState action={<button>Retry</button>} />);
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });
});
