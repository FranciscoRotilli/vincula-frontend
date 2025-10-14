// tests/api/deleteSuspect.test.ts

import { NextRequest } from 'next/server';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import { DELETE } from '@/app/api/case/[caseId]/suspect/[suspectId]/route';
import { apiFetch } from '@/lib/backend';

vi.mock('@/lib/backend', () => ({
  apiFetch: vi.fn(),
}));

describe('DELETE /api/cases/[caseId]/suspect/[suspectId]', () => {
  const mockApiFetch = vi.mocked(apiFetch);
  const mockRequest = {} as NextRequest;
  const params = { params: { caseId: 'case-123', suspectId: 'suspect-456' } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a successful JSON response when apiFetch succeeds', async () => {
    const mockSuccessResponse = { message: 'Suspect deleted' };
    mockApiFetch.mockResolvedValue(
      new Response(JSON.stringify(mockSuccessResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const response = await DELETE(mockRequest, params);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockSuccessResponse);
    expect(mockApiFetch).toHaveBeenCalledWith('/case/case-123/suspect/suspect-456', {
      method: 'DELETE',
    });
  });

  it('should return a successful empty response for 204 No Content', async () => {
    mockApiFetch.mockResolvedValue(
      new Response(null, {
        status: 204,
      })
    );

    const response = await DELETE(mockRequest, params);
    const text = await response.text();

    expect(response.status).toBe(204);
    expect(text).toBe('');
  });

  it('should forward the status and body from a failed apiFetch call', async () => {
    const mockErrorResponse = { error: 'Not Found' };
    mockApiFetch.mockResolvedValue(
      new Response(JSON.stringify(mockErrorResponse), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const response = await DELETE(mockRequest, params);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual(mockErrorResponse);
  });

  it('should return a 500 error if apiFetch throws an exception', async () => {
    const error = new Error('Network failure');
    mockApiFetch.mockRejectedValue(error);

    const response = await DELETE(mockRequest, params);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: 'Failed to delete suspect',
      details: String(error),
    });
  });
});