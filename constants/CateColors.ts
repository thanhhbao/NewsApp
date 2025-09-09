// utils/catColors.ts
export type CatSolid = { tint: string; text: string; border: string };
export type CatSoft  = { bg: string; fg: string; border?: string };

function norm(cat?: string) {
  return (cat || 'general').trim().toLowerCase();
}

/* ====== Bảng màu đậm (solid) – dùng trên ảnh, chữ trắng ====== */
const SOLID: Record<string, CatSolid> = {
  sports:       { tint: '#10B981', text: '#FFFFFF', border: 'rgba(16,185,129,.35)' },
  politics:     { tint: '#334155', text: '#FFFFFF', border: 'rgba(51,65,85,.35)' },
  technology:   { tint: '#2563EB', text: '#FFFFFF', border: 'rgba(37,99,235,.35)' },
  tech:         { tint: '#2563EB', text: '#FFFFFF', border: 'rgba(37,99,235,.35)' },
  business:     { tint: '#EA580C', text: '#FFFFFF', border: 'rgba(234,88,12,.35)' },
  entertainment:{ tint: '#7C3AED', text: '#FFFFFF', border: 'rgba(124,58,237,.35)' },
  science:      { tint: '#475569', text: '#FFFFFF', border: 'rgba(71,85,105,.35)' },
  health:       { tint: '#16A34A', text: '#FFFFFF', border: 'rgba(22,163,74,.35)' },
  world:        { tint: '#0EA5E9', text: '#FFFFFF', border: 'rgba(14,165,233,.35)' },
  general:      { tint: '#111827', text: '#FFFFFF', border: 'rgba(17,24,39,.35)' },
};

export function getCatSolid(cat?: string): CatSolid {
  const k = norm(cat);
  return SOLID[k] ?? SOLID.general;
}

/* ====== Bảng màu mềm (soft) – dùng cho chip/tab, nền nhạt ====== */
const SOFT_MAP: Array<{ test: (s: string) => boolean; palette: CatSoft }> = [
  { test: s => /sport/.test(s),        palette: { bg: 'rgba(16,185,129,0.12)', fg: '#047857', border: 'rgba(16,185,129,0.2)' } },
  { test: s => /tech|technology/.test(s), palette:{ bg: 'rgba(37,99,235,0.12)',  fg:'#1D4ED8', border:'rgba(37,99,235,0.2)' } },
  { test: s => /business|finance/.test(s), palette:{ bg: 'rgba(234,88,12,0.12)', fg:'#C2410C', border:'rgba(234,88,12,0.2)' } },
  { test: s => /science/.test(s),      palette: { bg: 'rgba(30,41,59,0.10)',    fg: '#334155', border: 'rgba(30,41,59,0.18)' } },
  { test: s => /health|medical/.test(s),  palette:{ bg: 'rgba(22,163,74,0.12)', fg:'#15803D', border:'rgba(22,163,74,0.2)' } },
  { test: s => /entertain|movie|music/.test(s), palette:{ bg:'rgba(124,58,237,0.12)', fg:'#6D28D9', border:'rgba(124,58,237,0.2)' } },
  { test: s => /world|international/.test(s),   palette:{ bg:'rgba(14,165,233,0.12)', fg:'#0284C7', border:'rgba(14,165,233,0.2)' } },
  { test: s => /politic/.test(s),      palette: { bg: 'rgba(2,6,23,0.08)',      fg: '#0F172A', border: 'rgba(2,6,23,0.15)' } },
  { test: s => /general|top|news/.test(s),      palette:{ bg:'rgba(100,116,139,0.10)', fg:'#334155', border:'rgba(100,116,139,0.18)' } },
];

const SOFT_DEFAULT: CatSoft = { bg: 'rgba(17,24,39,0.08)', fg: '#111827', border: 'rgba(17,24,39,0.12)' };

export function getCatSoft(category?: string | null): CatSoft {
  const s = norm(category ?? undefined);
  return SOFT_MAP.find(m => m.test(s))?.palette ?? SOFT_DEFAULT;
}

/* ====== (tuỳ chọn) API tương thích cũ ====== */
export const cateColor = getCatSolid;  // backward compatibility
export const catColors = getCatSoft;
