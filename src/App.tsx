import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LockScreen } from './components/auth/LockScreen';
import { Sidebar } from './components/layout/Sidebar';
import { NoteGrid } from './components/notes/NoteGrid';
import { NoteEditor } from './components/editor/NoteEditor';
import { useAuth } from './hooks/useAuth';
import { useNotes } from './hooks/useNotes';
import { useSettings } from './hooks/useSettings';
import { cn } from './lib/utils';
import type { Note, NoteView } from './types';

export default function App() {
  const { settings, setTheme } = useSettings();
  const { state: authState, error, isLoading, setup, unlock, lock, refreshSession, setError } = useAuth(settings);
  const {
    addNote,
    updateNote,
    deleteNote,
    trashNote,
    restoreNote,
    archiveNote,
    pinNote,
    duplicateNote,
    emptyTrash,
    allTags,
    getFilteredNotes,
    counts,
  } = useNotes();

  const [activeView, setActiveView] = useState<NoteView>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const isDark = settings.theme === 'dark';

  const filteredNotes = getFilteredNotes(activeView, search, activeTag, settings.sortMode);

  useEffect(() => {
    if (authState !== 'unlocked') return;
    const events = ['mousedown', 'keydown', 'touchstart'];
    const handler = () => refreshSession();
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, handler));
  }, [authState, refreshSession]);

  useEffect(() => {
    if (authState !== 'unlocked') return;
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        handleNewNote();
      }
      if (e.key === 'Escape' && selectedNote) {
        setSelectedNote(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [authState, selectedNote]);

  const handleNewNote = useCallback(() => {
    const note = addNote();
    setActiveView('all');
    setActiveTag(null);
    setSelectedNote(note);
  }, [addNote]);

  const handleNoteUpdate = useCallback(
    (id: string, changes: Partial<Note>) => {
      updateNote(id, changes);
      setSelectedNote((prev) => (prev?.id === id ? { ...prev, ...changes } : prev));
    },
    [updateNote]
  );

  const handleTrash = useCallback(
    (id: string) => {
      trashNote(id);
      if (selectedNote?.id === id) setSelectedNote(null);
    },
    [trashNote, selectedNote]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteNote(id);
      if (selectedNote?.id === id) setSelectedNote(null);
    },
    [deleteNote, selectedNote]
  );

  const handleArchive = useCallback(
    (id: string) => {
      archiveNote(id);
      if (selectedNote?.id === id) setSelectedNote(null);
    },
    [archiveNote, selectedNote]
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      const duped = duplicateNote(id);
      if (duped) setSelectedNote(duped);
    },
    [duplicateNote]
  );

  if (authState === 'setup' || authState === 'locked') {
    return (
      <LockScreen
        mode={authState}
        onSetup={setup}
        onUnlock={unlock}
        error={error}
        isLoading={isLoading}
        setError={setError}
      />
    );
  }

  return (
    <div className={cn('flex h-screen overflow-hidden transition-theme', isDark ? 'bg-ink-950' : 'bg-ink-50')}>
      <Sidebar
        activeView={activeView}
        onViewChange={(v) => { setActiveView(v); setSelectedNote(null); setSearch(''); }}
        onNewNote={handleNewNote}
        onLock={lock}
        theme={settings.theme}
        onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}
        counts={counts}
        allTags={allTags}
        activeTag={activeTag}
        onTagSelect={(tag) => { setActiveTag(tag); setSelectedNote(null); if (tag) setActiveView('all'); }}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="flex flex-1 overflow-hidden">
        <div
          className={cn(
            'transition-all duration-300 overflow-hidden flex-shrink-0',
            selectedNote ? 'w-[320px]' : 'flex-1'
          )}
        >
          <NoteGrid
            notes={filteredNotes}
            view={activeView}
            viewMode={settings.viewMode}
            theme={settings.theme}
            onNoteClick={setSelectedNote}
            onNewNote={handleNewNote}
            onPin={(id, pinned) => pinNote(id, pinned)}
            onArchive={handleArchive}
            onTrash={handleTrash}
            onRestore={restoreNote}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onEmptyTrash={emptyTrash}
            search={search}
          />
        </div>

        <AnimatePresence>
          {selectedNote && (
            <div className="flex-1 overflow-hidden" key={selectedNote.id}>
              <NoteEditor
                note={selectedNote}
                view={activeView}
                theme={settings.theme}
                onUpdate={handleNoteUpdate}
                onClose={() => setSelectedNote(null)}
                onPin={(pinned) => {
                  pinNote(selectedNote.id, pinned);
                  handleNoteUpdate(selectedNote.id, { isPinned: pinned });
                }}
                onArchive={() => handleArchive(selectedNote.id)}
                onTrash={() => handleTrash(selectedNote.id)}
                onRestore={() => restoreNote(selectedNote.id)}
                onDelete={() => handleDelete(selectedNote.id)}
                onDuplicate={() => handleDuplicate(selectedNote.id)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
