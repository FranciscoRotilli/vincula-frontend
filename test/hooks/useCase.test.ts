import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import React from "react";
import { beforeEach,describe, expect, it } from "vitest";

import { useCase, useCases } from "@/hooks/useCase";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return Wrapper;
};

describe("useCase Hook", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('access_token', 'mock-token');
  });

  it("should initialize correctly", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCase(), { wrapper });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it("should have mutate function available", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCase(), { wrapper });

    expect(typeof result.current.mutate).toBe("function");
    expect(typeof result.current.mutateAsync).toBe("function");
  });

  it("should handle mutation parameters correctly", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCase(), { wrapper });

    expect(() => {
      result.current.mutate({ name: "Test Case" });
    }).not.toThrow();
  });
});

describe("useCases Hook", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('access_token', 'mock-token');
  });

  it("should initialize with correct parameters", () => {
    const wrapper = createWrapper();
    const pagination = { page: 1, limit: 10 };
    const filters = { name: "test", owner: "user", status: "Em andamento" as const };
    const sorting = { sort_by: "name" as const, sort_dir: "asc" as const };

    const { result } = renderHook(
      () => useCases(pagination, filters, sorting),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("should handle different pagination parameters", () => {
    const wrapper = createWrapper();
    const pagination1 = { page: 1, limit: 10 };
    const pagination2 = { page: 2, limit: 20 };
    const filters = {};
    const sorting = {};

    const { result: result1 } = renderHook(
      () => useCases(pagination1, filters, sorting),
      { wrapper }
    );

    const { result: result2 } = renderHook(
      () => useCases(pagination2, filters, sorting),
      { wrapper }
    );

    expect(result1.current.isLoading).toBe(true);
    expect(result2.current.isLoading).toBe(true);
  });

  it("should handle different filter parameters", () => {
    const wrapper = createWrapper();
    const pagination = { page: 1, limit: 10 };
    const filters1 = { name: "caso1" };
    const filters2 = { owner: "user1" };
    const sorting = {};

    const { result: result1 } = renderHook(
      () => useCases(pagination, filters1, sorting),
      { wrapper }
    );

    const { result: result2 } = renderHook(
      () => useCases(pagination, filters2, sorting),
      { wrapper }
    );

    expect(result1.current.isLoading).toBe(true);
    expect(result2.current.isLoading).toBe(true);
  });

  it("should handle different sorting parameters", () => {
    const wrapper = createWrapper();
    const pagination = { page: 1, limit: 10 };
    const filters = {};
    const sorting1 = { sort_by: "name" as const, sort_dir: "asc" as const };
    const sorting2 = { sort_by: "creation_date" as const, sort_dir: "desc" as const };

    const { result: result1 } = renderHook(
      () => useCases(pagination, filters, sorting1),
      { wrapper }
    );

    const { result: result2 } = renderHook(
      () => useCases(pagination, filters, sorting2),
      { wrapper }
    );

    expect(result1.current.isLoading).toBe(true);
    expect(result2.current.isLoading).toBe(true);
  });

  it("should have refetch function available", () => {
    const wrapper = createWrapper();
    const pagination = { page: 1, limit: 10 };
    const filters = {};
    const sorting = {};

    const { result } = renderHook(
      () => useCases(pagination, filters, sorting),
      { wrapper }
    );

    expect(typeof result.current.refetch).toBe("function");
  });

  it("should handle query key changes", () => {
    const wrapper = createWrapper();
    let pagination = { page: 1, limit: 10 };
    const filters = {};
    const sorting = {};

    const { result, rerender } = renderHook(
      () => useCases(pagination, filters, sorting),
      { wrapper }
    );

    pagination = { page: 2, limit: 10 };
    rerender();

    expect(result.current.isLoading).toBe(true);
  });

  it("should handle empty parameters", () => {
    const wrapper = createWrapper();
    const pagination = { page: 1, limit: 10 };
    const filters = {};
    const sorting = {};

    const { result } = renderHook(
      () => useCases(pagination, filters, sorting),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(true);
    expect(typeof result.current.refetch).toBe("function");
  });
});
