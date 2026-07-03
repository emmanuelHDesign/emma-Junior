import React from 'react';
import { LucideIcon } from 'lucide-react';
import { MotionButton } from './button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon, title, description, actionLabel, onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-20 h-20 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-[var(--text-muted)]" />
      </div>
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] text-center max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <MotionButton variant="accent" onClick={onAction}>
          {actionLabel}
        </MotionButton>
      )}
    </div>
  );
};
