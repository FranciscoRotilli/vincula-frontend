import { UserResponse } from "@/types/User";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getUsers(): Promise<UserResponse[]> {
    const res = await fetch(`${API_URL}/user/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
    });
    if (!res.ok) {
        throw new Error(`Falha ao adicionar suspeito: ${res.statusText}`);
    }
    return res.json();
}
