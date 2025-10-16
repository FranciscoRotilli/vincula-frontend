import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act,renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useAddSuspect, useDeleteSuspect } from '@/hooks/useSuspect';
import * as suspectService from '@/services/suspectService';
import { SuspectInput } from '@/types/Cases';

vi.mock('@/services/suspectService');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(QueryClientProvider, { client: queryClient }, children);

describe('Suspect Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAddSuspect', () => {
    it('should call addSuspect service with the correct parameters on mutation', async () => {
      const caseId = 'case-001';
      const newSuspect: SuspectInput = { name: 'Jane Doe', cpf: '987.654.321-00' };
      const addSuspectSpy = vi.spyOn(suspectService, 'addSuspect');

      const { result } = renderHook(() => useAddSuspect(), { wrapper });

      act(() => {
        result.current.mutate({ caseId, newSuspect });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(addSuspectSpy).toHaveBeenCalledTimes(1);
        expect(addSuspectSpy).toHaveBeenCalledWith(caseId, newSuspect);
      });
    });
  });

  describe('useDeleteSuspect', () => {
    it('should call deleteSuspect service with the correct parameters on mutation', async () => {
      const caseId = 'case-002';
      const suspectId = 'suspect-007';
      const deleteSuspectSpy = vi.spyOn(suspectService, 'deleteSuspect');

      const { result } = renderHook(() => useDeleteSuspect(), { wrapper });

      act(() => {
        result.current.mutate({ caseId, suspectId });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        expect(deleteSuspectSpy).toHaveBeenCalledTimes(1);
        expect(deleteSuspectSpy).toHaveBeenCalledWith(caseId, suspectId);
      });
    });
  });
});
