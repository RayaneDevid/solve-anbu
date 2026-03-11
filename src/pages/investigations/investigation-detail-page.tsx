import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth-store';
import {
  fetchInvestigation,
  fetchInvestigationIntel,
  fetchInvestigationPhotos,
  addInvestigationIntel,
  updateInvestigationIntel,
  deleteInvestigationIntel,
  addInvestigationPhoto,
  deleteInvestigation,
  updateInvestigation,
  updateInvestigationStatusBadge,
} from '@/services/investigations';
import type { StatusBadge } from '@/types';
import { StatusBadgeComponent, SectionHeader, Modal, ConfirmDialog } from '@/components/ui';
import { IconEdit, IconTrash, IconCircle } from '@/components/icons';

export default function InvestigationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isChefAnbu } = useAuthStore();

  const [newIntel, setNewIntel] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteIntelId, setDeleteIntelId] = useState<string | null>(null);
  const [editingIntelId, setEditingIntelId] = useState<string | null>(null);
  const [editingIntelContent, setEditingIntelContent] = useState('');

  const { data: investigation, isLoading } = useQuery({
    queryKey: ['investigation', id],
    queryFn: () => fetchInvestigation(id!),
    enabled: !!id,
  });

  const { data: intel } = useQuery({
    queryKey: ['investigation-intel', id],
    queryFn: () => fetchInvestigationIntel(id!),
    enabled: !!id,
  });

  const { data: photos } = useQuery({
    queryKey: ['investigation-photos', id],
    queryFn: () => fetchInvestigationPhotos(id!),
    enabled: !!id,
  });

  const addIntelMutation = useMutation({
    mutationFn: () => addInvestigationIntel(id!, newIntel.trim()),
    onSuccess: () => {
      toast.success('Information ajoutée');
      setNewIntel('');
      queryClient.invalidateQueries({ queryKey: ['investigation-intel', id] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const updateIntelMutation = useMutation({
    mutationFn: ({ intelId, content }: { intelId: string; content: string }) =>
      updateInvestigationIntel(intelId, content),
    onSuccess: () => {
      toast.success('Information modifiée');
      setEditingIntelId(null);
      queryClient.invalidateQueries({ queryKey: ['investigation-intel', id] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const deleteIntelMutation = useMutation({
    mutationFn: (intelId: string) => deleteInvestigationIntel(intelId),
    onSuccess: () => {
      toast.success('Information supprimée');
      queryClient.invalidateQueries({ queryKey: ['investigation-intel', id] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const addPhotoMutation = useMutation({
    mutationFn: () => addInvestigationPhoto(id!, newPhotoUrl.trim()),
    onSuccess: () => {
      toast.success('Photo ajoutée');
      setNewPhotoUrl('');
      setShowPhotoInput(false);
      queryClient.invalidateQueries({ queryKey: ['investigation-photos', id] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const deleteRecordMutation = useMutation({
    mutationFn: () => deleteInvestigation(id!),
    onSuccess: () => {
      toast.success('Enquête supprimée');
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
      navigate('/investigations');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const statusMutation = useMutation({
    mutationFn: (badge: StatusBadge | null) => updateInvestigationStatusBadge(id!, badge),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investigation', id] });
      queryClient.invalidateQueries({ queryKey: ['investigations'] });
    },
  });

  if (isLoading || !investigation) {
    return (
      <div className="space-y-6">
        <Link to="/investigations" className="text-sm text-text-secondary hover:text-accent transition-colors">
          ← Retour aux enquêtes
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
      <Link to="/investigations" className="inline-block text-sm text-text-secondary hover:text-accent transition-colors">
        ← Retour aux enquêtes
      </Link>

      {/* Header Card */}
      <div className="bg-surface border border-border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-5">
            {/* Thumbnail */}
            <div className="w-24 h-24 bg-[#2a2a2a] border-2 border-[rgba(139,0,0,0.3)] shrink-0 overflow-hidden">
              {investigation.photo_url ? (
                <img src={investigation.photo_url} alt={investigation.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted text-3xl">
                  <IconSearchLarge />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h1 className="text-[30px] font-bold text-text-primary leading-tight">{investigation.title}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadgeComponent status={investigation.status_badge} />
              </div>
              {investigation.description && (
                <p className="text-sm text-text-secondary mt-2">{investigation.description}</p>
              )}
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
                <IconEdit />
              </button>
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="p-2 bg-accent hover:bg-accent-hover text-white transition-colors cursor-pointer"
                title="Supprimer"
              >
                <IconTrash />
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
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs border transition-colors cursor-pointer ${
                  investigation.status_badge === badge
                    ? 'border-accent text-accent bg-accent/10'
                    : 'border-border text-text-secondary hover:border-accent/50'
                }`}
              >
                {badge === null ? 'Aucun' : badge === 'surveillance' ? <><IconCircle fill="#eab308" /> À surveiller</> : badge === 'traque' ? <><IconCircle fill="#ef4444" /> À traquer</> : <><IconCircle fill="#888" /> Classé</>}
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
            {intel.map((item) => {
              const canEdit = item.submitted_by === user?.id || isChefAnbu;
              const isEditing = editingIntelId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-[rgba(42,42,42,0.3)] border-l-2 border-l-accent p-4"
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingIntelContent}
                        onChange={(e) => setEditingIntelContent(e.target.value)}
                        rows={3}
                        className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingIntelId(null)}
                          className="px-3 py-1 text-xs bg-[#2a2a2a] text-text-primary hover:bg-[#333] transition-colors cursor-pointer"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => {
                            if (editingIntelContent.trim()) {
                              updateIntelMutation.mutate({ intelId: item.id, content: editingIntelContent.trim() });
                            }
                          }}
                          disabled={updateIntelMutation.isPending || !editingIntelContent.trim()}
                          className="px-3 py-1 text-xs bg-accent hover:bg-accent-hover disabled:opacity-50 text-white transition-colors cursor-pointer"
                        >
                          {updateIntelMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-text-primary whitespace-pre-wrap">{item.content}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditingIntelId(item.id);
                              setEditingIntelContent(item.content);
                            }}
                            className="text-text-muted hover:text-accent cursor-pointer"
                            title="Modifier cette information"
                          >
                            <IconEdit />
                          </button>
                        )}
                        {isChefAnbu && (
                          <button
                            onClick={() => setDeleteIntelId(item.id)}
                            className="text-text-muted hover:text-accent cursor-pointer"
                            title="Supprimer cette information"
                          >
                            <IconTrash />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-text-muted mt-2">
                    Info donnée par{' '}
                    <span className="text-accent">{item.submitter_codename}</span>
                    {' • '}
                    {new Date(item.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    {item.updated_at && item.updated_at !== item.created_at && (
                      <span className="text-text-muted"> (modifié)</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface border border-border p-6 text-center">
            <p className="text-sm text-text-muted">Aucune information enregistrée.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {investigation && (
        <EditInvestigationModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          investigation={investigation}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['investigation', id] });
            queryClient.invalidateQueries({ queryKey: ['investigations'] });
            setEditModalOpen(false);
          }}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => deleteRecordMutation.mutate()}
        title="Supprimer l'enquête"
        message={`Êtes-vous sûr de vouloir supprimer l'enquête "${investigation.title}" ? Cette action est irréversible.`}
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

function IconSearchLarge() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function EditInvestigationModal({
  open,
  onClose,
  investigation,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  investigation: { id: string; title: string; description: string | null; photo_url: string | null; status_badge: StatusBadge | null };
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState(investigation.title);
  const [description, setDescription] = useState(investigation.description ?? '');
  const [photoUrl, setPhotoUrl] = useState(investigation.photo_url ?? '');
  const [statusBadge, setStatusBadge] = useState<StatusBadge | ''>(investigation.status_badge ?? '');

  const mutation = useMutation({
    mutationFn: () =>
      updateInvestigation(investigation.id, {
        title: title.trim(),
        description: description.trim() || null,
        photo_url: photoUrl.trim() || null,
        status_badge: statusBadge || null,
      }),
    onSuccess: () => {
      toast.success('Enquête modifiée');
      onSuccess();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutation.mutate();
  };

  return (
    <Modal open={open} onClose={onClose} title="Modifier l'enquête">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">Titre</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2.5 text-sm text-text-primary"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-background border border-border px-3 py-2.5 text-sm text-text-primary resize-none"
          />
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
            <option value="mort">Classée</option>
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
            disabled={mutation.isPending || !title.trim()}
            className="px-4 py-2 text-sm bg-accent hover:bg-accent-hover disabled:opacity-50 text-white transition-colors cursor-pointer"
          >
            {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
