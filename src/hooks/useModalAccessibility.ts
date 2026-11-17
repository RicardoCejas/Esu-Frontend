import { useEffect } from 'react';

/**
 * Enforces mandatory modal body scroll lock (SSOT 7.2) and Escape-to-close behavior.
 */
export function useModalAccessibility(
  isOpen: boolean,
  onClose: () => void,
  disabled = false
): void {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disabled) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, disabled]);
}
