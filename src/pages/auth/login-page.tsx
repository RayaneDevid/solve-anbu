import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { login } from '@/services/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [codename, setCodename] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: storeLogin } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codename.trim() || !password) return;

    setLoading(true);
    try {
      const res = await login({ codename: codename.trim(), password });
      storeLogin(res.token, res.user);

      if (res.user.status === 'pending') {
        navigate('/pending');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-[#141414] border border-[#333] border-t-2 border-t-accent p-6 space-y-5 shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-blur-none">
        <h2 className="text-lg font-semibold text-text-primary tracking-wide">Connexion</h2>

        <div>
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">
            Pseudo ANBU
          </label>
          <input
            type="text"
            value={codename}
            onChange={(e) => setCodename(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2.5 text-sm text-text-primary placeholder-text-muted"
            placeholder="Nom de code"
            autoComplete="username"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2.5 text-sm text-text-primary placeholder-text-muted"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white py-2.5 text-sm uppercase tracking-widest transition-colors cursor-pointer"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </div>

      <p className="text-center text-xs text-text-muted">
        Nouvelle recrue ?{' '}
        <Link to="/register" className="text-accent hover:underline">
          Inscription
        </Link>
      </p>
    </form>
  );
}
