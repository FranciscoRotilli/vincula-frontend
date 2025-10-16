import { NextRequest } from 'next/server';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import { GET, PATCH } from '@/app/api/case/[caseId]/route';
import { apiFetch } from '@/lib/backend';

vi.mock('@/lib/backend', () => ({
  apiFetch: vi.fn(),
}));

describe('/api/case/[caseId]', () => {
  const mockApiFetch = vi.mocked(apiFetch);
  const mockRequest = {} as NextRequest;
  const params = { params: Promise.resolve({ caseId: 'case-123' }) };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return a JSON response on success', async () => {
      const mockCaseData = { id: 'case-123', name: 'The Missing File' };
      mockApiFetch.mockResolvedValue(
        new Response(JSON.stringify(mockCaseData), { status: 200 })
      );

      const response = await GET(mockRequest, params);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(mockCaseData);
      expect(mockApiFetch).toHaveBeenCalledWith('/case/case-123', { method: 'GET' });
    });

    it('should return a text response if the body is not valid JSON', async () => {
      mockApiFetch.mockResolvedValue(
        new Response('An unexpected error occurred', { status: 500 })
      );

      const response = await GET(mockRequest, params);
      const text = await response.text();

      expect(response.status).toBe(500);
      expect(text).toBe('An unexpected error occurred');
    });
  });

  describe('PATCH', () => {
    const updatePayload = { name: 'The Solved File' };

    it('should return an updated JSON response on success', async () => {
      // Create a fresh request for this test
      const patchRequest = new NextRequest('http://localhost/api/case/case-123', {
        method: 'PATCH',
        body: JSON.stringify(updatePayload),
      });
      
      const mockUpdatedCase = { id: 'case-123', ...updatePayload };
      mockApiFetch.mockResolvedValue(
        new Response(JSON.stringify(mockUpdatedCase), { status: 200 })
      );

      const response = await PATCH(patchRequest, params);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual(mockUpdatedCase);
      expect(mockApiFetch).toHaveBeenCalledWith('/case/case-123/', {
        method: 'PATCH',
        body: JSON.stringify(updatePayload),
      });
    });

    it('should return an empty response with the correct status when apiFetch returns no body', async () => {
      // Create a fresh request for this test as well
      const patchRequest = new NextRequest('http://localhost/api/case/case-123', {
        method: 'PATCH',
        body: JSON.stringify(updatePayload),
      });

      mockApiFetch.mockResolvedValue(
        new Response(null, { status: 204 })
      );
      
      const response = await PATCH(patchRequest, params);
      const text = await response.text();

      expect(response.status).toBe(204);
      expect(text).toBe('');
    });
  });
});