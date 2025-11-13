/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';

vi.mock('@/lib/backend', () => ({
  apiFetch: vi.fn(),
}));
const { apiFetch } = await import('@/lib/backend');

describe('API /case/[caseId]/graph/export GET route', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls apiFetch with correct URL, search params, and Accept header', async () => {
    const csvContent = 'id,name,type\n1,Node A,person\n2,Node B,company';
    const mockResponse = new Response(csvContent, {
      status: 200,
      headers: { 'content-type': 'text/csv' },
    });

    (apiFetch as unknown as MockedFunction<typeof apiFetch>).mockResolvedValueOnce(mockResponse);

    const { GET } = await import('@/app/api/case/[caseId]/graph/export/route');

    const url = new URL('http://localhost/api/case/case-123/graph/export?filter=active&limit=100');
    const nextReq = { nextUrl: url } as NextRequest;
    const params = Promise.resolve({ caseId: 'case-123' });

    const res = await GET(nextReq, { params } as any);

    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledWith('/case/case-123/graph/export?filter=active&limit=100', {
      method: 'GET',
      headers: { Accept: 'text/csv' },
    });

    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(200);
  });

  it('returns CSV response with proper headers on success', async () => {
    const csvContent = 'id,name,type\n1,Node A,person\n2,Node B,company';
    const mockResponse = new Response(csvContent, {
      status: 200,
      headers: { 'content-type': 'text/csv' },
    });

    (apiFetch as unknown as MockedFunction<typeof apiFetch>).mockResolvedValueOnce(mockResponse);

    const { GET } = await import('@/app/api/case/[caseId]/graph/export/route');

    const url = new URL('http://localhost/api/case/case-456/graph/export');
    const nextReq = { nextUrl: url } as NextRequest;
    const params = Promise.resolve({ caseId: 'case-456' });

    const res = await GET(nextReq, { params } as any);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(res.headers.get('Content-Disposition')).toBe(
      'attachment; filename="case-case-456-graph.csv"'
    );

    const body = await res.text();
    expect(body).toBe(csvContent);
  });

  it('includes search params in apiFetch call when present', async () => {
    const csvContent = 'id,name\n1,Test';
    const mockResponse = new Response(csvContent, { status: 200 });

    (apiFetch as unknown as MockedFunction<typeof apiFetch>).mockResolvedValueOnce(mockResponse);

    const { GET } = await import('@/app/api/case/[caseId]/graph/export/route');

    const url = new URL('http://localhost/api/case/test-case/graph/export?foo=bar&baz=qux');
    const nextReq = { nextUrl: url } as NextRequest;
    const params = Promise.resolve({ caseId: 'test-case' });

    await GET(nextReq, { params } as any);

    expect(apiFetch).toHaveBeenCalledWith('/case/test-case/graph/export?foo=bar&baz=qux', {
      method: 'GET',
      headers: { Accept: 'text/csv' },
    });
  });

  it('handles empty search params correctly', async () => {
    const csvContent = 'id,name\n1,Test';
    const mockResponse = new Response(csvContent, { status: 200 });

    (apiFetch as unknown as MockedFunction<typeof apiFetch>).mockResolvedValueOnce(mockResponse);

    const { GET } = await import('@/app/api/case/[caseId]/graph/export/route');

    const url = new URL('http://localhost/api/case/case-789/graph/export');
    const nextReq = { nextUrl: url } as NextRequest;
    const params = Promise.resolve({ caseId: 'case-789' });

    await GET(nextReq, { params } as any);

    expect(apiFetch).toHaveBeenCalledWith('/case/case-789/graph/export', {
      method: 'GET',
      headers: { Accept: 'text/csv' },
    });
  });

  it('returns error response when apiFetch returns non-ok status', async () => {
    const errorMessage = 'Internal Server Error';
    (apiFetch as unknown as MockedFunction<typeof apiFetch>).mockResolvedValueOnce(
      new Response(errorMessage, {
        status: 500,
        statusText: 'Internal Server Error',
      })
    );

    const { GET } = await import('@/app/api/case/[caseId]/graph/export/route');

    const url = new URL('http://localhost/api/case/case-123/graph/export');
    const nextReq = { nextUrl: url } as NextRequest;
    const params = Promise.resolve({ caseId: 'case-123' });

    const res = await GET(nextReq, { params } as any);

    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).toBe(errorMessage);
  });

  it('returns error response when response body is null', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      body: null,
      text: vi.fn().mockResolvedValue(''),
      headers: new Headers(),
    } as unknown as Response;

    (apiFetch as unknown as MockedFunction<typeof apiFetch>).mockResolvedValueOnce(mockResponse);

    const { GET } = await import('@/app/api/case/[caseId]/graph/export/route');

    const url = new URL('http://localhost/api/case/case-123/graph/export');
    const nextReq = { nextUrl: url } as NextRequest;
    const params = Promise.resolve({ caseId: 'case-123' });

    const res = await GET(nextReq, { params } as any);

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe('');
  });

  it('returns error message when resp.text() throws', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      body: new ReadableStream(),
      text: vi.fn().mockRejectedValue(new Error('Failed to read response')),
      headers: new Headers(),
    } as unknown as Response;

    (apiFetch as unknown as MockedFunction<typeof apiFetch>).mockResolvedValueOnce(mockResponse);

    const { GET } = await import('@/app/api/case/[caseId]/graph/export/route');

    const url = new URL('http://localhost/api/case/case-123/graph/export');
    const nextReq = { nextUrl: url } as NextRequest;
    const params = Promise.resolve({ caseId: 'case-123' });

    const res = await GET(nextReq, { params } as any);

    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).toBe('Erro ao exportar');
  });

  it('returns error response with status 500 when status is missing', async () => {
    const mockResponse = {
      ok: false,
      status: undefined,
      body: null,
      text: vi.fn().mockResolvedValue('Error occurred'),
      headers: new Headers(),
    } as unknown as Response;

    (apiFetch as unknown as MockedFunction<typeof apiFetch>).mockResolvedValueOnce(mockResponse);

    const { GET } = await import('@/app/api/case/[caseId]/graph/export/route');

    const url = new URL('http://localhost/api/case/case-123/graph/export');
    const nextReq = { nextUrl: url } as NextRequest;
    const params = Promise.resolve({ caseId: 'case-123' });

    const res = await GET(nextReq, { params } as any);

    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).toBe('Error occurred');
  });

  it('preserves original response headers and adds CSV-specific headers', async () => {
    const csvContent = 'id,name\n1,Test';
    const originalHeaders = new Headers({
      'content-type': 'text/csv',
      'x-custom-header': 'custom-value',
    });
    const mockResponse = new Response(csvContent, {
      status: 200,
      headers: originalHeaders,
    });

    (apiFetch as unknown as MockedFunction<typeof apiFetch>).mockResolvedValueOnce(mockResponse);

    const { GET } = await import('@/app/api/case/[caseId]/graph/export/route');

    const url = new URL('http://localhost/api/case/case-999/graph/export');
    const nextReq = { nextUrl: url } as NextRequest;
    const params = Promise.resolve({ caseId: 'case-999' });

    const res = await GET(nextReq, { params } as any);

    expect(res.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(res.headers.get('Content-Disposition')).toBe(
      'attachment; filename="case-case-999-graph.csv"'
    );
    expect(res.headers.get('x-custom-header')).toBe('custom-value');
  });

  it('generates correct filename with caseId in Content-Disposition header', async () => {
    const csvContent = 'id,name\n1,Test';
    const mockResponse = new Response(csvContent, { status: 200 });

    (apiFetch as unknown as MockedFunction<typeof apiFetch>).mockResolvedValueOnce(mockResponse);

    const { GET } = await import('@/app/api/case/[caseId]/graph/export/route');

    const testCases = [
      { caseId: 'case-123', expectedFilename: 'case-case-123-graph.csv' },
      { caseId: 'abc-xyz-789', expectedFilename: 'case-abc-xyz-789-graph.csv' },
      { caseId: '123', expectedFilename: 'case-123-graph.csv' },
    ];

    for (const testCase of testCases) {
      vi.clearAllMocks();
      (apiFetch as unknown as MockedFunction<typeof apiFetch>).mockResolvedValueOnce(mockResponse);

      const url = new URL(`http://localhost/api/case/${testCase.caseId}/graph/export`);
      const nextReq = { nextUrl: url } as NextRequest;
      const params = Promise.resolve({ caseId: testCase.caseId });

      const res = await GET(nextReq, { params } as any);

      expect(res.headers.get('Content-Disposition')).toBe(
        `attachment; filename="case-${testCase.caseId}-graph.csv"`
      );
    }
  });

  it('propagates error if apiFetch throws', async () => {
    (apiFetch as unknown as MockedFunction<typeof apiFetch>).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { GET } = await import('@/app/api/case/[caseId]/graph/export/route');

    const url = new URL('http://localhost/api/case/case-123/graph/export');
    const nextReq = { nextUrl: url } as NextRequest;
    const params = Promise.resolve({ caseId: 'case-123' });

    await expect(GET(nextReq, { params } as any)).rejects.toThrow('Network error');
    expect(apiFetch).toHaveBeenCalledWith('/case/case-123/graph/export', {
      method: 'GET',
      headers: { Accept: 'text/csv' },
    });
  });
});
