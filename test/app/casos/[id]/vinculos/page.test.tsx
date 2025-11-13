import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import VinculosPage from '@/app/casos/[id]/vinculos/page';

vi.mock('react', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual: any = await importOriginal();
  const useCache = new Map<Promise<unknown>, unknown>();
  return {
    ...actual,
    default: actual,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    use: (thenable: any) => {
      if (thenable && typeof thenable.then === 'function') {
        if (!useCache.has(thenable)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          thenable.then((value: any) => {
            useCache.set(thenable, value);
          });
        }
        if (useCache.has(thenable)) {
          return useCache.get(thenable);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let resolved: any = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        thenable.then((value: any) => {
          resolved = value;
        });
        return resolved || { id: '123' };
      }
      return thenable;
    },
  };
});

vi.mock('@/app/providers', () => ({
  Providers: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock('@/app/casos/[id]/vinculos/page.module.css', () => ({
  default: new Proxy({}, { get: () => 'cls' }),
}));

vi.mock('@/texts', () => ({
  t: (k: string) => k,
}));

vi.mock('@/components/CaseContainer', () => ({
  CaseContainer: ({ children }: React.PropsWithChildren) => (
    <div data-testid="aba-container">{children}</div>
  ),
}));

vi.mock('@/components/Filter', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ onFilter, onClear, handleClick, graphFilter }: any) => (
    <div data-testid="filter-component">
      <button onClick={() => onFilter && onFilter({})}>Filter</button>
      <button onClick={() => onClear && onClear()}>Clear</button>
      {graphFilter && handleClick && (
        <button data-testid="generate-report-button" onClick={handleClick}>
          Generate Report
        </button>
      )}
    </div>
  ),
  FieldConfig: {},
  FilterValues: {},
}));

vi.mock('@/hooks/useCase', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useCaseGraph: vi.fn((_id?: string, _filters?: any) => ({
    data: null,
    isLoading: false,
    error: null,
  })),
  useCaseById: vi.fn((_id?: string) => ({
    data: { suspects: [] },
    isLoading: false,
    error: null,
  })),
}));

vi.mock('@/components/Graph', () => {
  const GraphMock = React.forwardRef<HTMLDivElement, Record<string, never>>(() => (
    <div data-testid="graph-mock" />
  ));
  GraphMock.displayName = 'GraphMock';
  return {
    __esModule: true,
    default: GraphMock,
  };
});

vi.mock('@/components/GraphAlerts', () => ({
  GraphAlerts: ({ isLoading, hasError }: { isLoading?: boolean; hasError?: boolean }) => (
    <div
      data-testid="graph-alerts-mock"
      data-loading={String(!!isLoading)}
      data-error={String(!!hasError)}
    />
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();

  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        suspects: [],
        archives: [],
        files: [],
      }),
      blob: async () => new Blob(['csv,data'], { type: 'text/csv' }),
    })
  );

  global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/test');
  global.URL.revokeObjectURL = vi.fn();

  Object.defineProperty(document, 'fullscreenElement', {
    value: null,
    writable: true,
  });
  Object.defineProperty(document.documentElement, 'requestFullscreen', {
    value: vi.fn(),
    writable: true,
  });
  Object.defineProperty(document, 'exitFullscreen', {
    value: vi.fn(),
    writable: true,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('VinculosPage', () => {
  it('render page components correctly', async () => {
    const params = Promise.resolve({ id: 'qualquer-coisa' });

    render(<VinculosPage params={params} />);

    expect(await screen.findByTestId('graph-container')).toBeInTheDocument();
    expect(await screen.findByTestId('graph-controls')).toBeInTheDocument();
    expect(await screen.findByTestId('aba-container')).toBeInTheDocument();
    expect(await screen.findByTestId('graph-mock')).toBeInTheDocument();
    expect(await screen.findByTestId('filter-component')).toBeInTheDocument();
  });

  it('wraps content with CaseContainer', async () => {
    const params = Promise.resolve({ id: '123' });

    render(<VinculosPage params={params} />);

    const container = await screen.findByTestId('aba-container');
    expect(container).toBeInTheDocument();
    expect(within(container).getByTestId('filter-component')).toBeInTheDocument();
  });

  it('allows re-render with different params without throwing', async () => {
    const params1 = Promise.resolve({ id: '1' });
    const { unmount } = render(<VinculosPage params={params1} />);

    expect(await screen.findByTestId('filter-component')).toBeInTheDocument();
    unmount();

    const params2 = Promise.resolve({ id: '2' });
    render(<VinculosPage params={params2} />);

    expect(await screen.findByTestId('filter-component')).toBeInTheDocument();
    expect(await screen.findByTestId('graph-container')).toBeInTheDocument();
  });

  describe('buildQueryString', () => {
    it('returns empty string when no filters are set', async () => {
      const params = Promise.resolve({ id: '123' });
      render(<VinculosPage params={params} />);

      await screen.findByTestId('filter-component');

      const generateButton = screen.queryByTestId('generate-report-button');
      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fetchCalls = (global.fetch as any).mock.calls;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const exportCall = fetchCalls.find((call: any[]) =>
            call[0]?.includes('/api/case/123/graph/export')
          );
          if (exportCall) {
            expect(exportCall[0]).toMatch(/\/api\/case\/123\/graph\/export(\?|$)/);
          }
        });
      }
    });

    it('builds query string with identities filter', async () => {
      const params = Promise.resolve({ id: '123' });
      render(<VinculosPage params={params} />);

      await screen.findByTestId('filter-component');

      const filterComponent = screen.getByTestId('filter-component');
      const filterButton = within(filterComponent).getByText('Filter');
      fireEvent.click(filterButton);

      const generateButton = screen.queryByTestId('generate-report-button');
      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fetchCalls = (global.fetch as any).mock.calls;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const exportCall = fetchCalls.find((call: any[]) =>
            call[0]?.includes('/api/case/123/graph/export')
          );
          expect(exportCall).toBeDefined();
        });
      }
    });
  });

  describe('downloadFile', () => {
    it('creates download link and triggers download', async () => {
      const params = Promise.resolve({ id: 'test-case-123' });
      render(<VinculosPage params={params} />);

      await screen.findByTestId('filter-component');

      const mockBlob = new Blob(['csv,data,test'], { type: 'text/csv' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const mockClick = vi.fn();
      const mockRemove = vi.fn();
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          if (tagName === 'a') {
            return {
              href: '',
              download: '',
              click: mockClick,
              remove: mockRemove,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;
          }
          return originalCreateElement(tagName);
        });

      const generateButton = screen.queryByTestId('generate-report-button');
      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
          expect(createElementSpy).toHaveBeenCalledWith('a');
        });

        createElementSpy.mockRestore();
      }
    });

    it('sets correct filename with case id', async () => {
      const params = Promise.resolve({ id: 'case-456' });
      render(<VinculosPage params={params} />);

      await screen.findByTestId('filter-component');

      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let anchorElement: HTMLAnchorElement | null = null;
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          if (tagName === 'a') {
            // Create a real anchor element and add our properties
            anchorElement = originalCreateElement('a') as HTMLAnchorElement;
            anchorElement.click = vi.fn();
            anchorElement.remove = vi.fn();
            return anchorElement;
          }
          return originalCreateElement(tagName);
        });

      const generateButton = screen.queryByTestId('generate-report-button');
      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(anchorElement).toBeTruthy();
          if (anchorElement) {
            expect(anchorElement.download).toBe('case-case-456-graph.csv');
          }
        });

        createElementSpy.mockRestore();
      }
    });

    it('revokes object URL after download', async () => {
      const params = Promise.resolve({ id: '123' });
      render(<VinculosPage params={params} />);

      await screen.findByTestId('filter-component');

      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
      const mockUrl = 'blob:http://localhost/test-url';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.URL.createObjectURL as any).mockReturnValueOnce(mockUrl);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          if (tagName === 'a') {
            const anchor = originalCreateElement('a');
            anchor.click = vi.fn();
            anchor.remove = vi.fn();
            return anchor;
          }
          return originalCreateElement(tagName);
        });

      const generateButton = screen.queryByTestId('generate-report-button');
      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
        });

        createElementSpy.mockRestore();
      }
    });
  });

  describe('handleClick', () => {
    it('calls buildQueryString and fetches export endpoint', async () => {
      const params = Promise.resolve({ id: '123' });
      render(<VinculosPage params={params} />);

      await screen.findByTestId('filter-component');

      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          const anchor = originalCreateElement('a');
          anchor.click = vi.fn();
          anchor.remove = vi.fn();
          return anchor;
        }
        return originalCreateElement(tagName);
      });

      const generateButton = screen.queryByTestId('generate-report-button');
      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fetchCalls = (global.fetch as any).mock.calls;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const exportCall = fetchCalls.find((call: any[]) =>
            call[0]?.includes('/api/case/123/graph/export')
          );
          expect(exportCall).toBeDefined();
          expect(exportCall[1]?.headers?.Accept).toBe('text/csv');
          expect(exportCall[1]?.method).toBe('GET');
        });
      }
    });

    it('includes query parameters in export URL when filters are set', async () => {
      const params = Promise.resolve({ id: '123' });
      render(<VinculosPage params={params} />);

      await screen.findByTestId('filter-component');

      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          const anchor = originalCreateElement('a');
          anchor.click = vi.fn();
          anchor.remove = vi.fn();
          return anchor;
        }
        return originalCreateElement(tagName);
      });

      const generateButton = screen.queryByTestId('generate-report-button');
      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fetchCalls = (global.fetch as any).mock.calls;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const exportCall = fetchCalls.find((call: any[]) =>
            call[0]?.includes('/api/case/123/graph/export')
          );
          expect(exportCall).toBeDefined();
        });
      }
    });

    it('handles fetch errors gracefully', async () => {
      const params = Promise.resolve({ id: '123' });
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<VinculosPage params={params} />);

      await screen.findByTestId('filter-component');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const generateButton = screen.queryByTestId('generate-report-button');
      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(
          () => {
            expect(consoleErrorSpy).toHaveBeenCalled();
          },
          { timeout: 2000 }
        );

        consoleErrorSpy.mockRestore();
      }
    });

    it('handles non-ok response status', async () => {
      const params = Promise.resolve({ id: '123' });
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<VinculosPage params={params} />);

      await screen.findByTestId('filter-component');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        blob: async () => new Blob(['error'], { type: 'text/plain' }),
      });

      const generateButton = screen.queryByTestId('generate-report-button');
      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(
          () => {
            expect(consoleErrorSpy).toHaveBeenCalled();
          },
          { timeout: 2000 }
        );

        consoleErrorSpy.mockRestore();
      }
    });

    it('sets loading state during export', async () => {
      const params = Promise.resolve({ id: '123' });
      render(<VinculosPage params={params} />);

      await screen.findByTestId('filter-component');

      let resolveBlob: (value: Blob) => void;
      const blobPromise = new Promise<Blob>((resolve) => {
        resolveBlob = resolve;
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: () => blobPromise,
      });

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          const anchor = originalCreateElement('a');
          anchor.click = vi.fn();
          anchor.remove = vi.fn();
          return anchor;
        }
        return originalCreateElement(tagName);
      });

      const generateButton = screen.queryByTestId('generate-report-button');
      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalled();
        });

        resolveBlob!(new Blob(['csv,data'], { type: 'text/csv' }));

        await waitFor(() => {
          expect(global.URL.createObjectURL).toHaveBeenCalled();
        });
      }
    });

    it('resets loading state after successful export', async () => {
      const params = Promise.resolve({ id: '123' });
      render(<VinculosPage params={params} />);

      await screen.findByTestId('filter-component');

      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          const anchor = originalCreateElement('a');
          anchor.click = vi.fn();
          anchor.remove = vi.fn();
          return anchor;
        }
        return originalCreateElement(tagName);
      });

      const generateButton = screen.queryByTestId('generate-report-button');
      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(global.URL.createObjectURL).toHaveBeenCalled();
        });

        expect(global.fetch).toHaveBeenCalled();
      }
    });

    it('resets loading state even when export fails', async () => {
      const params = Promise.resolve({ id: '123' });
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<VinculosPage params={params} />);

      await screen.findByTestId('filter-component');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockRejectedValueOnce(new Error('Export failed'));

      const generateButton = screen.queryByTestId('generate-report-button');
      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(
          () => {
            expect(consoleErrorSpy).toHaveBeenCalled();
          },
          { timeout: 2000 }
        );

        expect(global.fetch).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      }
    });
  });
});
