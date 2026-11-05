import { useEffect, useRef, useState } from 'react';
import { api, getToken } from '../lib/api';
import { mapDeal, type Deal } from '../lib/deals';

const POLL_MS = 15000;
const SEEN_KEY = 'ridebhai_admin_seen_deal_ids';

function loadSeen(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    // ignore storage failures (private mode, quota, etc.)
  }
  return new Set();
}

function saveSeen(ids: Set<string>) {
  try {
    sessionStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(ids).slice(-500)));
  } catch {
    // ignore storage failures
  }
}

/** Polls Ride Bhai channel deals/inquiries and surfaces ones that arrived after this hook first loaded. */
export function useNewDealAlerts(enabled: boolean) {
  const [queue, setQueue] = useState<Deal[]>([]);
  const seenRef = useRef<Set<string>>(loadSeen());
  const primedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    let stopped = false;

    const poll = async () => {
      if (!getToken()) return;
      try {
        const rows = await api<any[]>('/admin/deals?channel=ridebhai&status=all');
        if (stopped) return;
        const seen = seenRef.current;
        const fresh: Deal[] = [];
        for (const row of rows || []) {
          const deal = mapDeal(row);
          if (seen.has(deal.id)) continue;
          seen.add(deal.id);
          if (primedRef.current) fresh.push(deal);
        }
        saveSeen(seen);
        if (!primedRef.current) {
          primedRef.current = true;
        } else if (fresh.length) {
          setQueue((q) => [...q, ...fresh]);
        }
      } catch {
        // ignore network hiccups, next poll will retry
      }
    };

    poll();
    const id = window.setInterval(poll, POLL_MS);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [enabled]);

  const dismiss = () => setQueue((q) => q.slice(1));

  return { current: queue[0] || null, dismiss };
}
