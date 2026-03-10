import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchMyReports, createReport, deleteReport } from '@/services/reports';
import { SectionHeader, ConfirmDialog } from '@/components/ui';

export default function MyReportsPage() {
  const queryClient = useQueryClient();
  const [newContent, setNewContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['my-reports'],
    queryFn: fetchMyReports,
  });

  const createMutation = useMutation({
    mutationFn: () => createReport(newContent.trim()),
    onSuccess: () => {
      toast.success('Rapport créé');
      setNewContent('');
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['my-reports'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReport(id),
    onSuccess: () => {
      toast.success('Rapport supprimé');
      queryClient.invalidateQueries({ queryKey: ['my-reports'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-teko text-3xl tracking-widest uppercase text-text-primary">
            Mon Casier Personnel
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Rapports de mission et notes personnelles — Confidentiel
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 text-sm transition-colors cursor-pointer"
        >
          + Nouveau rapport
        </button>
      </div>

      {/* New report form */}
      {showForm && (
        <div className="bg-surface border border-border p-5 space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">Nouveau rapport</h3>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Rédigez votre rapport de mission..."
            rows={5}
            className="w-full bg-background border border-border px-3 py-2 text-sm text-text-primary placeholder-text-muted resize-none"
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => { setShowForm(false); setNewContent(''); }}
              className="px-4 py-2 text-sm bg-[#2a2a2a] text-text-primary hover:bg-[#333] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              onClick={() => { if (newContent.trim()) createMutation.mutate(); }}
              disabled={createMutation.isPending || !newContent.trim()}
              className="px-4 py-2 text-sm bg-accent hover:bg-accent-hover disabled:opacity-50 text-white transition-colors cursor-pointer"
            >
              {createMutation.isPending ? 'Envoi...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}

      {/* Reports list */}
      <div className="space-y-4">
        <SectionHeader title="Rapports" count={reports?.length} />

        {isLoading ? (
          <div className="bg-surface border border-border p-8 text-center">
            <p className="text-sm text-text-muted">Chargement...</p>
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="bg-surface border border-border p-5">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-xs text-text-muted">
                    {new Date(report.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <button
                    onClick={() => setDeleteId(report.id)}
                    className="text-text-muted hover:text-accent shrink-0 cursor-pointer"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
                <p className="text-sm text-text-primary mt-3 whitespace-pre-wrap">{report.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-border p-8 text-center">
            <p className="text-sm text-text-muted">Aucun rapport de mission.</p>
          </div>
        )}
      </div>

      {/* Privacy notice */}
      <div className="bg-[rgba(42,42,42,0.5)] border border-[rgba(139,0,0,0.2)] p-4">
        <p className="text-xs text-text-secondary">
          🔒 Ces rapports sont privés et ne sont visibles que par vous et les Chefs ANBU.
        </p>
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
        title="Supprimer le rapport"
        message="Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action est irréversible."
        confirmLabel="Supprimer"
        danger
      />
    </div>
  );
}
