import { supabase } from '@/api/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { Investigation, InvestigationIntel, InvestigationPhoto, StatusBadge } from '@/types';

// ── Investigations ──

export async function fetchInvestigations(): Promise<Investigation[]> {
  const { data, error } = await supabase
    .from('investigations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Investigation[];
}

export async function fetchInvestigation(id: string): Promise<Investigation> {
  const { data, error } = await supabase
    .from('investigations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as Investigation;
}

export async function createInvestigation(record: {
  title: string;
  description?: string | null;
  photo_url?: string | null;
  status_badge?: StatusBadge | null;
}): Promise<Investigation> {
  const user = useAuthStore.getState().user;
  const { data, error } = await supabase
    .from('investigations')
    .insert({ ...record, created_by: user!.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Investigation;
}

export async function updateInvestigation(
  id: string,
  updates: { title?: string; description?: string | null; photo_url?: string | null; status_badge?: StatusBadge | null },
): Promise<Investigation> {
  const { data, error } = await supabase
    .from('investigations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Investigation;
}

export async function updateInvestigationStatusBadge(
  id: string,
  badge: StatusBadge | null,
): Promise<void> {
  const { error } = await supabase
    .from('investigations')
    .update({ status_badge: badge })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteInvestigation(id: string): Promise<void> {
  const { error } = await supabase
    .from('investigations')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ── Investigation Intel ──

export async function fetchInvestigationIntel(investigationId: string): Promise<InvestigationIntel[]> {
  const { data, error } = await supabase
    .from('investigation_intel')
    .select(`
      *,
      users:submitted_by ( codename, status )
    `)
    .eq('investigation_id', investigationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data as Array<InvestigationIntel & { users: { codename: string; status: string } }>).map((row) => ({
    id: row.id,
    investigation_id: row.investigation_id,
    content: row.content,
    submitted_by: row.submitted_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    submitter_codename: row.users?.status === 'deactivated' ? '?' : row.users?.codename ?? '?',
  }));
}

export async function addInvestigationIntel(investigationId: string, content: string): Promise<InvestigationIntel> {
  const user = useAuthStore.getState().user;
  const { data, error } = await supabase
    .from('investigation_intel')
    .insert({ investigation_id: investigationId, content, submitted_by: user!.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as InvestigationIntel;
}

export async function updateInvestigationIntel(id: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('investigation_intel')
    .update({ content })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteInvestigationIntel(id: string): Promise<void> {
  const { error } = await supabase.from('investigation_intel').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Investigation Photos ──

export async function fetchInvestigationPhotos(investigationId: string): Promise<InvestigationPhoto[]> {
  const { data, error } = await supabase
    .from('investigation_photos')
    .select('*')
    .eq('investigation_id', investigationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data as InvestigationPhoto[];
}

export async function addInvestigationPhoto(investigationId: string, imgurUrl: string): Promise<InvestigationPhoto> {
  const user = useAuthStore.getState().user;
  const { data, error } = await supabase
    .from('investigation_photos')
    .insert({ investigation_id: investigationId, imgur_url: imgurUrl, added_by: user!.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as InvestigationPhoto;
}
