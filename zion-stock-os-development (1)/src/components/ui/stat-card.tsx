import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  delta?: { value: string; positive: boolean };
  accent?: 'primary' | 'accent' | 'success' | 'danger' | 'warning';
  className?: string;
}

const accentMap = {
  primary: { bg: 'var(--primary-muted)', color: 'var(--primary)', glow: 'var(--glow-primary)' },
  accent: { bg: 'var(--accent-muted)', color: 'var(--accent)', glow: 'var(--glow-accent)' },
  success: { bg: 'var(--success-muted)', color: 'var(--success)', glow: '0 0 20px rgba(52,211,153,0.12)' },
  danger: { bg: 'var(--danger-muted)', color: 'var(--danger)', glow: 'var(--glow-danger)' },
  warning: { bg: 'var(--warning-muted)', color: 'var(--warning)', glow: '0 0 20px rgba(251,191,36,0.12)' },
};

export const StatCard: React.FC<StatCardProps> = ({
  title, value, icon: Icon, delta, accent = 'primary', className
}) => {
  const colors = accentMap[accent];

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: colors.glow }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 cursor-default",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--text-muted)]">{title}</p>
          <p className="text-2xl font-bold tracking-tight animate-count">{value}</p>
          {delta && (
            <div className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold rounded-lg px-2 py-0.5",
              delta.positive
                ? "bg-[var(--success-muted)] text-[var(--success)]"
                : "bg-[var(--danger-muted)] text-[var(--danger)]"
            )}>
              {delta.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {delta.value}
            </div>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: colors.bg }}
        >
          <Icon className="w-6 h-6" style={{ color: colors.color }} />
        </div>
      </div>
    </motion.div>
  );
};
