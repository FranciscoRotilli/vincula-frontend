import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function removeFile(caseId: string, fileId: string) {
  const response = await axios.delete(`${API_URL}/case/${caseId}/files/${fileId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  return response.data;
}
