import React, { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, type = 'text', className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';

    const inputType = isPasswordType
      ? showPassword
        ? 'text'
        : 'password'
      : type;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[var(--text-main)] flex items-center justify-between">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={clsx(
              'w-full rounded-xl py-2.5 text-sm transition-all duration-200 outline-none',
              'bg-[var(--bg-card)] border text-[var(--text-main)] placeholder-[var(--text-muted)]',
              icon ? 'pl-10' : 'pl-4',
              isPasswordType ? 'pr-11' : 'pr-4',
              error
                ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
                : 'border-[var(--border-color)] focus:border-[#FF5C5C] focus:ring-2 focus:ring-[#FF5C5C]/30',
              className
            )}
            {...props}
          />

          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 text-[var(--text-muted)] hover:text-[#FF5C5C] transition-colors focus:outline-none cursor-pointer"
              title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {error && <span className="text-xs text-red-500 font-medium mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
