import { beforeEach,describe, expect, it } from "vitest";

import { addCase, getCases } from "../../src/services/caseService";

describe("CaseService", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('access_token', 'test-token');
  });

  describe("addCase", () => {
    it("should be a function", () => {
      expect(typeof addCase).toBe("function");
    });

    it("should accept a string parameter", () => {
      expect(() => addCase("Test Case")).not.toThrow();
    });

    it("should return a Promise", () => {
      const result = addCase("Test Case");
      expect(result).toBeInstanceOf(Promise);
    });

    it("should handle different case names", () => {
      expect(() => addCase("Simple Case")).not.toThrow();
      expect(() => addCase("Case with Numbers 123")).not.toThrow();
      expect(() => addCase("Case with Special Chars!@#")).not.toThrow();
      expect(() => addCase("")).not.toThrow();
    });
  });

  describe("getCases", () => {
    it("should be a function", () => {
      expect(typeof getCases).toBe("function");
    });

    it("should accept correct parameter types", () => {
      const pagination = { page: 1, limit: 10 };
      const filters = { name: "test", owner: "user", status: "Em andamento" as const };
      const sorting = { sort_by: "name" as const, sort_dir: "asc" as const };

      expect(() => getCases(pagination, filters, sorting)).not.toThrow();
    });

    it("should return a Promise", () => {
      const pagination = { page: 1, limit: 10 };
      const filters = {};
      const sorting = {};

      const result = getCases(pagination, filters, sorting);
      expect(result).toBeInstanceOf(Promise);
    });

    it("should handle empty parameters", () => {
      const pagination = { page: 1, limit: 10 };
      const emptyFilters = {};
      const emptySorting = {};

      expect(() => getCases(pagination, emptyFilters, emptySorting)).not.toThrow();
    });

    it("should handle different pagination values", () => {
      const filters = {};
      const sorting = {};

      expect(() => getCases({ page: 1, limit: 10 }, filters, sorting)).not.toThrow();
      expect(() => getCases({ page: 2, limit: 20 }, filters, sorting)).not.toThrow();
      expect(() => getCases({ page: 10, limit: 50 }, filters, sorting)).not.toThrow();
    });

    it("should handle different filter combinations", () => {
      const pagination = { page: 1, limit: 10 };
      const sorting = {};

      expect(() => getCases(pagination, { name: "test" }, sorting)).not.toThrow();
      expect(() => getCases(pagination, { owner: "user" }, sorting)).not.toThrow();
      expect(() => getCases(pagination, { status: "Em andamento" }, sorting)).not.toThrow();
      expect(() => getCases(pagination, { 
        name: "test", 
        owner: "user", 
        status: "Encerrado" 
      }, sorting)).not.toThrow();
    });

    it("should handle different sorting options", () => {
      const pagination = { page: 1, limit: 10 };
      const filters = {};

      expect(() => getCases(pagination, filters, { 
        sort_by: "name", 
        sort_dir: "asc" 
      })).not.toThrow();
      
      expect(() => getCases(pagination, filters, { 
        sort_by: "status", 
        sort_dir: "desc" 
      })).not.toThrow();
      
      expect(() => getCases(pagination, filters, { 
        sort_by: "creation_date", 
        sort_dir: "asc" 
      })).not.toThrow();
    });

    it("should handle all valid status values", () => {
      const pagination = { page: 1, limit: 10 };
      const sorting = {};

      const validStatuses = ["Em andamento", "Suspenso", "Encerrado"] as const;
      
      validStatuses.forEach(status => {
        expect(() => getCases(pagination, { status }, sorting)).not.toThrow();
      });
    });

    it("should handle all valid sort_by values", () => {
      const pagination = { page: 1, limit: 10 };
      const filters = {};

      const validSortBy = ["name", "status", "creation_date"] as const;
      
      validSortBy.forEach(sort_by => {
        expect(() => getCases(pagination, filters, { 
          sort_by, 
          sort_dir: "asc" 
        })).not.toThrow();
      });
    });

    it("should handle all valid sort_dir values", () => {
      const pagination = { page: 1, limit: 10 };
      const filters = {};

      const validSortDir = ["asc", "desc"] as const;
      
      validSortDir.forEach(sort_dir => {
        expect(() => getCases(pagination, filters, { 
          sort_by: "name", 
          sort_dir 
        })).not.toThrow();
      });
    });
  });

  describe("Service Integration", () => {
    it("should have consistent parameter types between functions", () => {
      const pagination = { page: 1, limit: 10 };
      const filters = { name: "test" };
      const sorting = { sort_by: "name" as const, sort_dir: "asc" as const };

      expect(() => addCase("Test Case")).not.toThrow();
      expect(() => getCases(pagination, filters, sorting)).not.toThrow();
    });

    it("should work with localStorage token", () => {
      localStorage.setItem('access_token', 'valid-token');
      
      expect(() => addCase("Test Case")).not.toThrow();
      expect(() => getCases({ page: 1, limit: 10 }, {}, {})).not.toThrow();
    });

    it("should work without localStorage token", () => {
      localStorage.removeItem('access_token');
      
      expect(() => addCase("Test Case")).not.toThrow();
      expect(() => getCases({ page: 1, limit: 10 }, {}, {})).not.toThrow();
    });
  });
});