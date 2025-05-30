import { useEffect, useRef, useCallback } from "react";

/**
 * Hook for managing focus and keyboard navigation
 */
export const useFocusManagement = () => {
  const focusableElementsSelector = [
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  const trapFocus = useCallback((container) => {
    if (!container) return;

    const focusableElements = container.querySelectorAll(focusableElementsSelector);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [focusableElementsSelector]);

  const restoreFocus = useCallback((element) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }, []);

  const moveFocus = useCallback((direction, container) => {
    if (!container) return;

    const focusableElements = Array.from(
      container.querySelectorAll(focusableElementsSelector)
    );
    const currentIndex = focusableElements.indexOf(document.activeElement);

    let nextIndex;
    switch (direction) {
      case 'next':
        nextIndex = currentIndex + 1;
        if (nextIndex >= focusableElements.length) nextIndex = 0;
        break;
      case 'previous':
        nextIndex = currentIndex - 1;
        if (nextIndex < 0) nextIndex = focusableElements.length - 1;
        break;
      case 'first':
        nextIndex = 0;
        break;
      case 'last':
        nextIndex = focusableElements.length - 1;
        break;
      default:
        return;
    }

    focusableElements[nextIndex]?.focus();
  }, [focusableElementsSelector]);

  return { trapFocus, restoreFocus, moveFocus };
};

/**
 * Hook for managing ARIA live regions
 */
export const useAriaLive = () => {
  const liveRegionRef = useRef(null);

  useEffect(() => {
    // Create live region if it doesn't exist
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = 'roadmap-editor-live-region';
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return () => {
      if (liveRegionRef.current && document.body.contains(liveRegionRef.current)) {
        document.body.removeChild(liveRegionRef.current);
      }
    };
  }, []);

  const announce = useCallback((message, priority = 'polite') => {
    if (!liveRegionRef.current) return;

    liveRegionRef.current.setAttribute('aria-live', priority);
    liveRegionRef.current.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = '';
      }
    }, 1000);
  }, []);

  return { announce };
};

/**
 * Hook for keyboard navigation in lists
 */
export const useListNavigation = (items, onSelect) => {
  const containerRef = useRef(null);
  const activeIndexRef = useRef(-1);

  const handleKeyDown = useCallback((e) => {
    if (!items || items.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        activeIndexRef.current = Math.min(activeIndexRef.current + 1, items.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        activeIndexRef.current = Math.max(activeIndexRef.current - 1, 0);
        break;
      case 'Home':
        e.preventDefault();
        activeIndexRef.current = 0;
        break;
      case 'End':
        e.preventDefault();
        activeIndexRef.current = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndexRef.current >= 0 && onSelect) {
          onSelect(items[activeIndexRef.current], activeIndexRef.current);
        }
        break;
      default:
        return;
    }

    // Update visual focus
    const container = containerRef.current;
    if (container) {
      const activeElement = container.children[activeIndexRef.current];
      if (activeElement) {
        activeElement.focus();
      }
    }
  }, [items, onSelect]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  return { containerRef, activeIndex: activeIndexRef.current };
};

/**
 * Hook for managing modal accessibility
 */
export const useModalAccessibility = (isOpen) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const { trapFocus, restoreFocus } = useFocusManagement();

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement;

      // Trap focus in modal
      const cleanup = trapFocus(modalRef.current);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        cleanup?.();
        document.body.style.overflow = '';
        
        // Restore focus
        setTimeout(() => {
          restoreFocus(previousFocusRef.current);
        }, 0);
      };
    }
  }, [isOpen, trapFocus, restoreFocus]);

  return { modalRef };
};

/**
 * Hook for managing drag and drop accessibility
 */
export const useDragDropAccessibility = () => {
  const { announce } = useAriaLive();

  const announceDropStart = useCallback((itemName) => {
    announce(`Started dragging ${itemName}. Use arrow keys to move, Enter to drop, Escape to cancel.`);
  }, [announce]);

  const announceDropEnd = useCallback((itemName, success, newPosition) => {
    if (success) {
      announce(`${itemName} moved to position ${newPosition}`);
    } else {
      announce(`${itemName} drop cancelled`);
    }
  }, [announce]);

  const announceDropTarget = useCallback((targetName) => {
    announce(`Drop target: ${targetName}`);
  }, [announce]);

  return {
    announceDropStart,
    announceDropEnd,
    announceDropTarget
  };
};

/**
 * Hook for managing form accessibility
 */
export const useFormAccessibility = () => {
  const { announce } = useAriaLive();

  const announceValidationError = useCallback((fieldName, error) => {
    announce(`Error in ${fieldName}: ${error}`, 'assertive');
  }, [announce]);

  const announceValidationSuccess = useCallback((fieldName) => {
    announce(`${fieldName} is valid`);
  }, [announce]);

  const announceFormSubmission = useCallback((success, message) => {
    announce(message, success ? 'polite' : 'assertive');
  }, [announce]);

  return {
    announceValidationError,
    announceValidationSuccess,
    announceFormSubmission
  };
};

/**
 * Hook for managing reduced motion preferences
 */
export const useReducedMotion = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getAnimationClass = useCallback((normalClass, reducedClass = '') => {
    return prefersReducedMotion ? reducedClass : normalClass;
  }, [prefersReducedMotion]);

  const getTransitionDuration = useCallback((normalDuration, reducedDuration = '0ms') => {
    return prefersReducedMotion ? reducedDuration : normalDuration;
  }, [prefersReducedMotion]);

  return {
    prefersReducedMotion,
    getAnimationClass,
    getTransitionDuration
  };
};

/**
 * Hook for managing high contrast mode
 */
export const useHighContrast = () => {
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

  const getContrastClass = useCallback((normalClass, highContrastClass) => {
    return prefersHighContrast ? highContrastClass : normalClass;
  }, [prefersHighContrast]);

  return {
    prefersHighContrast,
    getContrastClass
  };
};
