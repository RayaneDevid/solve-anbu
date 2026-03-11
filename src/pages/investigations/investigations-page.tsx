import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchInvestigations, createInvestigation } from '@/services/investigations';
import type { StatusBadge } from '@/types';
import { StatusBadgeComponent, SectionHeader, Modal } from '@/components/ui';

export default function InvestigationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { data: investigations, isLoading } = useQuery({
    queryKey: ['investigations'],
    queryFn: fetchInvestigations,
  });

  const filtered = investigations?.filter((inv) => {
    if (search && !inv.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-teko text-3xl tracking-widest uppercase text-text-primary">
            Enquêtes
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Forums d'investigation sur des groupes et organisations
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 text-sm transition-colors cursor-pointer"
        >
          + Nouvelle enquête
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher une enquête..."
        className="w-full bg-surface border border-border px-4 py-2.5 text-sm text-text-primary placeholder-text-muted"
      />

      {/* Grid */}
      <div>
        <SectionHeader title="Enquêtes" count={filtered?.length} />
        <div className="mt-4">
          {isLoading ? (
            <div className="bg-surface border border-border p-8 text-center">
              <p className="text-sm text-text-muted">Chargement...</p>
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((inv) => (
                <InvestigationCard key={inv.id} investigation={inv} />
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border p-8 text-center">
              <p className="text-sm text-text-muted">Aucune enquête trouvée.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <CreateInvestigationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['investigations'] });
          setModalOpen(false);
        }}
      />
    </div>
  );
}

function InvestigationCard({
  investigation,
}: {
  investigation: { id: string; title: string; description: string | null; photo_url: string | null; status_badge: StatusBadge | null; created_at: string };
}) {
  return (
    <Link
      to={`/investigations/${investigation.id}`}
      className="bg-surface border border-border hover:border-accent/30 transition-colors group block"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          <div className="w-12 h-12 bg-[#2a2a2a] border border-border shrink-0 overflow-hidden">
            {investigation.photo_url ? (
              <img src={investigation.photo_url} alt={investigation.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted">
                <IconSearch />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
              {investigation.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadgeComponent status={investigation.status_badge} />
            </div>
          </div>
        </div>
        {investigation.description && (
          <p className="text-xs text-text-secondary line-clamp-2">{investigation.description}</p>
        )}
        <p className="text-xs text-text-muted">
          Ouverte le {new Date(investigation.created_at).toLocaleDateString('fr-FR')}
        </p>
      </div>
    </Link>
  );
}

function IconSearch() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CreateInvestigationModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [statusBadge, setStatusBadge] = useState<StatusBadge | ''>('');

  const mutation = useMutation({
    mutationFn: () =>
      createInvestigation({
        title: title.trim(),
        description: description.trim() || null,
        photo_url: photoUrl.trim() || null,
        status_badge: statusBadge || null,
      }),
    onSuccess: () => {
      toast.success('Enquête créée');
      setTitle('');
      setDescription('');
      setPhotoUrl('');
      setStatusBadge('');
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
    <Modal open={open} onClose={onClose} title="Nouvelle enquête">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">
            Titre de l'enquête
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2.5 text-sm text-text-primary placeholder-text-muted"
            placeholder="Ex: Culte de Jashin, Akatsuki..."
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">
            Description (optionnel)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-background border border-border px-3 py-2.5 text-sm text-text-primary placeholder-text-muted resize-none"
            placeholder="Contexte de l'enquête..."
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">
            Photo (URL Imgur - optionnel)
          </label>
          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2.5 text-sm text-text-primary placeholder-text-muted"
            placeholder="https://i.imgur.com/..."
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">
            Statut
          </label>
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
            {mutation.isPending ? 'Création...' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
