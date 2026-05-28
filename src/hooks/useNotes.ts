import { useState, useCallback, useMemo } from 'react';
import { loadNotes, saveNotes, createNote } from '../lib/storage';
import { countWords } from '../lib/utils';
import type { Note, NoteColor, NoteView, SortMode } from '../types';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());

  const persist = useCallback((updated: Note[]) => {
    setNotes(updated);
    saveNotes(updated);
  }, []);

  const addNote = useCallback(
    (overrides: Partial<Note> = {}): Note => {
      const note = createNote(overrides);
      persist([note, ...notes]);
      return note;
    },
    [notes, persist]
  );

  const updateNote = useCallback(
    (id: string, changes: Partial<Note>) => {
      const updated = notes.map((n) =>
        n.id === id
          ? {
              ...n,
              ...changes,
              updatedAt: new Date().toISOString(),
              wordCount:
                changes.contentText !== undefined
                  ? countWords(changes.contentText)
                  : n.wordCount,
            }
          : n
      );
      persist(updated);
    },
    [notes, persist]
  );

  const deleteNote = useCallback(
    (id: string) => {
      persist(notes.filter((n) => n.id !== id));
    },
    [notes, persist]
  );

  const trashNote = useCallback(
    (id: string) => {
      updateNote(id, { isTrashed: true, isArchived: false, isPinned: false });
    },
    [updateNote]
  );

  const restoreNote = useCallback(
    (id: string) => {
      updateNote(id, { isTrashed: false });
    },
    [updateNote]
  );

  const archiveNote = useCallback(
    (id: string) => {
      updateNote(id, { isArchived: true, isTrashed: false, isPinned: false });
    },
    [updateNote]
  );

  const pinNote = useCallback(
    (id: string, pinned: boolean) => {
      updateNote(id, { isPinned: pinned });
    },
    [updateNote]
  );

  const setColor = useCallback(
    (id: string, color: NoteColor) => {
      updateNote(id, { color });
    },
    [updateNote]
  );

  const addTag = useCallback(
    (id: string, tag: string) => {
      const note = notes.find((n) => n.id === id);
      if (!note || note.tags.includes(tag)) return;
      updateNote(id, { tags: [...note.tags, tag] });
    },
    [notes, updateNote]
  );

  const removeTag = useCallback(
    (id: string, tag: string) => {
      const note = notes.find((n) => n.id === id);
      if (!note) return;
      updateNote(id, { tags: note.tags.filter((t) => t !== tag) });
    },
    [notes, updateNote]
  );

  const duplicateNote = useCallback(
    (id: string): Note | null => {
      const note = notes.find((n) => n.id === id);
      if (!note) return null;
      const duped = createNote({
        ...note,
        id: crypto.randomUUID(),
        title: note.title ? `${note.title} (copy)` : '',
        isPinned: false,
        isTrashed: false,
        isArchived: false,
      });
      persist([duped, ...notes]);
      return duped;
    },
    [notes, persist]
  );

  const emptyTrash = useCallback(() => {
    persist(notes.filter((n) => !n.isTrashed));
  }, [notes, persist]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [notes]);

  const getFilteredNotes = useCallback(
    (view: NoteView, search: string, tag: string | null, sort: SortMode): Note[] => {
      let filtered = notes.filter((n) => {
        if (view === 'trash') return n.isTrashed;
        if (n.isTrashed) return false;
        if (view === 'pinned') return n.isPinned && !n.isArchived;
        if (view === 'archived') return n.isArchived;
        return !n.isArchived;
      });

      if (tag) {
        filtered = filtered.filter((n) => n.tags.includes(tag));
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.contentText.toLowerCase().includes(q) ||
            n.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      filtered.sort((a, b) => {
        switch (sort) {
          case 'created':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'title':
            return (a.title || 'Untitled').localeCompare(b.title || 'Untitled');
          case 'color':
            return a.color.localeCompare(b.color);
          default:
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
      });

      return filtered;
    },
    [notes]
  );

  const counts = useMemo(
    () => ({
      all: notes.filter((n) => !n.isTrashed && !n.isArchived).length,
      pinned: notes.filter((n) => n.isPinned && !n.isTrashed && !n.isArchived).length,
      archived: notes.filter((n) => n.isArchived && !n.isTrashed).length,
      trash: notes.filter((n) => n.isTrashed).length,
    }),
    [notes]
  );

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    trashNote,
    restoreNote,
    archiveNote,
    pinNote,
    setColor,
    addTag,
    removeTag,
    duplicateNote,
    emptyTrash,
    allTags,
    getFilteredNotes,
    counts,
  };
}
