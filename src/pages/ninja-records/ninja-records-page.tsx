import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchNinjaRecords, createNinjaRecord } from '@/services/ninja-records';
import type { Village, StatusBadge } from '@/types';
import { VillageBadge, StatusBadgeComponent, SectionHeader, Modal } from '@/components/ui';

const VILLAGES: { value: Village | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'konoha', label: 'Konoha' },
  { value: 'suna', label: 'Suna' },
  { value: 'kiri', label: 'Kiri' },
  { value: 'oto', label: 'Oto' },
  { value: 'nukenin', label: 'Nukenin' },
  { value: 'samurai', label: 'Samouraï' },
  { value: 'deserteur', label: 'Déserteur' },
];

export default function NinjaRecordsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Village | 'all'>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const { data: records, isLoading } = useQuery({
    queryKey: ['ninja-records'],
    queryFn: fetchNinjaRecords,
  });

  const filtered = records?.filter((r) => {
    if (filter !== 'all' && r.village !== filter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-teko text-3xl tracking-widest uppercase text-text-primary">
            Casiers Ninjas
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Base de données du renseignement ANBU
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 text-sm transition-colors cursor-pointer"
        >
          + Nouveau casier
        </button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un ninja..."
          className="w-full bg-surface border border-border px-4 py-2.5 text-sm text-text-primary placeholder-text-muted"
        />
        <div className="flex gap-2 flex-wrap">
          {VILLAGES.map((v) => (
            <button
              key={v.value}
              onClick={() => setFilter(v.value)}
              className={`px-3 py-1 text-xs uppercase tracking-wider border transition-colors cursor-pointer ${
                filter === v.value
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-border text-text-secondary hover:border-accent hover:text-accent'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Records Grid */}
      <div>
        <SectionHeader title="Casiers" count={filtered?.length} />
        <div className="mt-4">
          {isLoading ? (
            <div className="bg-surface border border-border p-8 text-center">
              <p className="text-sm text-text-muted">Chargement...</p>
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((record) => (
                <NinjaRecordCard key={record.id} record={record} />
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border p-8 text-center">
              <p className="text-sm text-text-muted">Aucun casier ninja trouvé.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <CreateNinjaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['ninja-records'] });
          setModalOpen(false);
        }}
      />
    </div>
  );
}

function NinjaRecordCard({ record }: { record: { id: string; name: string; village: Village; photo_url: string | null; status_badge: StatusBadge | null; created_at: string } }) {
  return (
    <Link
      to={`/ninja-records/${record.id}`}
      className="bg-surface border border-border hover:border-accent/30 transition-colors group block"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 bg-[#2a2a2a] border border-border shrink-0 overflow-hidden">
            {record.photo_url ? (
              <img src={record.photo_url} alt={record.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted text-lg">
                👤
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
              {record.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <VillageBadge village={record.village} />
              <StatusBadgeComponent status={record.status_badge} />
            </div>
          </div>
        </div>
        <p className="text-xs text-text-muted">
          Ajouté le {new Date(record.created_at).toLocaleDateString('fr-FR')}
        </p>
      </div>
    </Link>
  );
}

function CreateNinjaModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [village, setVillage] = useState<Village>('konoha');
  const [photoUrl, setPhotoUrl] = useState('');
  const [statusBadge, setStatusBadge] = useState<StatusBadge | ''>('');

  const mutation = useMutation({
    mutationFn: () =>
      createNinjaRecord({
        name: name.trim(),
        village,
        photo_url: photoUrl.trim() || null,
        status_badge: statusBadge || null,
      }),
    onSuccess: () => {
      toast.success('Casier ninja créé');
      setName(''); setVillage('konoha'); setPhotoUrl(''); setStatusBadge('');
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
    <Modal open={open} onClose={onClose} title="Nouveau casier">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">
            Nom du ninja
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2.5 text-sm text-text-primary placeholder-text-muted"
            placeholder="Nom complet"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">
            Village
          </label>
          <select
            value={village}
            onChange={(e) => setVillage(e.target.value as Village)}
            className="w-full bg-background border border-border px-3 py-2.5 text-sm text-text-primary"
          >
            {VILLAGES.filter((v) => v.value !== 'all').map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
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
            {mutation.isPending ? 'Création...' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
