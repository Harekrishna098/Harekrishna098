import { useState, useCallback, useEffect } from 'react';
import { loadSettings, saveSettings } from '../lib/storage';
import type { AppSettings, Theme, ViewMode, SortMode } from '../types';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const updateSettings = useCallback((changes: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...changes };
      saveSettings(next);
      return next;
    });
  }, []);

  const setTheme = useCallback(
    (theme: Theme) => updateSettings({ theme }),
    [updateSettings]
  );

  const setViewMode = useCallback(
    (viewMode: ViewMode) => updateSettings({ viewMode }),
    [updateSettings]
  );

  const setSortMode = useCallback(
    (sortMode: SortMode) => updateSettings({ sortMode }),
    [updateSettings]
  );

  return { settings, updateSettings, setTheme, setViewMode, setSortMode };
}
