import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth-store';
import { changePassword } from '@/services/auth';
import { IconLock } from '@/components/icons';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Mot de passe modifié avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Erreur'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit faire au moins 6 caractères');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-teko text-3xl tracking-widest uppercase text-text-primary">
          Paramètres
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Gérer votre compte ANBU
        </p>
      </div>

      {/* Profile Info */}
      <div className="bg-surface border border-border p-6 space-y-3">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          Profil
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted">Nom de code</p>
            <p className="text-sm text-accent mt-1">{user?.codename}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted">Nom RP</p>
            <p className="text-sm text-text-primary mt-1">{user?.rp_name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted">Rôle</p>
            <p className="text-sm text-text-primary mt-1">{user?.role === 'chef_anbu' ? 'Chef ANBU' : 'ANBU'}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-surface border border-border p-6">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-6">
          <IconLock /> Modifier le mot de passe
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2.5 text-sm text-text-primary"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2.5 text-sm text-text-primary"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2.5 text-sm text-text-primary"
              autoComplete="new-password"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={mutation.isPending || !currentPassword || !newPassword || !confirmPassword}
              className="px-4 py-2 text-sm bg-accent hover:bg-accent-hover disabled:opacity-50 text-white transition-colors cursor-pointer"
            >
              {mutation.isPending ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
