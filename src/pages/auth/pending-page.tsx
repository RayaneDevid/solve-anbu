import { useAuthStore } from '@/stores/auth-store';
import { useNavigate } from 'react-router-dom';

export default function PendingPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* 暗部 watermark */}
      <span className="absolute text-[200px] font-teko text-white/[0.02] select-none pointer-events-none">
        暗部
      </span>

      <div className="max-w-md w-full px-4">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-4">
            <div className="absolute inset-0 blur-[24px] opacity-30 bg-[radial-gradient(circle,rgba(139,0,0,1)_0%,rgba(0,0,0,0)_70%)]" />
            <img
              src="/anbu-logo.png"
              alt="ANBU"
              className="relative w-20 h-20 object-contain drop-shadow-[0_0_24px_rgba(139,0,0,0.4)]"
            />
          </div>
          <h1 className="font-teko text-4xl tracking-[0.3em] text-accent uppercase">ANBU</h1>
          <p className="text-sm text-text-secondary tracking-widest">
            Forces Spéciales de Konoha
          </p>
        </div>

        <div className="bg-surface border border-border border-t-2 border-t-[#eab308] p-6 space-y-5 text-center">
          <div className="w-14 h-14 mx-auto border-2 border-[#eab308]/40 flex items-center justify-center">
            <div className="w-3 h-3 bg-[#eab308] rounded-full animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-text-primary">En attente de validation</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Votre compte <span className="text-text-primary font-semibold">{user?.codename}</span> a été enregistré.
              Un Chef ANBU doit valider votre accès avant que vous puissiez accéder au système.
            </p>
          </div>

          <p className="text-text-muted text-xs">
            Reconnectez-vous ultérieurement pour vérifier votre statut.
          </p>

          <button
            onClick={handleLogout}
            className="text-sm text-text-secondary hover:text-accent transition-colors cursor-pointer"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
