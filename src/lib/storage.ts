import type { Note, AppSettings, NoteColor } from '../types';

const KEYS = {
  NOTES: 'nota_notes',
  AUTH: 'nota_auth',
  SETTINGS: 'nota_settings',
  SESSION: 'nota_session',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  viewMode: 'grid',
  sortMode: 'updated',
  autoLockMinutes: 30,
};

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(KEYS.NOTES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotes(notes: Note[]): void {
  localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export function getStoredHash(): string | null {
  return localStorage.getItem(KEYS.AUTH);
}

export function setStoredHash(hash: string): void {
  localStorage.setItem(KEYS.AUTH, hash);
}

export function getSession(): { lockedAt: string } | null {
  try {
    const raw = localStorage.getItem(KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(data: { lockedAt: string } | null): void {
  if (data === null) {
    localStorage.removeItem(KEYS.SESSION);
  } else {
    localStorage.setItem(KEYS.SESSION, JSON.stringify(data));
  }
}

export function createNote(overrides: Partial<Note> = {}): Note {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: '',
    content: '',
    contentText: '',
    color: 'default' as NoteColor,
    tags: [],
    isPinned: false,
    isArchived: false,
    isTrashed: false,
    wordCount: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
