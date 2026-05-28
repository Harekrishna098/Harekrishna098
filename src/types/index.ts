export type NoteColor =
  | 'default'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'blue'
  | 'purple'
  | 'pink';

export type NoteView = 'all' | 'pinned' | 'archived' | 'trash';
export type ViewMode = 'grid' | 'list';
export type SortMode = 'updated' | 'created' | 'title' | 'color';
export type Theme = 'dark' | 'light';

export interface Note {
  id: string;
  title: string;
  content: string;
  contentText: string;
  color: NoteColor;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: Theme;
  viewMode: ViewMode;
  sortMode: SortMode;
  autoLockMinutes: number;
}

export const NOTE_COLOR_MAP: Record<NoteColor, { dark: string; light: string; label: string; dot: string }> = {
  default: { dark: '#1e1e1e', light: '#ffffff', label: 'Default', dot: '#888888' },
  red: { dark: '#2d1515', light: '#fff5f5', label: 'Rose', dot: '#f87171' },
  orange: { dark: '#2d1f0a', light: '#fff8f0', label: 'Amber', dot: '#fb923c' },
  yellow: { dark: '#2a2410', light: '#fffce0', label: 'Lemon', dot: '#facc15' },
  green: { dark: '#0e2415', light: '#f0fdf4', label: 'Sage', dot: '#4ade80' },
  teal: { dark: '#0d2222', light: '#f0fdfd', label: 'Teal', dot: '#2dd4bf' },
  blue: { dark: '#0d1e30', light: '#eff6ff', label: 'Sky', dot: '#60a5fa' },
  purple: { dark: '#1a1028', light: '#f5f3ff', label: 'Violet', dot: '#a78bfa' },
  pink: { dark: '#2a1020', light: '#fdf2f8', label: 'Blush', dot: '#f472b6' },
};
