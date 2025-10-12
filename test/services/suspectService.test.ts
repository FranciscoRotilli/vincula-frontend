import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addSuspect, deleteSuspect } from '../../src/services/suspectService';
import { SuspectInput } from '@/types/Cases';

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
    const suspect: SuspectInput = {
      name: 'Fulano da Silva',
      cpf: '123.456.789-00',
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
        body: JSON.stringify(suspect),
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
