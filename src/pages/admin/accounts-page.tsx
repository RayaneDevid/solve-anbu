import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchUsers, approveUser, rejectUser, deactivateUser, reactivateUser } from '@/services/admin';
import { RoleBadge, SectionHeader, ConfirmDialog } from '@/components/ui';
import AdminLayout from '@/components/admin-layout';
import { useState } from 'react';

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const approveMutation = useMutation({
    mutationFn: approveUser,
    onSuccess: () => {
      toast.success('Compte validé');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectUser,
    onSuccess: () => {
      toast.success('Inscription refusée');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      toast.success('Compte désactivé');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateUser,
    onSuccess: () => {
      toast.success('Compte réactivé');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const pending = users?.filter((u) => u.status === 'pending') ?? [];
  const active = users?.filter((u) => u.status === 'active') ?? [];
  const deactivated = users?.filter((u) => u.status === 'deactivated') ?? [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Pending Section */}
        {pending.length > 0 && (
          <div className="space-y-4">
            <SectionHeader title="En attente de validation" count={pending.length} />
            <div className="bg-surface border border-border">
              <div className="divide-y divide-border">
                {pending.map((user) => (
                  <div key={user.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-text-primary">{user.codename}</span>
                      <span className="text-sm text-text-secondary">{user.rp_name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveMutation.mutate(user.id)}
                        disabled={approveMutation.isPending}
                        className="px-3 py-1 text-xs bg-[#1B4332] hover:bg-[#1B4332]/80 text-white transition-colors cursor-pointer"
                      >
                        Valider
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(user.id)}
                        disabled={rejectMutation.isPending}
                        className="px-3 py-1 text-xs bg-accent hover:bg-accent-hover text-white transition-colors cursor-pointer"
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Accounts */}
        <div className="space-y-4">
          <SectionHeader title="Comptes actifs" count={active.length} />
          {isLoading ? (
            <div className="bg-surface border border-border p-8 text-center">
              <p className="text-sm text-text-muted">Chargement...</p>
            </div>
          ) : active.length > 0 ? (
            <div className="bg-surface border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted text-xs uppercase tracking-widest">
                    <th className="text-left px-5 py-3 font-medium">Pseudo ANBU</th>
                    <th className="text-left px-5 py-3 font-medium">Nom RP</th>
                    <th className="text-left px-5 py-3 font-medium">Rôle</th>
                    <th className="text-left px-5 py-3 font-medium">Inscription</th>
                    <th className="text-right px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {active.map((user) => (
                    <tr key={user.id}>
                      <td className="px-5 py-3 text-text-primary font-medium">{user.codename}</td>
                      <td className="px-5 py-3 text-text-secondary">{user.rp_name}</td>
                      <td className="px-5 py-3"><RoleBadge role={user.role} /></td>
                      <td className="px-5 py-3 text-text-muted">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setDeactivateId(user.id)}
                          className="px-3 py-1 text-xs bg-[#2a2a2a] hover:bg-[#333] text-text-primary transition-colors cursor-pointer"
                        >
                          Désactiver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-surface border border-border p-8 text-center">
              <p className="text-sm text-text-muted">Aucun compte actif.</p>
            </div>
          )}
        </div>

        {/* Deactivated Accounts */}
        {deactivated.length > 0 && (
          <div className="space-y-4">
            <SectionHeader title="Comptes désactivés" count={deactivated.length} />
            <div className="bg-surface border border-border">
              <div className="divide-y divide-border">
                {deactivated.map((user) => (
                  <div key={user.id} className="flex items-center justify-between px-5 py-3 opacity-60">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-text-secondary">{user.codename}</span>
                      <span className="text-sm text-text-muted">{user.rp_name}</span>
                    </div>
                    <button
                      onClick={() => reactivateMutation.mutate(user.id)}
                      disabled={reactivateMutation.isPending}
                      className="px-3 py-1 text-xs bg-[#2a2a2a] hover:bg-[#333] text-text-primary transition-colors cursor-pointer"
                    >
                      Réactiver
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deactivateId}
        onClose={() => setDeactivateId(null)}
        onConfirm={() => {
          if (deactivateId) deactivateMutation.mutate(deactivateId);
          setDeactivateId(null);
        }}
        title="Désactiver le compte"
        message="Voulez-vous désactiver ce compte ? L'utilisateur ne pourra plus se connecter et ses contributions seront anonymisées."
        confirmLabel="Désactiver"
        danger
      />
    </AdminLayout>
  );
}
