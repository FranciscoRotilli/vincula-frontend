import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type LoginResponse = {
  user: string;
  role: string;
  access_token: string;
  refresh_token: string;
};

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await axios.post(`${API_URL}/auth/login`, {
    username,
    password,
  });

  return response.data;
}
