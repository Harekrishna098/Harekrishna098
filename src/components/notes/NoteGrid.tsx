import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { NoteCard } from './NoteCard';
import { cn } from '../../lib/utils';
import type { Note, NoteView, ViewMode, Theme } from '../../types';

interface NoteGridProps {
  notes: Note[];
  view: NoteView;
  viewMode: ViewMode;
  theme: Theme;
  onNoteClick: (note: Note) => void;
  onNewNote: () => void;
  onPin: (id: string, pinned: boolean) => void;
  onArchive: (id: string) => void;
  onTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onEmptyTrash: () => void;
  search: string;
}

const VIEW_LABELS: Record<NoteView, string> = {
  all: 'All Notes',
  pinned: 'Pinned',
  archived: 'Archive',
  trash: 'Trash',
};

const EMPTY_MESSAGES: Record<NoteView, { title: string; subtitle: string }> = {
  all: { title: 'No notes yet', subtitle: 'Create your first note to get started' },
  pinned: { title: 'No pinned notes', subtitle: 'Pin important notes for quick access' },
  archived: { title: 'Archive is empty', subtitle: 'Archived notes will appear here' },
  trash: { title: 'Trash is empty', subtitle: 'Deleted notes will appear here' },
};

export function NoteGrid({
  notes,
  view,
  viewMode,
  theme,
  onNoteClick,
  onNewNote,
  onPin,
  onArchive,
  onTrash,
  onRestore,
  onDelete,
  onDuplicate,
  onEmptyTrash,
  search,
}: NoteGridProps) {
  const isDark = theme === 'dark';
  const emptyMsg = EMPTY_MESSAGES[view];
  const hasSearch = search.trim().length > 0;

  const pinnedNotes = view === 'all' ? notes.filter((n) => n.isPinned) : [];
  const unpinnedNotes = view === 'all' ? notes.filter((n) => !n.isPinned) : notes;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-6 py-4 flex-shrink-0 border-b',
          isDark ? 'border-white/[0.05]' : 'border-ink-100'
        )}
      >
        <div className="flex items-center gap-3">
          <h2 className={cn('text-base font-semibold', isDark ? 'text-white' : 'text-ink-900')}>
            {hasSearch ? `Search results` : VIEW_LABELS[view]}
          </h2>
          {notes.length > 0 && (
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                isDark ? 'bg-white/[0.06] text-ink-500' : 'bg-ink-100 text-ink-400'
              )}
            >
              {notes.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {view === 'trash' && notes.length > 0 && (
            <button
              onClick={onEmptyTrash}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                'text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20'
              )}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Empty trash
            </button>
          )}

          {view === 'all' && (
            <button
              onClick={onNewNote}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                isDark
                  ? 'bg-white/[0.06] text-ink-200 hover:bg-white/10 hover:text-white'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200 hover:text-ink-800'
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              New note
            </button>
          )}
        </div>
      </div>

      {/* Notes area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {notes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col items-center justify-center text-center"
          >
            <div
              className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center mb-4',
                isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-ink-50 border border-ink-200'
              )}
            >
              <FileText className={cn('w-7 h-7', isDark ? 'text-ink-600' : 'text-ink-300')} />
            </div>
            <h3 className={cn('text-base font-medium mb-1', isDark ? 'text-ink-300' : 'text-ink-600')}>
              {hasSearch ? 'No notes found' : emptyMsg.title}
            </h3>
            <p className={cn('text-sm', isDark ? 'text-ink-600' : 'text-ink-400')}>
              {hasSearch ? `No notes match "${search}"` : emptyMsg.subtitle}
            </p>
            {view === 'all' && !hasSearch && (
              <button
                onClick={onNewNote}
                className={cn(
                  'mt-5 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  isDark
                    ? 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/20'
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
                )}
              >
                <Plus className="w-4 h-4" />
                Create first note
              </button>
            )}
          </motion.div>
        ) : (
          <div>
            {/* Pinned section */}
            {pinnedNotes.length > 0 && (
              <div className="mb-4">
                <p
                  className={cn(
                    'text-xs font-medium uppercase tracking-wider mb-2',
                    isDark ? 'text-ink-600' : 'text-ink-400'
                  )}
                >
                  Pinned
                </p>
                <div className={viewMode === 'grid' ? 'masonry' : ''}>
                  <AnimatePresence mode="popLayout">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        view={view}
                        theme={theme}
                        onClick={() => onNoteClick(note)}
                        onPin={(pinned) => onPin(note.id, pinned)}
                        onArchive={() => onArchive(note.id)}
                        onTrash={() => onTrash(note.id)}
                        onRestore={() => onRestore(note.id)}
                        onDelete={() => onDelete(note.id)}
                        onDuplicate={() => onDuplicate(note.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Other notes */}
            {unpinnedNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <p
                    className={cn(
                      'text-xs font-medium uppercase tracking-wider mb-2',
                      isDark ? 'text-ink-600' : 'text-ink-400'
                    )}
                  >
                    Others
                  </p>
                )}
                <div className={viewMode === 'grid' ? 'masonry' : ''}>
                  <AnimatePresence mode="popLayout">
                    {unpinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        view={view}
                        theme={theme}
                        onClick={() => onNoteClick(note)}
                        onPin={(pinned) => onPin(note.id, pinned)}
                        onArchive={() => onArchive(note.id)}
                        onTrash={() => onTrash(note.id)}
                        onRestore={() => onRestore(note.id)}
                        onDelete={() => onDelete(note.id)}
                        onDuplicate={() => onDuplicate(note.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
