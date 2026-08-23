export type Theme = 'LIGHT' | 'DARK' | 'SYSTEM';

export const applyTheme = (theme: Theme = 'LIGHT') => {
  const isDark =
    theme === 'DARK' ||
    (theme === 'SYSTEM' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const getStoredTheme = (): Theme => {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
  if (stored === 'LIGHT' || stored === 'DARK' || stored === 'SYSTEM') {
    return stored;
  }
  return 'LIGHT';
};
