import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import React from "react";

export const mockRouter = { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() };
vi.mock("next/navigation", () => ({ __esModule: true, useRouter: () => mockRouter }));

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ src = "", alt = "", ...rest }: any) => {
    const { priority, placeholder, blurDataURL, fill, loader, quality, sizes, ...imgProps } = rest;
    return React.createElement("img", { src, alt, ...imgProps });
  },
}));

vi.mock("@mui/icons-material", () => ({
  __esModule: true,
  Person: (p: any) => React.createElement("svg", { "data-testid": "icon-person", ...p }),
  Lock: (p: any) => React.createElement("svg", { "data-testid": "icon-lock", ...p }),
  Visibility: (p: any) => React.createElement("svg", { "data-testid": "icon-visibility", ...p }),
  VisibilityOff: (p: any) => React.createElement("svg", { "data-testid": "icon-visibilityoff", ...p }),
  default: {},
}));
