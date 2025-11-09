import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/case/[caseId]/suspect/batch/route';
import { apiFetchFormData } from '@/lib/backend';

vi.mock('@/lib/backend', () => ({
  apiFetchFormData: vi.fn(),
}));

describe('POST /api/case/[caseId]/suspect/batch', () => {
  const mockApiFetchFormData = vi.mocked(apiFetchFormData);
  const params = { params: Promise.resolve({ caseId: 'case-123' }) };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a successful response when apiFetchFormData succeeds', async () => {
    const mockSuccessResponse = {
      message: 'Investigados adicionados com sucesso',
      count: 5,
    };
    const mockFormData = new FormData();
    mockFormData.append('file', new Blob(['test']), 'suspects.csv');

    const mockRequest = new NextRequest('http://localhost/api/case/case-123/suspect/batch', {
      method: 'POST',
      body: mockFormData,
    });

    mockApiFetchFormData.mockResolvedValue(
      new Response(JSON.stringify(mockSuccessResponse), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const response = await POST(mockRequest, params);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(mockSuccessResponse);
    expect(mockApiFetchFormData).toHaveBeenCalledWith(
      '/case/case-123/investigadoslote',
      mockRequest,
      'POST'
    );
  });

  it('should forward response headers correctly', async () => {
    const mockFormData = new FormData();
    mockFormData.append('file', new Blob(['test']), 'suspects.csv');

    const mockRequest = new NextRequest('http://localhost/api/case/case-123/suspect/batch', {
      method: 'POST',
      body: mockFormData,
    });

    const customHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Custom-Header': 'custom-value',
    });

    mockApiFetchFormData.mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: customHeaders,
      })
    );

    const response = await POST(mockRequest, params);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('X-Custom-Header')).toBe('custom-value');
  });

  it('should return a non-JSON response correctly', async () => {
    const mockFormData = new FormData();
    mockFormData.append('file', new Blob(['test']), 'suspects.csv');

    const mockRequest = new NextRequest('http://localhost/api/case/case-123/suspect/batch', {
      method: 'POST',
      body: mockFormData,
    });

    mockApiFetchFormData.mockResolvedValue(
      new Response('Created', {
        status: 201,
        headers: { 'Content-Type': 'text/plain' },
      })
    );

    const response = await POST(mockRequest, params);
    const text = await response.text();

    expect(response.status).toBe(201);
    expect(text).toBe('Created');
    expect(response.headers.get('Content-Type')).toContain('text/plain');
  });

  it('should forward error status codes from apiFetchFormData', async () => {
    const mockFormData = new FormData();
    mockFormData.append('file', new Blob(['test']), 'suspects.csv');

    const mockRequest = new NextRequest('http://localhost/api/case/case-123/suspect/batch', {
      method: 'POST',
      body: mockFormData,
    });

    mockApiFetchFormData.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Bad Request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const response = await POST(mockRequest, params);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Bad Request');
  });

  it('should return 500 error if apiFetchFormData throws an exception', async () => {
    const mockFormData = new FormData();
    mockFormData.append('file', new Blob(['test']), 'suspects.csv');

    const mockRequest = new NextRequest('http://localhost/api/case/case-123/suspect/batch', {
      method: 'POST',
      body: mockFormData,
    });

    const error = new Error('Network error');
    mockApiFetchFormData.mockRejectedValue(error);

    const response = await POST(mockRequest, params);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Erro interno do servidor');
  });

  it('should handle params correctly with async resolution', async () => {
    const mockFormData = new FormData();
    mockFormData.append('file', new Blob(['test']), 'suspects.csv');

    const mockRequest = new NextRequest('http://localhost/api/case/case-123/suspect/batch', {
      method: 'POST',
      body: mockFormData,
    });

    const asyncParams = { params: Promise.resolve({ caseId: 'case-456' }) };

    mockApiFetchFormData.mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await POST(mockRequest, asyncParams);

    expect(mockApiFetchFormData).toHaveBeenCalledWith(
      '/case/case-456/investigadoslote',
      mockRequest,
      'POST'
    );
  });

  it('should log error to console when exception occurs', async () => {
    const mockFormData = new FormData();
    mockFormData.append('file', new Blob(['test']), 'suspects.csv');

    const mockRequest = new NextRequest('http://localhost/api/case/case-123/suspect/batch', {
      method: 'POST',
      body: mockFormData,
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Test error');
    mockApiFetchFormData.mockRejectedValue(error);

    await POST(mockRequest, params);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erro ao processar adição de investigados em lote:',
      error
    );

    consoleErrorSpy.mockRestore();
  });
});
