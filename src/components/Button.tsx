import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import type React from 'react';
import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs';

  const variants = {
    primary:
      'bg-[#FF5C5C] hover:bg-[#E04848] text-white focus:ring-[#FF5C5C]/40 active:scale-[0.99]',
    secondary:
      'bg-[#2E2E2E] hover:bg-[#1E1E1E] text-white focus:ring-[#2E2E2E]/40 dark:bg-zinc-800 dark:hover:bg-zinc-700 active:scale-[0.99]',
    outline:
      'border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] focus:ring-[#FF5C5C]/30',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-600/40 active:scale-[0.99]',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Aguarde...</span>
        </>
      ) : (
        <>
          {icon && <span className="w-4 h-4">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
