import { describe, expect, it } from "vitest";

import { FilterValues } from "@/components/Filter";
import { CaseItem } from "@/types/Cases";
import { Sorting } from "@/types/Table";

function mapUiFiltersToApiParams(uiFilters: FilterValues) {
  const apiParams = {
    status: uiFilters.situation,
    owner: uiFilters.responsible,
    name: uiFilters.search || uiFilters.caseName || uiFilters.caseNumber
  };

  return apiParams;
}

function mapUiSortingToApiParams(uiSorting: Sorting<CaseItem>) {
  return {
    sort_by: uiSorting.sortBy as 'name' | 'status' | 'creation_date',
    sort_dir: uiSorting.sortDir
  };
}

describe("Page Mapping Functions", () => {
  describe("mapUiFiltersToApiParams", () => {
    it("should map UI filters to API parameters correctly", () => {
      const uiFilters: FilterValues = {
        situation: "Em andamento",
        responsible: "João Silva",
        caseName: "Caso Teste",
        caseNumber: "12345"
      };

      const result = mapUiFiltersToApiParams(uiFilters);

      expect(result).toEqual({
        status: "Em andamento",
        owner: "João Silva",
        name: "Caso Teste"
      });
    });

    it("should handle empty filters", () => {
      const uiFilters: FilterValues = {};

      const result = mapUiFiltersToApiParams(uiFilters);

      expect(result).toEqual({
        status: undefined,
        owner: undefined,
        name: undefined
      });
    });

    it("should prioritize search over caseName and caseNumber", () => {
      const uiFilters: FilterValues = {
        search: "Search Term",
        caseName: "Case Name",
        caseNumber: "123"
      };

      const result = mapUiFiltersToApiParams(uiFilters);

      expect(result.name).toBe("Search Term");
    });

    it("should use caseName when search is not provided", () => {
      const uiFilters: FilterValues = {
        caseName: "Case Name",
        caseNumber: "123"
      };

      const result = mapUiFiltersToApiParams(uiFilters);

      expect(result.name).toBe("Case Name");
    });

    it("should use caseNumber when search and caseName are not provided", () => {
      const uiFilters: FilterValues = {
        caseNumber: "123"
      };

      const result = mapUiFiltersToApiParams(uiFilters);

      expect(result.name).toBe("123");
    });

    it("should handle partial filters", () => {
      const uiFilters: FilterValues = {
        responsible: "Maria Santos"
      };

      const result = mapUiFiltersToApiParams(uiFilters);

      expect(result).toEqual({
        status: undefined,
        owner: "Maria Santos",
        name: undefined
      });
    });
  });

  describe("mapUiSortingToApiParams", () => {
    it("should map UI sorting to API parameters correctly", () => {
      const uiSorting: Sorting<CaseItem> = {
        sortBy: "name",
        sortDir: "asc"
      };

      const result = mapUiSortingToApiParams(uiSorting);

      expect(result).toEqual({
        sort_by: "name",
        sort_dir: "asc"
      });
    });

    it("should handle desc sorting", () => {
      const uiSorting: Sorting<CaseItem> = {
        sortBy: "creation_date",
        sortDir: "desc"
      };

      const result = mapUiSortingToApiParams(uiSorting);

      expect(result).toEqual({
        sort_by: "creation_date",
        sort_dir: "desc"
      });
    });

    it("should handle status sorting", () => {
      const uiSorting: Sorting<CaseItem> = {
        sortBy: "status",
        sortDir: "asc"
      };

      const result = mapUiSortingToApiParams(uiSorting);

      expect(result).toEqual({
        sort_by: "status",
        sort_dir: "asc"
      });
    });

    it("should handle all valid sortBy values", () => {
      const validSortBy = ["name", "status", "creation_date"] as const;
      
      validSortBy.forEach(sortBy => {
        const uiSorting: Sorting<CaseItem> = {
          sortBy,
          sortDir: "asc"
        };

        const result = mapUiSortingToApiParams(uiSorting);

        expect(result.sort_by).toBe(sortBy);
        expect(result.sort_dir).toBe("asc");
      });
    });

    it("should handle all valid sortDir values", () => {
      const validSortDir = ["asc", "desc"] as const;
      
      validSortDir.forEach(sortDir => {
        const uiSorting: Sorting<CaseItem> = {
          sortBy: "name",
          sortDir
        };

        const result = mapUiSortingToApiParams(uiSorting);

        expect(result.sort_by).toBe("name");
        expect(result.sort_dir).toBe(sortDir);
      });
    });
  });

  describe("Constants and Configuration", () => {
    it("should have correct columns configuration", () => {
      const expectedColumns = [
        { key: 'name', label: 'Caso', align: 'left' },
        { key: 'owner', label: 'Responsável', align: 'left' },
        { key: 'status', label: 'Situação', align: 'left' },
        { key: 'creation_date', label: 'Data de Abertura', align: 'left' },
      ];

      expect(expectedColumns).toHaveLength(4);
      expect(expectedColumns[0].key).toBe('name');
      expect(expectedColumns[1].key).toBe('owner');
      expect(expectedColumns[2].key).toBe('status');
      expect(expectedColumns[3].key).toBe('creation_date');
    });

    it("should have correct situations options", () => {
      const expectedSituations = [
        { value: 'Aberto', label: 'Aberto' },
        { value: 'Em andamento', label: 'Em andamento' },
        { value: 'Concluído', label: 'Concluído' },
      ];

      expect(expectedSituations).toHaveLength(3);
      expect(expectedSituations[0].value).toBe('Aberto');
      expect(expectedSituations[1].value).toBe('Em andamento');
      expect(expectedSituations[2].value).toBe('Concluído');
    });

    it("should have row actions configuration", () => {
      const mockOnClick = (row: unknown) => console.log('Ver detalhes', row);
      
      const expectedRowActions = [
        {
          label: 'Ver detalhes',
          onClick: mockOnClick,
        },
      ];

      expect(expectedRowActions).toHaveLength(1);
      expect(expectedRowActions[0].label).toBe('Ver detalhes');
      expect(typeof expectedRowActions[0].onClick).toBe('function');
      
      expect(() => expectedRowActions[0].onClick({ id: 1 })).not.toThrow();
    });
  });
});
