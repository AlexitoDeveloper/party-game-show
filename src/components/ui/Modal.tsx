import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${maxWidth} bg-[#0c0c14] border-2 border-[#d4af37]/70 rounded-3xl p-5 sm:p-6 shadow-deco-gold relative z-10 flex flex-col space-y-4`}
      >
        <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-3">
          <div className="text-base sm:text-lg font-broadway uppercase tracking-wider text-gold-gradient">
            {title}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1 rounded-lg text-amber-200/60 hover:text-amber-100 hover:bg-[#1f1f2e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-amber-100 font-vintage">{children}</div>
      </div>
    </div>
  );
};
