import "@testing-library/jest-dom/vitest";

import { vi } from "vitest";

export const mockRouter = { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() };
vi.mock("next/navigation", () => ({ __esModule: true, useRouter: () => mockRouter }));


