import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type CaseResponse = {
    caseName: string
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addCase(name: string): Promise<any> {
    const response = await axios.post(`${API_URL}/case/`, {
    name,
  }, 
   {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem('access_token')}`, // header igual ao Swagger
    }},
    );
  return response.data;
};
