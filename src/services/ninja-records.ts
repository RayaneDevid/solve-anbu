import { supabase } from '@/api/supabase';
import { useAuthStore } from '@/stores/auth-store';
import type { NinjaRecord, NinjaIntel, NinjaPhoto, Village, StatusBadge } from '@/types';

// ── Ninja Records ──

export async function fetchNinjaRecords(): Promise<NinjaRecord[]> {
  const { data, error } = await supabase
    .from('ninja_records')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as NinjaRecord[];
}

export async function fetchNinjaRecord(id: string): Promise<NinjaRecord> {
  const { data, error } = await supabase
    .from('ninja_records')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as NinjaRecord;
}

export async function createNinjaRecord(record: {
  name: string;
  village: Village;
  photo_url?: string | null;
  status_badge?: StatusBadge | null;
}): Promise<NinjaRecord> {
  const user = useAuthStore.getState().user;
  const { data, error } = await supabase
    .from('ninja_records')
    .insert({ ...record, created_by: user!.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as NinjaRecord;
}

export async function updateNinjaRecord(
  id: string,
  updates: { name?: string; village?: Village; photo_url?: string | null; status_badge?: StatusBadge | null },
): Promise<NinjaRecord> {
  const { data, error } = await supabase
    .from('ninja_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as NinjaRecord;
}

export async function updateStatusBadge(
  recordId: string,
  badge: StatusBadge | null,
): Promise<void> {
  const { error } = await supabase
    .from('ninja_records')
    .update({ status_badge: badge })
    .eq('id', recordId);

  if (error) throw new Error(error.message);
}

export async function deleteNinjaRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('ninja_records')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ── Ninja Intel ──

export async function fetchNinjaIntel(recordId: string): Promise<NinjaIntel[]> {
  const { data, error } = await supabase
    .from('ninja_intel')
    .select(`
      *,
      users:submitted_by ( codename, status )
    `)
    .eq('ninja_record_id', recordId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data as Array<NinjaIntel & { users: { codename: string; status: string } }>).map((row) => ({
    id: row.id,
    ninja_record_id: row.ninja_record_id,
    content: row.content,
    submitted_by: row.submitted_by,
    created_at: row.created_at,
    submitter_codename: row.users?.status === 'deactivated' ? '?' : row.users?.codename ?? '?',
  }));
}

export async function addNinjaIntel(recordId: string, content: string): Promise<NinjaIntel> {
  const user = useAuthStore.getState().user;
  const { data, error } = await supabase
    .from('ninja_intel')
    .insert({ ninja_record_id: recordId, content, submitted_by: user!.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as NinjaIntel;
}

export async function deleteNinjaIntel(id: string): Promise<void> {
  const { error } = await supabase.from('ninja_intel').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Ninja Photos ──

export async function fetchNinjaPhotos(recordId: string): Promise<NinjaPhoto[]> {
  const { data, error } = await supabase
    .from('ninja_photos')
    .select('*')
    .eq('ninja_record_id', recordId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data as NinjaPhoto[];
}

export async function addNinjaPhoto(recordId: string, imgurUrl: string): Promise<NinjaPhoto> {
  const user = useAuthStore.getState().user;
  const { data, error } = await supabase
    .from('ninja_photos')
    .insert({ ninja_record_id: recordId, imgur_url: imgurUrl, added_by: user!.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as NinjaPhoto;
}
