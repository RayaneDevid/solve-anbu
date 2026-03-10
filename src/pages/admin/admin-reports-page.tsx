import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/services/admin';
import { fetchAllReports } from '@/services/reports';
import AdminLayout from '@/components/admin-layout';
import { SectionHeader } from '@/components/ui';

export default function AdminReportsPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: allReports } = useQuery({
    queryKey: ['all-reports'],
    queryFn: fetchAllReports,
  });

  // Count reports per user
  const reportCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allReports?.forEach((r) => {
      counts[r.user_id] = (counts[r.user_id] || 0) + 1;
    });
    return counts;
  }, [allReports]);

  // Active users with at least one report possibility
  const activeUsers = users?.filter((u) => u.status === 'active') ?? [];

  const selectedReports = allReports?.filter((r) => r.user_id === selectedUserId) ?? [];
  const selectedUser = users?.find((u) => u.id === selectedUserId);

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        {/* Left panel: operatives list */}
        <div className="space-y-4">
          <SectionHeader title="Opératifs" />
          <div className="space-y-2">
            {activeUsers.length > 0 ? (
              activeUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full text-left p-3 transition-colors cursor-pointer ${
                    selectedUserId === user.id
                      ? 'bg-accent/10 border border-accent'
                      : 'bg-[#2a2a2a] border border-border hover:border-accent/30'
                  }`}
                >
                  <p className="text-sm font-medium text-text-primary">{user.codename}</p>
                  <p className="text-xs text-text-muted">
                    {reportCounts[user.id] || 0} rapport(s)
                  </p>
                </button>
              ))
            ) : (
              <p className="text-sm text-text-muted p-3">Aucun opératif.</p>
            )}
          </div>
        </div>

        {/* Right panel: reports */}
        <div>
          {selectedUserId ? (
            <div className="space-y-4">
              <SectionHeader
                title={`Casier de ${selectedUser?.codename ?? '—'}`}
                count={selectedReports.length}
              />
              {selectedReports.length > 0 ? (
                <div className="space-y-3">
                  {selectedReports.map((report) => (
                    <div key={report.id} className="bg-surface border border-border p-5">
                      <p className="text-xs text-text-muted">
                        {new Date(report.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-text-primary mt-3 whitespace-pre-wrap">{report.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface border border-border p-8 text-center">
                  <p className="text-sm text-text-muted">Aucun rapport pour cet opératif.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface border border-border p-12 text-center">
              <p className="text-sm text-text-muted">
                Sélectionnez un opératif pour voir son casier personnel.
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
