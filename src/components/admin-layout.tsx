import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { path: '/admin/accounts', label: 'Gestion des comptes' },
  { path: '/admin/codes', label: 'Codes uniques' },
  { path: '/admin/personal-reports', label: 'Casiers personnels' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-teko text-3xl tracking-widest uppercase text-text-primary">
          Administration
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Gestion du commandement ANBU
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`px-5 py-3 text-sm font-medium transition-colors ${
              location.pathname === tab.path
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Tab content */}
      {children}
    </div>
  );
}
