export type TimeLike = string | { hour: number; minute?: number | null } | null | undefined;

function parseTimeLike(t: TimeLike): { h: number; m: number } | null {
  if (!t) return null;
  if (typeof t === 'string') {
    const m = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    return { h: Number(m[1]), m: Number(m[2]) };
  }
  if (typeof t === 'object' && 'hour' in t) return { h: Number(t.hour), m: Number(t.minute ?? 0) };
  return null;
}

export function formatHours(att?: { openingTime?: TimeLike; closingTime?: TimeLike }) {
  const o = parseTimeLike(att?.openingTime);
  const c = parseTimeLike(att?.closingTime);
  if (!o || !c) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(o.h)}:${pad(o.m)}–${pad(c.h)}:${pad(c.m)}`;
}