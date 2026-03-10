import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import { fetchNinjaRecords } from '@/services/ninja-records';
import { fetchMyReports } from '@/services/reports';
import { fetchUsers } from '@/services/admin';
import { SectionHeader } from '@/components/ui';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user, isChefAnbu } = useAuthStore();

  const { data: records } = useQuery({
    queryKey: ['ninja-records'],
    queryFn: fetchNinjaRecords,
  });

  const { data: reports } = useQuery({
    queryKey: ['my-reports'],
    queryFn: fetchMyReports,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: isChefAnbu,
  });

  const pendingCount = users?.filter((u) => u.status === 'pending').length ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-teko text-3xl tracking-widest uppercase text-text-primary">
          Tableau de bord
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Bienvenue, <span className="text-accent">{user?.codename}</span>
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/ninja-records" className="group">
          <StatCard label="Casiers Ninjas" value={String(records?.length ?? '—')} />
        </Link>
        <Link to="/my-reports" className="group">
          <StatCard label="Mes Rapports" value={String(reports?.length ?? '—')} />
        </Link>
        {isChefAnbu && (
          <Link to="/admin/accounts" className="group">
            <StatCard
              label="Comptes en attente"
              value={String(pendingCount)}
              highlight={pendingCount > 0}
            />
          </Link>
        )}
      </div>

      {/* Recent ninja records */}
      <div className="space-y-4">
        <SectionHeader title="Derniers casiers ajoutés" />
        <div className="bg-surface border border-border">
          {records && records.length > 0 ? (
            <div className="divide-y divide-border">
              {records.slice(0, 5).map((r) => (
                <Link
                  key={r.id}
                  to={`/ninja-records/${r.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-surface-light transition-colors"
                >
                  <span className="text-sm text-text-primary">{r.name}</span>
                  <span className="text-xs text-text-muted">
                    {new Date(r.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="p-6 text-sm text-text-muted text-center">Aucun casier enregistré.</p>
          )}
        </div>
      </div>

      {/* Recent reports */}
      <div className="space-y-4">
        <SectionHeader title="Mes derniers rapports" />
        <div className="bg-surface border border-border">
          {reports && reports.length > 0 ? (
            <div className="divide-y divide-border">
              {reports.slice(0, 5).map((r) => (
                <Link
                  key={r.id}
                  to="/my-reports"
                  className="flex items-center justify-between px-5 py-3 hover:bg-surface-light transition-colors"
                >
                  <span className="text-sm text-text-primary line-clamp-1">{r.content}</span>
                  <span className="text-xs text-text-muted shrink-0 ml-4">
                    {new Date(r.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="p-6 text-sm text-text-muted text-center">Aucun rapport de mission.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-surface border border-border p-5 group-hover:border-accent/30 transition-colors">
      <p className="text-xs uppercase tracking-widest text-text-muted">{label}</p>
      <p className={`font-teko text-3xl mt-1 ${highlight ? 'text-[#eab308]' : 'text-text-primary'}`}>
        {value}
      </p>
    </div>
  );
}
