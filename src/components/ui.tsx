import type { Village, StatusBadge as StatusBadgeType, UserRole } from '@/types';
import { IconLeaf, IconWind, IconDroplet, IconMusic, IconSkull, IconSwords, IconBan, IconCircle } from '@/components/icons';
import type { ReactNode } from 'react';

// ── Village Badge ──

const VILLAGE_CONFIG: Record<Village, { label: string; icon: ReactNode; color: string }> = {
  konoha: { label: 'Konoha', icon: <IconLeaf />, color: '#22c55e' },
  suna: { label: 'Suna', icon: <IconWind />, color: '#eab308' },
  kiri: { label: 'Kiri', icon: <IconDroplet />, color: '#3b82f6' },
  oto: { label: 'Oto', icon: <IconMusic />, color: '#8b5cf6' },
  nukenin: { label: 'Nukenin', icon: <IconSkull />, color: '#ef4444' },
  samurai: { label: 'Samouraï', icon: <IconSwords />, color: '#94a3b8' },
  deserteur: { label: 'Déserteur', icon: <IconBan />, color: '#f97316' },
};

export function VillageBadge({ village }: { village: Village }) {
  const cfg = VILLAGE_CONFIG[village];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-sm"
      style={{
        backgroundColor: `${cfg.color}1a`,
        borderColor: cfg.color,
        color: cfg.color,
      }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ── Status Badge ──

const STATUS_CONFIG: Record<StatusBadgeType, { label: string; color: string }> = {
  surveillance: { label: 'À surveiller', color: '#eab308' },
  traque: { label: 'À traquer', color: '#ef4444' },
  mort: { label: 'Personne morte', color: '#888888' },
};

export function StatusBadgeComponent({ status }: { status: StatusBadgeType | null }) {
  if (!status) return null;
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-sm"
      style={{
        backgroundColor: `${cfg.color}1a`,
        borderColor: cfg.color,
        color: cfg.color,
      }}
    >
      <IconCircle fill={cfg.color} /> {cfg.label}
    </span>
  );
}

// ── Role Badge ──

export function RoleBadge({ role }: { role: UserRole }) {
  if (role === 'chef_anbu') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded-sm bg-[rgba(139,0,0,0.2)] border-accent text-accent">
        Chef ANBU
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded-sm bg-[#2a2a2a] border-border text-text-secondary">
      ANBU
    </span>
  );
}

// ── Section Header ──

export function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1 h-6 bg-accent rounded-sm" />
      <h2 className="text-xl font-semibold tracking-[0.4px] text-text-primary">
        {title}
        {count !== undefined && (
          <span className="text-text-secondary ml-2">({count})</span>
        )}
      </h2>
    </div>
  );
}

// ── Modal ──

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.8)]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-surface border-2 border-accent p-6">
        <h3 className="text-xl font-semibold text-text-primary mb-6">{title}</h3>
        {children}
      </div>
    </div>
  );
}

// ── Confirm Dialog ──

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  danger = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.8)]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-surface border-2 border-accent p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-3">{title}</h3>
        <p className="text-sm text-text-secondary mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-[#2a2a2a] text-text-primary hover:bg-[#333] transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 text-sm text-white transition-colors cursor-pointer ${
              danger ? 'bg-accent hover:bg-accent-hover' : 'bg-accent hover:bg-accent-hover'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
