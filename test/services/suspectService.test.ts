import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SuspectRequest } from '@/types/Cases';

import { addSuspect, deleteSuspect } from '../../src/services/suspectService';

vi.stubGlobal('fetch', vi.fn());

describe('suspectService', () => {
  const caseId = 'case-123';
  const suspectId = 'suspect-456';
  const accessToken = 'test-bearer-token';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('access_token', accessToken);
  });

  describe('addSuspect', () => {
    const suspect: SuspectRequest = {
      name: 'Fulano da Silva',
      cpf_cnpj: '123.456.789-00',
      phone_number: '(11) 98765-4321',
    };

    it('should call fetch with the correct URL, method, headers, and body', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: true,
      });

      await addSuspect(caseId, suspect);

      expect(fetch).toHaveBeenCalledWith(`/api/case/${caseId}/suspect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: suspect.name,
          cpf_cnpj: '12345678900',
          phone_number: suspect.phone_number,
        }),
      });
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the fetch response is not ok', async () => {
      const errorStatusText = 'Bad Request';
      (fetch as vi.Mock).mockResolvedValue({
        ok: false,
        statusText: errorStatusText,
      });

      await expect(addSuspect(caseId, suspect)).rejects.toThrow(
        `Falha ao adicionar suspeito: ${errorStatusText}`
      );
    });
  });

  describe('deleteSuspect', () => {
    it('should call fetch with the correct URL, method, and headers', async () => {
      (fetch as vi.Mock).mockResolvedValue({
        ok: true,
      });

      await deleteSuspect(caseId, suspectId);

      expect(fetch).toHaveBeenCalledWith(
        `/api/case/${caseId}/suspect/${suspectId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the fetch response is not ok', async () => {
      const errorStatusText = 'Internal Server Error';
      (fetch as vi.Mock).mockResolvedValue({
        ok: false,
        statusText: errorStatusText,
      });

      await expect(deleteSuspect(caseId, suspectId)).rejects.toThrow(
        `Falha ao remover suspeito: ${errorStatusText}`
      );
    });
  });
});
