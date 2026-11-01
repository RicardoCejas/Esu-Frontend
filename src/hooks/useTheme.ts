import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'high-contrast';
export type FontSizeScale = 'normal' | 'large' | 'xlarge';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('esu_theme');
    if (saved === 'dark' || saved === 'high-contrast') return saved;
    return 'light';
  });

  const [fontSize, setFontSize] = useState<FontSizeScale>(() => {
    const saved = localStorage.getItem('esu_fontsize');
    if (saved === 'large' || saved === 'xlarge') return saved;
    return 'normal';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'high-contrast');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'high-contrast') {
      root.classList.add('dark', 'high-contrast');
    }

    localStorage.setItem('esu_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-scale-large', 'text-scale-xlarge');

    if (fontSize === 'large') {
      root.classList.add('text-scale-large');
    } else if (fontSize === 'xlarge') {
      root.classList.add('text-scale-xlarge');
    }

    localStorage.setItem('esu_fontsize', fontSize);
  }, [fontSize]);

  return {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    isDarkMode: theme === 'dark' || theme === 'high-contrast',
    isHighContrast: theme === 'high-contrast',
  };
};

