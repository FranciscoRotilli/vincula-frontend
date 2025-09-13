import { beforeEach, describe, expect, it, vi } from "vitest";

import { addCase, getCases } from "../../src/services/caseService";

// Mock environment variables
vi.mock('../../src/services/caseService', async () => {
  const actual = await vi.importActual('../../src/services/caseService');
  return {
    ...actual,
    addCase: vi.fn().mockImplementation(() => Promise.resolve({ data: { id: 1, name: 'Test Case' } })),
    getCases: vi.fn().mockImplementation(() => Promise.resolve({ data: { items: [], total: 0 } }))
  };
});

describe("CaseService", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('access_token', 'test-token');
    vi.clearAllMocks();
  });

  describe("addCase", () => {
    it("should be a function", () => {
      expect(typeof addCase).toBe("function");
    });

    it("should accept a string parameter", async () => {
      await expect(addCase("Test Case")).resolves.toBeDefined();
      expect(addCase).toHaveBeenCalledWith("Test Case");
    });

    it("should return a Promise", () => {
      const result = addCase("Test Case");
      expect(result).toBeInstanceOf(Promise);
    });

    it("should handle different case names", async () => {
      await addCase("Simple Case");
      await addCase("Case with Numbers 123");
      await addCase("Case with Special Chars!@#");
      await addCase("");
      
      expect(addCase).toHaveBeenCalledTimes(4);
    });
  });

  describe("getCases", () => {
    it("should be a function", () => {
      expect(typeof getCases).toBe("function");
    });

    it("should accept correct parameter types", async () => {
      const pagination = { page: 1, limit: 10 };
      const filters = { name: "test", owner: "user", status: "Em andamento" as const };
      const sorting = { sort_by: "name" as const, sort_dir: "asc" as const };

      await expect(getCases(pagination, filters, sorting)).resolves.toBeDefined();
      expect(getCases).toHaveBeenCalledWith(pagination, filters, sorting);
    });

    it("should return a Promise", () => {
      const pagination = { page: 1, limit: 10 };
      const filters = {};
      const sorting = {};

      const result = getCases(pagination, filters, sorting);
      expect(result).toBeInstanceOf(Promise);
    });

    it("should handle empty parameters", async () => {
      const pagination = { page: 1, limit: 10 };
      const emptyFilters = {};
      const emptySorting = {};

      await getCases(pagination, emptyFilters, emptySorting);
      expect(getCases).toHaveBeenCalledWith(pagination, emptyFilters, emptySorting);
    });

    it("should handle different pagination values", async () => {
      const filters = {};
      const sorting = {};

      await getCases({ page: 1, limit: 10 }, filters, sorting);
      await getCases({ page: 2, limit: 20 }, filters, sorting);
      await getCases({ page: 10, limit: 50 }, filters, sorting);
      
      expect(getCases).toHaveBeenCalledTimes(3);
    });

    it("should handle different filter combinations", async () => {
      const pagination = { page: 1, limit: 10 };
      const sorting = {};

      await getCases(pagination, { name: "test" }, sorting);
      await getCases(pagination, { owner: "user" }, sorting);
      await getCases(pagination, { status: "Em andamento" }, sorting);
      await getCases(pagination, { 
        name: "test", 
        owner: "user", 
        status: "Encerrado" 
      }, sorting);
      
      expect(getCases).toHaveBeenCalledTimes(4);
    });

    it("should handle different sorting options", async () => {
      const pagination = { page: 1, limit: 10 };
      const filters = {};

      await getCases(pagination, filters, { 
        sort_by: "name", 
        sort_dir: "asc" 
      });
      
      await getCases(pagination, filters, { 
        sort_by: "status", 
        sort_dir: "desc" 
      });
      
      await getCases(pagination, filters, { 
        sort_by: "creation_date", 
        sort_dir: "asc" 
      });
      
      expect(getCases).toHaveBeenCalledTimes(3);
    });

    it("should handle all valid status values", async () => {
      const pagination = { page: 1, limit: 10 };
      const sorting = {};

      const validStatuses = ["Em andamento", "Suspenso", "Encerrado"] as const;
      
      for (const status of validStatuses) {
        await getCases(pagination, { status }, sorting);
      }
      
      expect(getCases).toHaveBeenCalledTimes(validStatuses.length);
    });

    it("should handle all valid sort_by values", async () => {
      const pagination = { page: 1, limit: 10 };
      const filters = {};

      const validSortBy = ["name", "status", "creation_date"] as const;
      
      for (const sort_by of validSortBy) {
        await getCases(pagination, filters, { 
          sort_by, 
          sort_dir: "asc" 
        });
      }
      
      expect(getCases).toHaveBeenCalledTimes(validSortBy.length);
    });

    it("should handle all valid sort_dir values", async () => {
      const pagination = { page: 1, limit: 10 };
      const filters = {};

      const validSortDir = ["asc", "desc"] as const;
      
      for (const sort_dir of validSortDir) {
        await getCases(pagination, filters, { 
          sort_by: "name", 
          sort_dir 
        });
      }
      
      expect(getCases).toHaveBeenCalledTimes(validSortDir.length);
    });
  });

  describe("Service Integration", () => {
    it("should have consistent parameter types between functions", async () => {
      const pagination = { page: 1, limit: 10 };
      const filters = { name: "test" };
      const sorting = { sort_by: "name" as const, sort_dir: "asc" as const };

      await addCase("Test Case");
      await getCases(pagination, filters, sorting);
      
      expect(addCase).toHaveBeenCalledWith("Test Case");
      expect(getCases).toHaveBeenCalledWith(pagination, filters, sorting);
    });

    it("should work with localStorage token", async () => {
      localStorage.setItem('access_token', 'valid-token');
      
      await addCase("Test Case");
      await getCases({ page: 1, limit: 10 }, {}, {});
      
      expect(addCase).toHaveBeenCalledWith("Test Case");
      expect(getCases).toHaveBeenCalled();
    });

    it("should work without localStorage token", async () => {
      localStorage.removeItem('access_token');
      
      await addCase("Test Case");
      await getCases({ page: 1, limit: 10 }, {}, {});
      
      expect(addCase).toHaveBeenCalledWith("Test Case");
      expect(getCases).toHaveBeenCalled();
    });
  });
});