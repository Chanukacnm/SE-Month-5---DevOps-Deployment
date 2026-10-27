import { useEffect } from 'react';
import { notify } from '@/stores/notificationStore';

const EVENTS = [
  { kind: 'info', title: 'New sign-up', message: 'A new user joined from the Pricing page.' },
  { kind: 'warning', title: 'Payment retry', message: 'Invoice #10482 failed and will be retried in 1 hour.' },
  { kind: 'success', title: 'Export ready', message: 'Your monthly user export finished.' },
] as const;

/**
 * Stand-in for a server push channel (a real backend would use a WebSocket).
 * Pushes an inbox notification at a fixed interval while the user is signed in.
 */
export function useSimulatedEvents(enabled: boolean, intervalMs = 90_000) {
  useEffect(() => {
    if (!enabled) return;
    let i = 0;
    const timer = setInterval(() => {
      notify({ ...EVENTS[i % EVENTS.length], persist: true });
      i += 1;
    }, intervalMs);
    return () => clearInterval(timer);
  }, [enabled, intervalMs]);
}
