import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import anbuLogo from '/anbu-logo.png';

function IconDashboard({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconFolder({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z" />
    </svg>
  );
}

function IconLogout({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const NAV_ITEMS = [
  { path: '/', label: 'Tableau de bord', icon: IconDashboard },
  { path: '/ninja-records', label: 'Casiers Ninjas', icon: IconUsers },
  { path: '/my-reports', label: 'Mon Casier Personnel', icon: IconFolder },
];

const ADMIN_NAV = { path: '/admin/accounts', label: 'Gestion', icon: IconSettings };

export default function Navbar() {
  const { user, isChefAnbu, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isAdminActive = location.pathname.startsWith('/admin');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-[1280px] mx-auto h-16 flex items-center justify-between px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 blur-[16px] opacity-25 bg-[radial-gradient(circle,rgba(139,0,0,1)_0%,rgba(0,0,0,0)_70%)]" />
            <img
              src={anbuLogo}
              alt="ANBU"
              className="relative w-10 h-10 object-contain drop-shadow-[0_0_16px_rgba(139,0,0,0.3)]"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-accent text-lg leading-7 tracking-[0.9px] font-rajdhani">ANBU</span>
            <span className="text-text-secondary text-xs leading-4">暗部</span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 h-[42px] text-base font-rajdhani transition-colors ${
                isActive(item.path)
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <item.icon />
              {item.label}
            </Link>
          ))}
          {isChefAnbu && (
            <Link
              to={ADMIN_NAV.path}
              className={`flex items-center gap-2 px-4 h-[42px] text-base font-rajdhani transition-colors ${
                isAdminActive
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <ADMIN_NAV.icon />
              {ADMIN_NAV.label}
            </Link>
          )}
        </nav>

        {/* User Info + Logout */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-sm text-text-primary leading-5">{user?.codename}</p>
            <p className="text-xs text-text-secondary leading-4">
              {isChefAnbu ? 'Chef ANBU' : 'ANBU'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-1 py-1 text-sm text-text-primary hover:text-accent transition-colors cursor-pointer"
          >
            <IconLogout />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
}
