import { Suspect } from '@/types/Cases';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function addSuspect(caseId: string, suspect: Suspect) {
  const response = await fetch(`${API_URL}/case/${caseId}/suspect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: JSON.stringify(suspect),
  });

  if (!response.ok) {
    throw new Error(`Falha ao adicionar suspeito: ${response.statusText}`);
  }

  return response.json();
}
