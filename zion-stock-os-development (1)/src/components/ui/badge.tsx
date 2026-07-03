import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-[var(--border)] bg-[var(--bg-hover)] text-[var(--text-primary)]",
        primary: "border-transparent bg-[var(--primary-muted)] text-[var(--primary)]",
        success: "border-transparent bg-[var(--success-muted)] text-[var(--success)]",
        warning: "border-transparent bg-[var(--warning-muted)] text-[var(--warning)]",
        destructive: "border-transparent bg-[var(--danger-muted)] text-[var(--danger)]",
        accent: "border-transparent bg-[var(--accent-muted)] text-[var(--accent)]",
        outline: "border-[var(--border)] text-[var(--text-secondary)]",
        secondary: "border-transparent bg-[var(--bg-hover)] text-[var(--text-secondary)]",
        gold: "border-transparent bg-[var(--accent)] text-[var(--text-inverse)] font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
