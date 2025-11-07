import { useEffect } from 'react';

/**
 * Hook to save and restore scroll position
 * Useful when navigating back from tool detail view
 */
export function useScrollRestoration(key: string) {
  useEffect(() => {
    // Restore scroll position on mount
    const savedPosition = sessionStorage.getItem(`scroll-${key}`);
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10));
    }

    // Save scroll position on scroll
    const handleScroll = () => {
      sessionStorage.setItem(`scroll-${key}`, window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [key]);

  // Function to manually save current position
  const savePosition = () => {
    sessionStorage.setItem(`scroll-${key}`, window.scrollY.toString());
  };

  // Function to manually restore position
  const restorePosition = () => {
    const savedPosition = sessionStorage.getItem(`scroll-${key}`);
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10));
    }
  };

  return { savePosition, restorePosition };
}
