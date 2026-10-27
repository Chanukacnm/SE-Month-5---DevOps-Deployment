import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SPA navigations don't trigger a page load, so screen readers stay silent and
 * focus stays on the clicked link. On every route change this moves focus to
 * the page's <h1> and announces the new title.
 */
export function RouteAnnouncer() {
  const { pathname } = useLocation();
  const [message, setMessage] = useState('');
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // Wait a frame so lazy pages have rendered their heading and set document.title.
    const id = window.setTimeout(() => {
      const heading = document.querySelector<HTMLElement>('main h1');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: false });
      }
      setMessage(document.title);
    }, 120);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {message}
    </p>
  );
}
