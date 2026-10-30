import React, { forwardRef, ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const VARIANT_STYLES: Record<NonNullable<ButtonProps['variant']>, string> = {
  gold: 'bg-gold-gradient text-slate-950 font-black shadow-deco-gold hover:brightness-110 active:brightness-95 border border-[#f5eedb]/80',
  secondary: 'bg-[#14141e] hover:bg-[#1f1f2e] text-amber-200 border border-[#d4af37]/40 hover:border-[#d4af37]/70',
  danger: 'bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/50 hover:border-red-400',
  ghost: 'bg-transparent hover:bg-amber-500/10 text-amber-200 border border-transparent',
  outline: 'bg-transparent border border-[#d4af37] text-amber-300 hover:bg-[#d4af37]/10',
};

const SIZE_STYLES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-2.5 py-1 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-xs sm:text-sm rounded-xl gap-2',
  lg: 'px-6 py-3.5 text-sm sm:text-base rounded-2xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'gold',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`font-broadway uppercase tracking-wider inline-flex items-center justify-center transition-all duration-150 select-none active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 ${
          VARIANT_STYLES[variant]
        } ${SIZE_STYLES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
