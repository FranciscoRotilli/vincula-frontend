import { NextRequest } from 'next/server';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/case/[caseId]/suspect/route';
import { apiFetch } from '@/lib/backend';

vi.mock('@/lib/backend', () => ({
  apiFetch: vi.fn(),
}));

describe('POST /api/cases/[caseId]/suspect', () => {
  const mockApiFetch = vi.mocked(apiFetch);
  const params = { params: Promise.resolve({ caseId: 'case-123' }) };
  const suspectPayload = { name: 'John Doe', cpf: '123.456.789-00' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a successful JSON response when apiFetch succeeds', async () => {
    const mockSuccessResponse = { id: 'suspect-789', ...suspectPayload };
    const mockRequest = new NextRequest('http://localhost/api/cases/case-123/suspect', {
      method: 'POST',
      body: JSON.stringify(suspectPayload),
    });

    mockApiFetch.mockResolvedValue(
      new Response(JSON.stringify(mockSuccessResponse), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const response = await POST(mockRequest, params);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(mockSuccessResponse);
    expect(mockApiFetch).toHaveBeenCalledWith('/case/case-123/suspect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(suspectPayload),
    });
  });

  it('should forward a non-JSON success response correctly', async () => {
    const mockRequest = new NextRequest('http://localhost/api/cases/case-123/suspect', {
      method: 'POST',
      body: JSON.stringify(suspectPayload),
    });

    mockApiFetch.mockResolvedValue(
      new Response('Created', {
        status: 201,
        headers: { 'Content-Type': 'text/plain' },
      })
    );

    const response = await POST(mockRequest, params);
    const text = await response.text();

    expect(response.status).toBe(201);
    expect(text).toBe('Created');
    expect(response.headers.get('content-type')).toContain('text/plain');
  });

  it('should return a 500 error if the request payload is invalid', async () => {
    const mockRequest = new NextRequest('http://localhost/api/cases/case-123/suspect', {
      method: 'POST',
      body: 'invalid-json',
    });

    const response = await POST(mockRequest, params);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Falha ao adicionar suspeito');
    expect(body.details).toContain('Unexpected token');
  });

  it('should return a 500 error if apiFetch throws an exception', async () => {
    const mockRequest = new NextRequest('http://localhost/api/cases/case-123/suspect', {
      method: 'POST',
      body: JSON.stringify(suspectPayload),
    });
    const error = new Error('Internal Server Error');
    mockApiFetch.mockRejectedValue(error);

    const response = await POST(mockRequest, params);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: 'Falha ao adicionar suspeito',
      details: String(error),
    });
  });
});