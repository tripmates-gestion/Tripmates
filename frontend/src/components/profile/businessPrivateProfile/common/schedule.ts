import { type TimeLike } from './types';

export function parseTimeLike(t: TimeLike): { h: number; m: number } | null {
  if (!t) return null;
  if (typeof t === 'string') {
    const m = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    return { h: Number(m[1]), m: Number(m[2]) };
  }
  if (typeof t === 'object') {
    return { h: Number(t.hour ?? 0), m: Number(t.minute ?? 0) };
  }
  return null;
}

export function formatScheduleForInput(att?: { openingTime?: TimeLike; closingTime?: TimeLike }) {
  if (!att) return '';
  const o = parseTimeLike(att.openingTime);
  const c = parseTimeLike(att.closingTime);
  if (!o || !c) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(o.h)}:${pad(o.m)}–${pad(c.h)}:${pad(c.m)}`;
}

export function scheduleFromInput(input: string) {
  if (!input) return undefined;
  const norm = input.replace(/\s+/g,'').replace('–','-');
  const m = norm.match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);
  if (!m) return undefined;
  const pad = (s:string)=>s.padStart(2,'0');
  return { openingTime: `${pad(m[1])}:${pad(m[2])}`, closingTime: `${pad(m[3])}:${pad(m[4])}` };
}

export const labelDays: Record<string,string> = {
  MONDAY:'Lun', TUESDAY:'Mar', WEDNESDAY:'Mié', THURSDAY:'Jue',
  FRIDAY:'Vie', SATURDAY:'Sáb', SUNDAY:'Dom'
};
