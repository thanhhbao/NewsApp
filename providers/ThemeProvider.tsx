// providers/ThemeProvider.tsx
import React, { createContext, useContext, useMemo, useState, PropsWithChildren } from 'react';

export type ThemeName = 'light' | 'dark';

export type AppTheme = {
  name: ThemeName;
  bg: string;            // màu nền màn
  card: string;          // nền card (glass overlay dùng thêm alpha bên ngoài)
  text: string;          // màu chữ chính
  textSecondary: string; // màu chữ phụ (== thứ bạn đang dùng trong profile.tsx)
  tint: string;          // màu nhấn (brand)
  hairline: string;      // line mảnh, separator
  tabbarBackdrop: string;// nền nhẹ sau TabBar nếu cần
  blurTint: 'light' | 'dark'; // cho <BlurView tint=...>
};

const LIGHT: AppTheme = {
  name: 'light',
  bg: '#F5F7FA',
  card: 'rgba(255,255,255,0.7)',
  text: '#0F172A',
  textSecondary: '#6B7280',
  tint: '#FF4C4C',
  hairline: 'rgba(0,0,0,0.08)',
  tabbarBackdrop: 'rgba(255,255,255,0.42)',
  blurTint: 'light',
};

const DARK: AppTheme = {
  name: 'dark',
  bg: '#0B1220',
  card: 'rgba(30,41,59,0.45)',
  text: '#E5E7EB',
  textSecondary: '#94A3B8',
  tint: '#FF6B4C',
  hairline: 'rgba(148,163,184,0.18)',
  tabbarBackdrop: 'rgba(30,41,59,0.42)',
  blurTint: 'dark',
};

type Ctx = {
  theme: AppTheme;
  setThemeName: (name: ThemeName) => void;
  toggleTheme: (name?: ThemeName) => void; 
};

const ThemeContext = createContext<Ctx>({
  theme: LIGHT,
  setThemeName: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: PropsWithChildren) {
  const [name, setName] = useState<ThemeName>('light');

  const setThemeName = (n: ThemeName) => setName(n);
  const toggleTheme = (n?: ThemeName) => {
    if (n) return setName(n);
    setName(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => (name === 'dark' ? DARK : LIGHT), [name]);

  const value = useMemo<Ctx>(() => ({ theme, setThemeName, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
