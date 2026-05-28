import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Pin,
  Archive,
  Trash2,
  Search,
  Plus,
  Moon,
  Sun,
  Lock,
  Tag,
  ChevronDown,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { NoteView, Theme } from '../../types';

interface SidebarProps {
  activeView: NoteView;
  onViewChange: (view: NoteView) => void;
  onNewNote: () => void;
  onLock: () => void;
  theme: Theme;
  onThemeToggle: () => void;
  counts: { all: number; pinned: number; archived: number; trash: number };
  allTags: string[];
  activeTag: string | null;
  onTagSelect: (tag: string | null) => void;
  search: string;
  onSearchChange: (s: string) => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  danger?: boolean;
}

function NavItem({ icon, label, count, active, onClick, danger }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 group',
        active
          ? 'bg-white/[0.08] text-white font-medium'
          : cn(
              'text-ink-400 hover:text-ink-200 hover:bg-white/[0.04]',
              danger && 'hover:text-red-400'
            )
      )}
    >
      <span className={cn('w-4 h-4 flex-shrink-0', active ? 'text-white' : 'text-ink-500 group-hover:text-inherit')}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {typeof count === 'number' && count > 0 && (
        <span
          className={cn(
            'text-xs px-1.5 py-0.5 rounded-full tabular-nums',
            active ? 'bg-white/10 text-white/60' : 'bg-white/[0.05] text-ink-500'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function Sidebar({
  activeView,
  onViewChange,
  onNewNote,
  onLock,
  theme,
  onThemeToggle,
  counts,
  allTags,
  activeTag,
  onTagSelect,
  search,
  onSearchChange,
}: SidebarProps) {
  const [tagsExpanded, setTagsExpanded] = useState(true);
  const isDark = theme === 'dark';

  return (
    <aside
      className={cn(
        'flex flex-col h-full w-64 flex-shrink-0 transition-theme',
        isDark
          ? 'bg-ink-950 border-r border-white/[0.06]'
          : 'bg-white border-r border-black/[0.06]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center',
              isDark
                ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10'
                : 'bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200/50'
            )}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className={cn('font-serif font-bold text-lg tracking-tight', isDark ? 'text-white' : 'text-ink-900')}>
            Nota
          </span>
        </div>

        <button
          onClick={onNewNote}
          className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center transition-all',
            isDark
              ? 'bg-white/[0.06] hover:bg-white/10 text-ink-300 hover:text-white'
              : 'bg-ink-100 hover:bg-ink-200 text-ink-500 hover:text-ink-800'
          )}
          title="New note (Ctrl+N)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 mb-3">
        <div className="relative">
          <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5', isDark ? 'text-ink-600' : 'text-ink-400')} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes…"
            className={cn(
              'w-full pl-8.5 pr-8 py-2 rounded-xl text-sm outline-none transition-all',
              isDark
                ? 'bg-white/[0.04] border border-white/[0.06] text-ink-200 placeholder:text-ink-600 focus:border-white/10 focus:bg-white/[0.06]'
                : 'bg-ink-50 border border-ink-200 text-ink-800 placeholder:text-ink-400 focus:border-ink-300 focus:bg-white'
            )}
            style={{ paddingLeft: '2.125rem' }}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className={cn('absolute right-2.5 top-1/2 -translate-y-1/2', isDark ? 'text-ink-600 hover:text-ink-400' : 'text-ink-400 hover:text-ink-600')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto no-scrollbar">
        <NavItem
          icon={<FileText className="w-4 h-4" />}
          label="All Notes"
          count={counts.all}
          active={activeView === 'all' && !activeTag}
          onClick={() => { onViewChange('all'); onTagSelect(null); }}
        />
        <NavItem
          icon={<Pin className="w-4 h-4" />}
          label="Pinned"
          count={counts.pinned}
          active={activeView === 'pinned' && !activeTag}
          onClick={() => { onViewChange('pinned'); onTagSelect(null); }}
        />
        <NavItem
          icon={<Archive className="w-4 h-4" />}
          label="Archive"
          count={counts.archived}
          active={activeView === 'archived' && !activeTag}
          onClick={() => { onViewChange('archived'); onTagSelect(null); }}
        />
        <NavItem
          icon={<Trash2 className="w-4 h-4" />}
          label="Trash"
          count={counts.trash}
          active={activeView === 'trash' && !activeTag}
          onClick={() => { onViewChange('trash'); onTagSelect(null); }}
          danger
        />

        {/* Tags section */}
        {allTags.length > 0 && (
          <div className="pt-3">
            <button
              onClick={() => setTagsExpanded(!tagsExpanded)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-lg transition-colors',
                isDark ? 'text-ink-600 hover:text-ink-400' : 'text-ink-400 hover:text-ink-600'
              )}
            >
              <Tag className="w-3 h-3" />
              Tags
              <motion.span
                animate={{ rotate: tagsExpanded ? 0 : -90 }}
                transition={{ duration: 0.15 }}
                className="ml-auto"
              >
                <ChevronDown className="w-3 h-3" />
              </motion.span>
            </button>

            <AnimatePresence>
              {tagsExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-1 space-y-0.5">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => onTagSelect(activeTag === tag ? null : tag)}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-all',
                          activeTag === tag
                            ? isDark
                              ? 'bg-white/[0.08] text-white'
                              : 'bg-ink-100 text-ink-800'
                            : isDark
                            ? 'text-ink-400 hover:text-ink-200 hover:bg-white/[0.04]'
                            : 'text-ink-500 hover:text-ink-700 hover:bg-ink-50'
                        )}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                        <span className="truncate">{tag}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </nav>

      {/* Footer actions */}
      <div className={cn('px-2 pb-4 pt-3 border-t', isDark ? 'border-white/[0.06]' : 'border-ink-100')}>
        <div className="flex items-center gap-1">
          <button
            onClick={onThemeToggle}
            className={cn(
              'flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all',
              isDark
                ? 'text-ink-400 hover:text-ink-200 hover:bg-white/[0.04]'
                : 'text-ink-500 hover:text-ink-700 hover:bg-ink-50'
            )}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? 'Light mode' : 'Dark mode'}
          </button>

          <button
            onClick={onLock}
            className={cn(
              'p-2 rounded-xl transition-all',
              isDark
                ? 'text-ink-500 hover:text-ink-300 hover:bg-white/[0.04]'
                : 'text-ink-400 hover:text-ink-600 hover:bg-ink-50'
            )}
            title="Lock"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
