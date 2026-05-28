import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Pin,
  Archive,
  Trash2,
  MoreHorizontal,
  Copy,
  ArchiveRestore,
  RotateCcw,
  X,
} from 'lucide-react';
import { cn, formatDate, truncate } from '../../lib/utils';
import { NOTE_COLOR_MAP } from '../../types';
import type { Note, NoteView, Theme } from '../../types';

interface NoteCardProps {
  note: Note;
  view: NoteView;
  theme: Theme;
  onClick: () => void;
  onPin: (pinned: boolean) => void;
  onArchive: () => void;
  onTrash: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function NoteCard({
  note,
  view,
  theme,
  onClick,
  onPin,
  onArchive,
  onTrash,
  onRestore,
  onDelete,
  onDuplicate,
}: NoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isDark = theme === 'dark';

  const colorConfig = NOTE_COLOR_MAP[note.color];
  const cardBg = isDark ? colorConfig.dark : colorConfig.light;

  const hasDefaultColor = note.color === 'default';
  const defaultDark = '#1e1e1e';
  const defaultLight = '#ffffff';

  const bgColor = hasDefaultColor
    ? isDark
      ? defaultDark
      : defaultLight
    : cardBg;

  const preview = truncate(note.contentText, 180);

  const menuItems =
    view === 'trash'
      ? [
          { icon: RotateCcw, label: 'Restore', action: onRestore },
          { icon: X, label: 'Delete forever', action: onDelete, danger: true },
        ]
      : view === 'archived'
      ? [
          { icon: ArchiveRestore, label: 'Unarchive', action: onRestore },
          { icon: Copy, label: 'Duplicate', action: onDuplicate },
          { icon: Trash2, label: 'Move to trash', action: onTrash, danger: true },
        ]
      : [
          {
            icon: Pin,
            label: note.isPinned ? 'Unpin' : 'Pin',
            action: () => onPin(!note.isPinned),
          },
          { icon: Copy, label: 'Duplicate', action: onDuplicate },
          { icon: Archive, label: 'Archive', action: onArchive },
          { icon: Trash2, label: 'Move to trash', action: onTrash, danger: true },
        ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="masonry-item"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
    >
      <div
        onClick={onClick}
        className={cn(
          'relative rounded-2xl p-4 cursor-pointer transition-all duration-200 group',
          isDark
            ? 'shadow-card-dark hover:shadow-card-dark-hover'
            : 'shadow-card-light hover:shadow-card-light-hover'
        )}
        style={{
          background: bgColor,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        {/* Color accent bar */}
        {!hasDefaultColor && (
          <div
            className="absolute top-0 left-4 right-4 h-0.5 rounded-full opacity-60"
            style={{ background: colorConfig.dot }}
          />
        )}

        {/* Pin indicator */}
        {note.isPinned && (
          <div className="absolute top-3 right-3">
            <Pin className="w-3 h-3 text-ink-400 fill-current" />
          </div>
        )}

        {/* Title */}
        {note.title && (
          <h3
            className={cn(
              'font-semibold text-sm leading-snug mb-2 pr-5',
              isDark ? 'text-white' : 'text-ink-900'
            )}
          >
            {truncate(note.title, 60)}
          </h3>
        )}

        {/* Content preview */}
        {preview && (
          <p
            className={cn(
              'text-sm leading-relaxed',
              isDark ? 'text-ink-400' : 'text-ink-600'
            )}
          >
            {preview}
          </p>
        )}

        {/* Empty state */}
        {!note.title && !preview && (
          <p className={cn('text-sm italic', isDark ? 'text-ink-600' : 'text-ink-400')}>
            Empty note
          </p>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  isDark
                    ? 'bg-white/[0.06] text-ink-400'
                    : 'bg-ink-100 text-ink-500'
                )}
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className={cn('text-xs px-2 py-0.5', isDark ? 'text-ink-600' : 'text-ink-400')}>
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          className={cn(
            'flex items-center justify-between mt-3 pt-2.5',
            'border-t',
            isDark ? 'border-white/[0.04]' : 'border-ink-100'
          )}
        >
          <span className={cn('text-xs', isDark ? 'text-ink-600' : 'text-ink-400')}>
            {formatDate(note.updatedAt)}
          </span>

          {/* Action menu */}
          <div
            className={cn(
              'transition-opacity',
              hovered ? 'opacity-100' : 'opacity-0'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  isDark
                    ? 'hover:bg-white/10 text-ink-500 hover:text-ink-200'
                    : 'hover:bg-ink-100 text-ink-400 hover:text-ink-700'
                )}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={cn(
                    'absolute right-0 bottom-full mb-1 w-44 rounded-xl overflow-hidden z-50',
                    isDark
                      ? 'bg-ink-800 border border-white/10 shadow-xl shadow-black/50'
                      : 'bg-white border border-ink-200 shadow-xl shadow-black/10'
                  )}
                >
                  {menuItems.map(({ icon: Icon, label, action, danger }) => (
                    <button
                      key={label}
                      onClick={() => { action(); setMenuOpen(false); }}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors',
                        danger
                          ? 'text-red-400 hover:bg-red-500/10'
                          : isDark
                          ? 'text-ink-300 hover:bg-white/[0.06]'
                          : 'text-ink-700 hover:bg-ink-50'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
