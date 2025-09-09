// constants/theme.ts
import { Colors } from './Colors';

export type ThemeName = 'light' | 'dark';
export type AppTheme = {
  name: ThemeName;
  // semantic tokens dùng trong UI
  bg: string;          // nền màn hình
  card: string;        // nền card
  text: string;        // chữ chính
  subText: string;     // chữ phụ
  tint: string;        // màu brand / nhấn
  border: string;      // viền nhạt
  chipBg: string;      // nền chip nhẹ
  chipFg: string;      // chữ chip
  tabInactive: string; // icon/tab chưa chọn
};

export const LightTheme: AppTheme = {
  name: 'light',
  bg: Colors.background,
  card: Colors.white,
  text: Colors.black,
  subText: Colors.darkGrey,
  tint: Colors.tint,
  border: 'rgba(0,0,0,0.08)',
  chipBg: 'rgba(0,0,0,0.06)',
  chipFg: Colors.softText,
  tabInactive: Colors.tabIconDefault,
};

export const DarkTheme: AppTheme = {
  name: 'dark',
  bg: '#0B1220',
  card: '#121826',
  text: '#E5E7EB',
  subText: '#94A3B8',
  tint: Colors.tint,             // có thể đổi nếu muốn
  border: 'rgba(255,255,255,0.08)',
  chipBg: 'rgba(255,255,255,0.06)',
  chipFg: '#CBD5E1',
  tabInactive: '#9AA4AE',
};

export const THEMES = { light: LightTheme, dark: DarkTheme };
