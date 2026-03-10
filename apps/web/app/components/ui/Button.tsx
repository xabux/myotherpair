import { cn } from '../../../lib/utils';
import { forwardRef } from 'react';

const variants = {
  default:  'bg-primary text-primary-foreground hover:bg-primary/90',
  accent:   'bg-accent text-accent-foreground hover:bg-accent/90',
  hero:     'gradient-warm text-accent-foreground shadow-elevated hover:shadow-glow',
  outline:  'border border-border bg-background text-foreground hover:bg-secondary',
  ghost:    'text-foreground hover:bg-secondary',
};

const sizes = {
  sm:   'h-8 px-3 text-xs rounded-lg',
  md:   'h-10 px-4 text-sm rounded-xl',
  lg:   'h-11 px-5 text-base rounded-xl',
  icon: 'h-10 w-10 rounded-xl',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
