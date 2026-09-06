const TZ = 'Asia/Kolkata';

function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ });
}

function todayKey() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ });
}

function yesterdayKey() {
  const [y, m, d] = todayKey().split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
}

export function chatDayLabel(iso: string) {
  const day = dayKey(iso);
  if (day === todayKey()) return 'Today';
  if (day === yesterdayKey()) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: TZ,
  });
}

export function chatListTime(iso?: string) {
  if (!iso) return '';
  const label = chatDayLabel(iso);
  if (label === 'Today') return chatClock(iso);
  if (label === 'Yesterday') return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: TZ,
  });
}

export function chatClock(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: TZ,
  });
}

export function withDaySeparators<T extends { id: string; created_at?: string; createdAt?: string }>(messages: T[]) {
  const out: Array<{ type: 'day'; label: string; id: string } | { type: 'msg'; msg: T }> = [];
  let last = '';
  for (const msg of messages) {
    const iso = msg.created_at || msg.createdAt || '';
    if (!iso) {
      out.push({ type: 'msg', msg });
      continue;
    }
    const label = chatDayLabel(iso);
    if (label !== last) {
      out.push({ type: 'day', label, id: `day-${msg.id}` });
      last = label;
    }
    out.push({ type: 'msg', msg });
  }
  return out;
}
