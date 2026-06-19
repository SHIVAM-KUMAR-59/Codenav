import "@testing-library/jest-dom";
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import React from "react";

afterEach(() => {
  cleanup();
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({ id: "analysis-1" }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    return React.createElement("img", props);
  },
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => React.createElement("a", { href, ...props }, children),
}));

vi.mock("reactflow", () => ({
  default: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "react-flow" }, children),
  Background: () => React.createElement("div", { "data-testid": "rf-background" }),
  Controls: () => React.createElement("div", { "data-testid": "rf-controls" }),
  MiniMap: () => React.createElement("div", { "data-testid": "rf-minimap" }),
}));

vi.mock("client/lib/api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
  tokenStore: {
    get: vi.fn().mockReturnValue("mock-access-token"),
    set: vi.fn(),
  },
}));

global.EventSource = vi.fn().mockImplementation(() => ({
  onmessage: null,
  onerror: null,
  close: vi.fn(),
})) as unknown as typeof EventSource;

Object.defineProperty(window, "crypto", {
  value: { randomUUID: () => Math.random().toString(36).slice(2) },
});

vi.spyOn(console, "error").mockImplementation(() => {});
