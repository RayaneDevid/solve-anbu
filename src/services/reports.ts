import { supabase } from '@/api/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { PersonalReport } from '@/types';

export async function fetchMyReports(): Promise<PersonalReport[]> {
  const user = useAuthStore.getState().user;
  const { data, error } = await supabase
    .from('personal_reports')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as PersonalReport[];
}

export async function createReport(content: string): Promise<PersonalReport> {
  const user = useAuthStore.getState().user;
  const { data, error } = await supabase
    .from('personal_reports')
    .insert({ user_id: user!.id, content })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PersonalReport;
}

export async function updateReport(id: string, content: string): Promise<PersonalReport> {
  const { data, error } = await supabase
    .from('personal_reports')
    .update({ content })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as PersonalReport;
}

export async function deleteReport(id: string): Promise<void> {
  const { error } = await supabase.from('personal_reports').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Chef ANBU: fetch all reports by user
export async function fetchAllReports(): Promise<(PersonalReport & { user_codename: string })[]> {
  const { data, error } = await supabase
    .from('personal_reports')
    .select(`
      *,
      users:user_id ( codename, status )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data as Array<PersonalReport & { users: { codename: string; status: string } }>).map((row) => ({
    ...row,
    user_codename: row.users?.status === 'deactivated' ? '?' : row.users?.codename ?? '?',
  }));
}
