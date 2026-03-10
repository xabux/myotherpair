import { cn } from '../../../lib/utils';

const variants = {
  default: 'bg-secondary text-secondary-foreground',
  outline: 'bg-black/40 backdrop-blur-md border border-white/20 text-white',
  left:    'bg-left-shoe/15 text-left-shoe border border-left-shoe/30',
  right:   'bg-right-shoe/15 text-right-shoe border border-right-shoe/30',
  match:   'bg-accent/90 text-accent-foreground',
  condition: 'bg-secondary text-secondary-foreground',
};

interface BadgeProps {
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
