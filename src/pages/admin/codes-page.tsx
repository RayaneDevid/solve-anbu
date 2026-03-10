import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchCodes, generateCode, revokeCode } from '@/services/admin';
import { SectionHeader, ConfirmDialog } from '@/components/ui';
import { IconKey } from '@/components/icons';
import AdminLayout from '@/components/admin-layout';
import { useState } from 'react';

export default function CodesPage() {
  const queryClient = useQueryClient();
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const { data: codes, isLoading } = useQuery({
    queryKey: ['codes'],
    queryFn: fetchCodes,
  });

  const generateMutation = useMutation({
    mutationFn: generateCode,
    onSuccess: () => {
      toast.success('Code généré');
      queryClient.invalidateQueries({ queryKey: ['codes'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const revokeMutation = useMutation({
    mutationFn: revokeCode,
    onSuccess: () => {
      toast.success('Code révoqué');
      queryClient.invalidateQueries({ queryKey: ['codes'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const available = codes?.filter((c) => c.status === 'available') ?? [];
  const used = codes?.filter((c) => c.status === 'used') ?? [];

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié');
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Generate button */}
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-4 py-2 text-sm transition-colors cursor-pointer"
        >
          <IconKey className="inline" /> Générer un code unique
        </button>

        {/* Available codes */}
        <div className="space-y-4">
          <SectionHeader title="Codes disponibles" count={available.length} />

          {isLoading ? (
            <div className="bg-surface border border-border p-8 text-center">
              <p className="text-sm text-text-muted">Chargement...</p>
            </div>
          ) : available.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {available.map((code) => (
                <div key={code.id} className="bg-[#2a2a2a] border border-border p-4 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-accent text-base tracking-wider">{code.code}</p>
                    <p className="text-xs text-text-muted mt-1">
                      Généré le {new Date(code.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => copyToClipboard(code.code)}
                      className="p-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                      title="Copier"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => setRevokeId(code.id)}
                      className="px-3 py-1 text-xs bg-accent hover:bg-accent-hover text-white transition-colors cursor-pointer"
                    >
                      Révoquer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border p-8 text-center">
              <p className="text-sm text-text-muted">Aucun code disponible.</p>
            </div>
          )}
        </div>

        {/* Used codes */}
        {used.length > 0 && (
          <div className="space-y-4">
            <SectionHeader title="Codes utilisés" count={used.length} />
            <div className="bg-surface border border-border">
              <div className="divide-y divide-border">
                {used.map((code) => (
                  <div key={code.id} className="px-5 py-3 flex items-center justify-between opacity-50">
                    <div>
                      <p className="font-mono text-sm text-text-secondary">{code.code}</p>
                      <p className="text-xs text-text-muted">
                        Utilisé le {code.used_at ? new Date(code.used_at).toLocaleDateString('fr-FR') : '—'}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted">Utilisé</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!revokeId}
        onClose={() => setRevokeId(null)}
        onConfirm={() => {
          if (revokeId) revokeMutation.mutate(revokeId);
          setRevokeId(null);
        }}
        title="Révoquer le code"
        message="Ce code ne pourra plus être utilisé pour s'inscrire."
        confirmLabel="Révoquer"
        danger
      />
    </AdminLayout>
  );
}
