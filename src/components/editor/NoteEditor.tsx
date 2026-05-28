import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import {
  X,
  Pin,
  Archive,
  Trash2,
  ChevronLeft,
  Plus,
  Check,
  RotateCcw,
  ArchiveRestore,
} from 'lucide-react';
import { EditorToolbar } from './EditorToolbar';
import { cn, debounce, formatDateFull, countWords, estimateReadTime } from '../../lib/utils';
import { NOTE_COLOR_MAP } from '../../types';
import type { Note, NoteColor, NoteView, Theme } from '../../types';

interface NoteEditorProps {
  note: Note;
  view: NoteView;
  theme: Theme;
  onUpdate: (id: string, changes: Partial<Note>) => void;
  onClose: () => void;
  onPin: (pinned: boolean) => void;
  onArchive: () => void;
  onTrash: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}

export function NoteEditor({
  note,
  view,
  theme,
  onUpdate,
  onClose,
  onPin,
  onArchive,
  onTrash,
  onRestore,
  onDelete,
}: NoteEditorProps) {
  const isDark = theme === 'dark';
  const [title, setTitle] = useState(note.title);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const isReadOnly = view === 'trash';

  const debouncedSave = useCallback(
    debounce((id: string, changes: Partial<Note>) => {
      onUpdate(id, changes);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 600),
    [onUpdate]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: { HTMLAttributes: { class: 'code-block' } },
      }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: note.content || '',
    editable: !isReadOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      setSaveStatus('saving');
      debouncedSave(note.id, {
        content: html,
        contentText: text,
        wordCount: countWords(text),
      });
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor outline-none',
        spellcheck: 'true',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentContent = editor.getHTML();
    if (currentContent !== note.content) {
      editor.commands.setContent(note.content || '');
    }
  }, [note.id]);

  useEffect(() => {
    setTitle(note.title);
  }, [note.id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSaveStatus('saving');
    debouncedSave(note.id, { title: val });
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      editor?.commands.focus();
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || note.tags.includes(tag)) {
      setTagInput('');
      setShowTagInput(false);
      return;
    }
    onUpdate(note.id, { tags: [...note.tags, tag] });
    setTagInput('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tag: string) => {
    onUpdate(note.id, { tags: note.tags.filter((t) => t !== tag) });
  };

  const handleColorSelect = (color: NoteColor) => {
    onUpdate(note.id, { color });
    setShowColorPicker(false);
  };

  const wordCount = note.wordCount || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex flex-col h-full border-l transition-theme',
        isDark ? 'bg-ink-900 border-white/[0.06]' : 'bg-white border-ink-100'
      )}
    >
      {/* Top bar */}
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-3 border-b flex-shrink-0',
          isDark ? 'border-white/[0.05]' : 'border-ink-100'
        )}
      >
        <button
          onClick={onClose}
          className={cn(
            'p-1.5 rounded-lg transition-all',
            isDark ? 'text-ink-500 hover:text-ink-200 hover:bg-white/[0.06]' : 'text-ink-400 hover:text-ink-700 hover:bg-ink-100'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        {/* Save status */}
        <AnimatePresence>
          {saveStatus !== 'idle' && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn('text-xs', isDark ? 'text-ink-600' : 'text-ink-400')}
            >
              {saveStatus === 'saving' ? 'Saving…' : 'Saved'}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Color picker */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center transition-all border',
              isDark ? 'border-white/10 hover:bg-white/[0.06]' : 'border-ink-200 hover:bg-ink-50'
            )}
            title="Change color"
          >
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{ background: NOTE_COLOR_MAP[note.color].dot }}
            />
          </button>

          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  'absolute top-full right-0 mt-1.5 p-2.5 rounded-2xl z-50 w-48',
                  isDark
                    ? 'bg-ink-800 border border-white/10 shadow-2xl shadow-black/50'
                    : 'bg-white border border-ink-200 shadow-xl shadow-black/10'
                )}
                onMouseLeave={() => setShowColorPicker(false)}
              >
                <p className={cn('text-xs mb-2 px-1', isDark ? 'text-ink-500' : 'text-ink-400')}>
                  Note color
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {(Object.keys(NOTE_COLOR_MAP) as NoteColor[]).map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className="relative w-7 h-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                      style={{ background: NOTE_COLOR_MAP[color].dot }}
                      title={NOTE_COLOR_MAP[color].label}
                    >
                      {note.color === color && (
                        <Check className="w-3 h-3 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        {view !== 'trash' ? (
          <>
            {view !== 'archived' && (
              <button
                onClick={() => onPin(!note.isPinned)}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  note.isPinned
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : isDark
                    ? 'text-ink-500 hover:text-ink-200 hover:bg-white/[0.06]'
                    : 'text-ink-400 hover:text-ink-700 hover:bg-ink-100'
                )}
                title={note.isPinned ? 'Unpin' : 'Pin'}
              >
                <Pin className="w-4 h-4" fill={note.isPinned ? 'currentColor' : 'none'} />
              </button>
            )}

            {view !== 'archived' && (
              <button
                onClick={onArchive}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  isDark ? 'text-ink-500 hover:text-ink-200 hover:bg-white/[0.06]' : 'text-ink-400 hover:text-ink-700 hover:bg-ink-100'
                )}
                title="Archive"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}

            {view === 'archived' && (
              <button
                onClick={onRestore}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  isDark ? 'text-ink-500 hover:text-ink-200 hover:bg-white/[0.06]' : 'text-ink-400 hover:text-ink-700 hover:bg-ink-100'
                )}
                title="Unarchive"
              >
                <ArchiveRestore className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onTrash}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                isDark ? 'text-ink-500 hover:text-red-400 hover:bg-red-500/10' : 'text-ink-400 hover:text-red-500 hover:bg-red-50'
              )}
              title="Move to trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onRestore}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                isDark ? 'text-ink-500 hover:text-ink-200 hover:bg-white/[0.06]' : 'text-ink-400 hover:text-ink-700 hover:bg-ink-100'
              )}
              title="Restore"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                isDark ? 'text-ink-500 hover:text-red-400 hover:bg-red-500/10' : 'text-ink-400 hover:text-red-500 hover:bg-red-50'
              )}
              title="Delete forever"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Editor toolbar */}
      {!isReadOnly && editor && (
        <EditorToolbar editor={editor} theme={theme} />
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-6">
          {/* Title */}
          <textarea
            ref={titleRef}
            value={title}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            placeholder="Title"
            readOnly={isReadOnly}
            rows={1}
            className={cn(
              'w-full resize-none bg-transparent outline-none font-serif font-bold text-3xl leading-tight mb-4 overflow-hidden',
              isDark ? 'text-white placeholder:text-ink-700' : 'text-ink-900 placeholder:text-ink-300',
              isReadOnly && 'cursor-default'
            )}
            style={{ fieldSizing: 'content' } as React.CSSProperties}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = el.scrollHeight + 'px';
            }}
          />

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mb-5">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  'inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all group',
                  isDark
                    ? 'bg-white/[0.06] text-ink-400 hover:bg-white/10'
                    : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                )}
              >
                {tag}
                {!isReadOnly && (
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </span>
            ))}

            {!isReadOnly && (
              showTagInput ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleAddTag(); }}
                  className="inline-flex"
                >
                  <input
                    ref={tagInputRef}
                    autoFocus
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onBlur={handleAddTag}
                    onKeyDown={(e) => { if (e.key === 'Escape') { setShowTagInput(false); setTagInput(''); } }}
                    placeholder="tag name"
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-full outline-none w-24',
                      isDark
                        ? 'bg-white/[0.06] text-ink-300 placeholder:text-ink-600 border border-white/10'
                        : 'bg-ink-100 text-ink-600 placeholder:text-ink-400 border border-ink-200'
                    )}
                  />
                </form>
              ) : (
                <button
                  onClick={() => setShowTagInput(true)}
                  className={cn(
                    'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all',
                    isDark ? 'text-ink-600 hover:text-ink-400 hover:bg-white/[0.04]' : 'text-ink-400 hover:text-ink-600 hover:bg-ink-100'
                  )}
                >
                  <Plus className="w-3 h-3" />
                  Add tag
                </button>
              )
            )}
          </div>

          {/* Editor content */}
          <div className={cn('text-var', isDark ? 'text-ink-200' : 'text-ink-800')}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div
        className={cn(
          'flex items-center justify-between px-6 py-2.5 border-t flex-shrink-0',
          isDark ? 'border-white/[0.05]' : 'border-ink-100'
        )}
      >
        <div className="flex items-center gap-3">
          <span className={cn('text-xs', isDark ? 'text-ink-600' : 'text-ink-400')}>
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
          {wordCount > 0 && (
            <span className={cn('text-xs', isDark ? 'text-ink-700' : 'text-ink-300')}>·</span>
          )}
          {wordCount > 0 && (
            <span className={cn('text-xs', isDark ? 'text-ink-600' : 'text-ink-400')}>
              {estimateReadTime(wordCount)}
            </span>
          )}
        </div>
        <span className={cn('text-xs', isDark ? 'text-ink-700' : 'text-ink-300')}>
          {formatDateFull(note.updatedAt)}
        </span>
      </div>
    </motion.div>
  );
}
