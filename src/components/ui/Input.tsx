import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-broadway uppercase tracking-wider text-amber-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-[#0a0a10] border rounded-xl px-3.5 py-2.5 text-sm font-vintage text-amber-100 placeholder:text-amber-100/30 transition-all focus:outline-none focus:ring-1 ${
            error
              ? 'border-red-500/70 focus:border-red-400 focus:ring-red-500/40'
              : 'border-[#d4af37]/40 focus:border-[#d4af37] focus:ring-[#d4af37]/30'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-[11px] font-vintage text-red-400">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] font-vintage text-amber-200/50">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
