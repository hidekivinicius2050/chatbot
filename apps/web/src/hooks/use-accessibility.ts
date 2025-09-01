import { useCallback, useEffect, useRef } from 'react';

interface UseAccessibilityOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  trapFocus?: boolean;
  announceMessage?: (message: string) => void;
}

export function useAccessibility({
  onEscape,
  onEnter,
  trapFocus = false,
  announceMessage
}: UseAccessibilityOptions = {}) {
  const containerRef = useRef<HTMLElement>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  // Função para anunciar mensagens via aria-live
  const announce = useCallback((message: string) => {
    if (announceMessage) {
      announceMessage(message);
    } else {
      // Fallback: usar o live region global
      const liveRegion = document.getElementById('live-region');
      if (liveRegion) {
        liveRegion.textContent = message;
        // Limpar após um tempo para permitir múltiplas mensagens
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 1000);
      }
    }
  }, [announceMessage]);

  // Gerenciar focus trap
  const handleFocusTrap = useCallback((event: KeyboardEvent) => {
    if (!trapFocus || !containerRef.current) return;

    const focusableElements = focusableElementsRef.current;
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab: navegar para trás
        if (document.activeElement === firstElement) {
          event.preventDefault();
          if (lastElement) {
            lastElement.focus();
          }
        }
      } else {
        // Tab: navegar para frente
        if (document.activeElement === lastElement) {
          event.preventDefault();
          if (firstElement) {
            firstElement.focus();
          }
        }
      }
    }
  }, [trapFocus]);

  // Atualizar lista de elementos focáveis
  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return;

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    const elements = containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors.join(','));
    focusableElementsRef.current = Array.from(elements);
  }, []);

  // Gerenciar teclas de atalho
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case 'Enter':
        if (onEnter && (event.target as HTMLElement).tagName === 'BUTTON') {
          event.preventDefault();
          onEnter();
        }
        break;
    }
  }, [onEscape, onEnter]);

  // Efeitos
  useEffect(() => {
    updateFocusableElements();
    
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    if (trapFocus) {
      container.addEventListener('keydown', handleFocusTrap);
    }

    // Observar mudanças no DOM para atualizar elementos focáveis
    const observer = new MutationObserver(updateFocusableElements);
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (trapFocus) {
        container.removeEventListener('keydown', handleFocusTrap);
      }
      observer.disconnect();
    };
  }, [handleKeyDown, handleFocusTrap, updateFocusableElements, trapFocus]);

  return {
    containerRef,
    announce,
    updateFocusableElements,
    focusableElements: focusableElementsRef.current
  };
}

// Hook para gerenciar focus visível
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = React.useState(false);

  useEffect(() => {
    const handleFocusIn = () => setIsFocusVisible(true);
    const handleFocusOut = () => setIsFocusVisible(false);

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return isFocusVisible;
}
