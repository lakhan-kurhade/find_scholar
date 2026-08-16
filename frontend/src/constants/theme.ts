import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#2563EB',
    primaryDark: '#1D4ED8',

    text: '#0F172A',
    textSecondary: '#64748B',

    background: '#F8FAFC',
    card: '#FFFFFF',

    border: '#E2E8F0',

    success: '#16A34A',
    error: '#DC2626',

    backgroundElement: '#F1F5F9',
    backgroundSelected: '#DBEAFE',
  },

  dark: {
    primary: '#60A5FA',
    primaryDark: '#3B82F6',

    text: '#F8FAFC',
    textSecondary: '#94A3B8',

    background: '#0F172A',
    card: '#1E293B',

    border: '#334155',

    success: '#22C55E',
    error: '#F87171',

    backgroundElement: '#1E293B',
    backgroundSelected: '#1E40AF',
  },
} as const;

export type ThemeColor =
  keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },

  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },

  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset =
  Platform.select({
    ios: 50,
    android: 80,
  }) ?? 0;

export const MaxContentWidth = 800;