import { supabase } from '@/api/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { User, RegistrationCode } from '@/types';

// ── Account Management ──

export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, rp_name, codename, role, status, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as User[];
}

export async function approveUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ status: 'active' })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

export async function rejectUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)
    .eq('status', 'pending');

  if (error) throw new Error(error.message);
}

export async function deactivateUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ status: 'deactivated' })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

export async function reactivateUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ status: 'active' })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

// ── Registration Codes ──

export async function fetchCodes(): Promise<RegistrationCode[]> {
  const { data, error } = await supabase
    .from('registration_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as RegistrationCode[];
}

export async function generateCode(): Promise<RegistrationCode> {
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `ANBU-${segment()}-${segment()}`;

  const user = useAuthStore.getState().user;

  const { data, error } = await supabase
    .from('registration_codes')
    .insert({ code, status: 'available', generated_by: user!.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as RegistrationCode;
}

export async function revokeCode(codeId: string): Promise<void> {
  const { error } = await supabase
    .from('registration_codes')
    .update({ status: 'revoked' })
    .eq('id', codeId);

  if (error) throw new Error(error.message);
}
