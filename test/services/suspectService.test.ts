// test/services/suspectService.test.ts
import { beforeEach, describe, expect, it, type MockedFunction,vi } from 'vitest';

import { addSuspect, deleteSuspect } from '@/services/suspectService';
import type { SuspectRequest } from '@/types/Cases';

// Use a strongly-typed fetch mock and stub it globally
const mockFetch = vi.fn() as MockedFunction<typeof fetch>;
vi.stubGlobal('fetch', mockFetch);

describe('suspectService', () => {
  const caseId = 'case-123';
  const suspectId = 'suspect-456';
  const accessToken = 'test-bearer-token';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('access_token', accessToken);
  });

  describe('addSuspect', () => {
    const suspect: SuspectRequest = {
      name: 'Fulano da Silva',
      cpf_cnpj: '123.456.789-00', // will be cleaned to 12345678900
      phone_number: '(11) 98765-4321',
    };

    it('calls fetch with correct URL, method, headers, and cleaned body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 'created-1' }),
      } as unknown as Response);

      await addSuspect(caseId, suspect);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(`/api/case/${caseId}/suspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: suspect.name,
          cpf_cnpj: '12345678900', // cleaned!
          phone_number: suspect.phone_number,
        }),
      });
    });

    it('throws when response is not ok', async () => {
      const errorStatusText = 'Bad Request';
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: errorStatusText,
      } as unknown as Response);

      await expect(addSuspect(caseId, suspect)).rejects.toThrow(
        'Falha ao adicionar suspeito: Bad Request'
      );
    });

    it('uses "Bearer null" when there is no access token (and still cleans cpf/cnpj)', async () => {
      localStorage.removeItem('access_token');
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ id: 'no-token' }),
      } as unknown as Response);

      await addSuspect(caseId, suspect);

      expect(fetch).toHaveBeenCalledWith(`/api/case/${caseId}/suspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer null',
        },
        body: JSON.stringify({
          name: suspect.name,
          cpf_cnpj: '12345678900', // cleaned even without token
          phone_number: suspect.phone_number,
        }),
      });
    });

    it('returns { ok: true } when body has no JSON (json() throws)', async () => {
      // Simulate a 204/empty JSON body by making json() throw
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockRejectedValue(new Error('no json')),
      } as unknown as Response);

      const result = await addSuspect(caseId, suspect);
      expect(result).toEqual({ ok: true });
    });
  });

  describe('deleteSuspect', () => {
    it('calls fetch with correct URL, method, and headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
      } as unknown as Response);

      await expect(deleteSuspect(caseId, suspectId)).resolves.toBeUndefined();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `/api/case/${caseId}/suspect/${suspectId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    });

    it('throws when response is not ok', async () => {
      const errorStatusText = 'Internal Server Error';
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: errorStatusText,
      } as unknown as Response);

      await expect(deleteSuspect(caseId, suspectId)).rejects.toThrow(
        'Falha ao remover suspeito: Internal Server Error'
      );
    });

    it('uses "Bearer null" when there is no access token', async () => {
      localStorage.removeItem('access_token');
      mockFetch.mockResolvedValue({ ok: true } as unknown as Response);

      await deleteSuspect(caseId, suspectId);

      expect(fetch).toHaveBeenCalledWith(
        `/api/case/${caseId}/suspect/${suspectId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer null',
          },
        }
      );
    });
  });
});
