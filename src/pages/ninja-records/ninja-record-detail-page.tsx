import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth-store';
import {
  fetchNinjaRecord,
  fetchNinjaIntel,
  fetchNinjaPhotos,
  addNinjaIntel,
  deleteNinjaIntel,
  addNinjaPhoto,
  deleteNinjaRecord,
  updateNinjaRecord,
  updateStatusBadge,
} from '@/services/ninja-records';
import type { Village, StatusBadge } from '@/types';
import { VillageBadge, StatusBadgeComponent, SectionHeader, Modal, ConfirmDialog } from '@/components/ui';

const VILLAGES: { value: Village; label: string }[] = [
  { value: 'konoha', label: 'Konoha' },
  { value: 'suna', label: 'Suna' },
  { value: 'kiri', label: 'Kiri' },
  { value: 'oto', label: 'Oto' },
  { value: 'nukenin', label: 'Nukenin' },
  { value: 'samurai', label: 'Samouraï' },
  { value: 'deserteur', label: 'Déserteur' },
];

export default function NinjaRecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isChefAnbu } = useAuthStore();

  const [newIntel, setNewIntel] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteIntelId, setDeleteIntelId] = useState<string | null>(null);

  const { data: record, isLoading } = useQuery({
    queryKey: ['ninja-record', id],
    queryFn: () => fetchNinjaRecord(id!),
    enabled: !!id,
  });

  const { data: intel } = useQuery({
    queryKey: ['ninja-intel', id],
    queryFn: () => fetchNinjaIntel(id!),
    enabled: !!id,
  });

  const { data: photos } = useQuery({
    queryKey: ['ninja-photos', id],
    queryFn: () => fetchNinjaPhotos(id!),
    enabled: !!id,
  });

  const addIntelMutation = useMutation({
    mutationFn: () => addNinjaIntel(id!, newIntel.trim()),
    onSuccess: () => {
      toast.success('Information ajoutée');
      setNewIntel('');
      queryClient.invalidateQueries({ queryKey: ['ninja-intel', id] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const deleteIntelMutation = useMutation({
    mutationFn: (intelId: string) => deleteNinjaIntel(intelId),
    onSuccess: () => {
      toast.success('Information supprimée');
      queryClient.invalidateQueries({ queryKey: ['ninja-intel', id] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const addPhotoMutation = useMutation({
    mutationFn: () => addNinjaPhoto(id!, newPhotoUrl.trim()),
    onSuccess: () => {
      toast.success('Photo ajoutée');
      setNewPhotoUrl('');
      setShowPhotoInput(false);
      queryClient.invalidateQueries({ queryKey: ['ninja-photos', id] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const deleteRecordMutation = useMutation({
    mutationFn: () => deleteNinjaRecord(id!),
    onSuccess: () => {
      toast.success('Casier supprimé');
      navigate('/ninja-records');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const statusMutation = useMutation({
    mutationFn: (badge: StatusBadge | null) => updateStatusBadge(id!, badge),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ninja-record', id] });
    },
  });

  if (isLoading || !record) {
    return (
      <div className="space-y-6">
        <Link to="/ninja-records" className="text-sm text-text-secondary hover:text-accent transition-colors">
          ← Retour aux casiers
        </Link>
        <div className="bg-surface border border-border p-8 text-center">
          <p className="text-sm text-text-muted">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/ninja-records" className="inline-block text-sm text-text-secondary hover:text-accent transition-colors">
        ← Retour aux casiers
      </Link>

      {/* Header Card */}
      <div className="bg-surface border border-border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-24 h-24 bg-[#2a2a2a] border-2 border-[rgba(139,0,0,0.3)] shrink-0 overflow-hidden">
              {record.photo_url ? (
                <img src={record.photo_url} alt={record.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted text-3xl">
                  👤
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h1 className="text-[30px] font-bold text-text-primary leading-tight">{record.name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <VillageBadge village={record.village} />
                <StatusBadgeComponent status={record.status_badge} />
              </div>
            </div>
          </div>

          {/* Actions (Chef ANBU) */}
          {isChefAnbu && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditModalOpen(true)}
                className="p-2 bg-[#2a2a2a] hover:bg-[#333] text-text-primary transition-colors cursor-pointer"
                title="Modifier"
              >
                ✏️
              </button>
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="p-2 bg-accent hover:bg-accent-hover text-white transition-colors cursor-pointer"
                title="Supprimer"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        {/* Status badge selector */}
        <div className="mt-4 pt-4 border-t border-border">
          <label className="text-xs uppercase tracking-widest text-text-muted block mb-2">Pastille de statut</label>
          <div className="flex gap-2">
            {([null, 'surveillance', 'traque', 'mort'] as (StatusBadge | null)[]).map((badge) => (
              <button
                key={badge ?? 'none'}
                onClick={() => statusMutation.mutate(badge)}
                className={`px-3 py-1 text-xs border transition-colors cursor-pointer ${
                  record.status_badge === badge
                    ? 'border-accent text-accent bg-accent/10'
                    : 'border-border text-text-secondary hover:border-accent/50'
                }`}
              >
                {badge === null ? 'Aucun' : badge === 'surveillance' ? '🟡 À surveiller' : badge === 'traque' ? '🔴 À traquer' : '⚫ Mort'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Photos Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader title="Photos" count={photos?.length} />
          <button
            onClick={() => setShowPhotoInput(!showPhotoInput)}
            className="text-sm bg-[#2a2a2a] hover:bg-[#333] text-text-primary px-3 py-1.5 transition-colors cursor-pointer"
          >
            + Ajouter une photo
          </button>
        </div>

        {showPhotoInput && (
          <div className="flex gap-2">
            <input
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              placeholder="https://i.imgur.com/..."
              className="flex-1 bg-background border border-border px-3 py-2 text-sm text-text-primary placeholder-text-muted"
            />
            <button
              onClick={() => { if (newPhotoUrl.trim()) addPhotoMutation.mutate(); }}
              disabled={addPhotoMutation.isPending || !newPhotoUrl.trim()}
              className="px-4 py-2 text-sm bg-accent hover:bg-accent-hover disabled:opacity-50 text-white transition-colors cursor-pointer"
            >
              Ajouter
            </button>
          </div>
        )}

        {photos && photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="border border-border overflow-hidden group relative">
                <img src={photo.imgur_url} alt="" className="w-full h-32 object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-border p-6 text-center">
            <p className="text-sm text-text-muted">Aucune photo.</p>
          </div>
        )}
      </div>

      {/* Intel Section */}
      <div className="space-y-4">
        <SectionHeader title="Informations" count={intel?.length} />

        {/* Add intel form */}
        <div className="space-y-2">
          <textarea
            value={newIntel}
            onChange={(e) => setNewIntel(e.target.value)}
            placeholder="Ajouter une information..."
            rows={3}
            className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary placeholder-text-muted resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={() => { if (newIntel.trim()) addIntelMutation.mutate(); }}
              disabled={addIntelMutation.isPending || !newIntel.trim()}
              className="px-4 py-2 text-sm bg-accent hover:bg-accent-hover disabled:opacity-50 text-white transition-colors cursor-pointer"
            >
              {addIntelMutation.isPending ? 'Envoi...' : 'Ajouter une information'}
            </button>
          </div>
        </div>

        {/* Intel list */}
        {intel && intel.length > 0 ? (
          <div className="space-y-3">
            {intel.map((item) => (
              <div
                key={item.id}
                className="bg-[rgba(42,42,42,0.3)] border-l-2 border-l-accent p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{item.content}</p>
                  {isChefAnbu && (
                    <button
                      onClick={() => setDeleteIntelId(item.id)}
                      className="text-text-muted hover:text-accent shrink-0 cursor-pointer"
                      title="Supprimer cette information"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-2">
                  Info donnée par{' '}
                  <span className="text-accent">{item.submitter_codename}</span>
                  {' • '}
                  {new Date(item.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-border p-6 text-center">
            <p className="text-sm text-text-muted">Aucune information enregistrée.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {record && (
        <EditNinjaModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          record={record}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['ninja-record', id] });
            setEditModalOpen(false);
          }}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => deleteRecordMutation.mutate()}
        title="Supprimer le casier"
        message={`Êtes-vous sûr de vouloir supprimer le casier de ${record.name} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        danger
      />

      {/* Delete Intel Confirm */}
      <ConfirmDialog
        open={!!deleteIntelId}
        onClose={() => setDeleteIntelId(null)}
        onConfirm={() => {
          if (deleteIntelId) deleteIntelMutation.mutate(deleteIntelId);
          setDeleteIntelId(null);
        }}
        title="Supprimer l'information"
        message="Êtes-vous sûr de vouloir supprimer cette information ?"
        confirmLabel="Supprimer"
        danger
      />
    </div>
  );
}

function EditNinjaModal({
  open,
  onClose,
  record,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  record: { id: string; name: string; village: Village; photo_url: string | null; status_badge: StatusBadge | null };
  onSuccess: () => void;
}) {
  const [name, setName] = useState(record.name);
  const [village, setVillage] = useState<Village>(record.village);
  const [photoUrl, setPhotoUrl] = useState(record.photo_url ?? '');
  const [statusBadge, setStatusBadge] = useState<StatusBadge | ''>(record.status_badge ?? '');

  const mutation = useMutation({
    mutationFn: () =>
      updateNinjaRecord(record.id, {
        name: name.trim(),
        village,
        photo_url: photoUrl.trim() || null,
        status_badge: statusBadge || null,
      }),
    onSuccess: () => {
      toast.success('Casier modifié');
      onSuccess();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate();
  };

  return (
    <Modal open={open} onClose={onClose} title="Modifier le casier">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">Nom du ninja</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2.5 text-sm text-text-primary"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">Village</label>
          <select
            value={village}
            onChange={(e) => setVillage(e.target.value as Village)}
            className="w-full bg-background border border-border px-3 py-2.5 text-sm text-text-primary"
          >
            {VILLAGES.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">Photo (URL Imgur)</label>
          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2.5 text-sm text-text-primary placeholder-text-muted"
            placeholder="https://i.imgur.com/..."
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">Statut</label>
          <select
            value={statusBadge}
            onChange={(e) => setStatusBadge(e.target.value as StatusBadge | '')}
            className="w-full bg-background border border-border px-3 py-2.5 text-sm text-text-primary"
          >
            <option value="">Aucun</option>
            <option value="surveillance">À surveiller</option>
            <option value="traque">À traquer</option>
            <option value="mort">Personne morte</option>
          </select>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm bg-[#2a2a2a] text-text-primary hover:bg-[#333] transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={mutation.isPending || !name.trim()}
            className="px-4 py-2 text-sm bg-accent hover:bg-accent-hover disabled:opacity-50 text-white transition-colors cursor-pointer"
          >
            {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
