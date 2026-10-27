import { useEffect } from 'react';

/** Unique page titles help screen reader users know where they are (WCAG 2.4.2). */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · AdminFlow`;
  }, [title]);
}
