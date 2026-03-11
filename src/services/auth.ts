import { supabase } from '@/api/supabase';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/types/auth';

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function callEdgeFunction<T>(name: string, body: unknown): Promise<T> {
  const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? 'Erreur serveur');
  }

  return data as T;
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return callEdgeFunction<LoginResponse>('login', credentials);
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  return callEdgeFunction<RegisterResponse>('register', payload);
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const token = localStorage.getItem('anbu_token');
  if (!token) throw new Error('Non authentifié');

  const res = await fetch(`${FUNCTIONS_BASE}/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Erreur serveur');
  return data as { message: string };
}

export { supabase };
