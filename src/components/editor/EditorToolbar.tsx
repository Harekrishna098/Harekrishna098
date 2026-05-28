import type { Editor } from '@tiptap/react';
import { cn } from '../../lib/utils';
import type { Theme } from '../../types';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  FileCode,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor;
  theme: Theme;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  isDark: boolean;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, title, isDark, children }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded-lg transition-all duration-150',
        active
          ? isDark
            ? 'bg-white/[0.12] text-white'
            : 'bg-ink-200 text-ink-800'
          : isDark
          ? 'text-ink-500 hover:text-ink-200 hover:bg-white/[0.06]'
          : 'text-ink-400 hover:text-ink-700 hover:bg-ink-100'
      )}
    >
      {children}
    </button>
  );
}

function Divider({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={cn('w-px h-4 mx-0.5 flex-shrink-0', isDark ? 'bg-white/[0.08]' : 'bg-ink-200')}
    />
  );
}

export function EditorToolbar({ editor, theme }: EditorToolbarProps) {
  const isDark = theme === 'dark';

  if (!editor) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 px-4 py-2 overflow-x-auto no-scrollbar border-b flex-shrink-0',
        isDark ? 'border-white/[0.05] bg-ink-900' : 'border-ink-100 bg-white'
      )}
    >
      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo (Ctrl+Z)"
        isDark={isDark}
      >
        <Undo className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo (Ctrl+Shift+Z)"
        isDark={isDark}
      >
        <Redo className="w-3.5 h-3.5" />
      </ToolbarButton>

      <Divider isDark={isDark} />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
        isDark={isDark}
      >
        <Heading1 className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
        isDark={isDark}
      >
        <Heading2 className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
        isDark={isDark}
      >
        <Heading3 className="w-3.5 h-3.5" />
      </ToolbarButton>

      <Divider isDark={isDark} />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
        isDark={isDark}
      >
        <Bold className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
        isDark={isDark}
      >
        <Italic className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
        isDark={isDark}
      >
        <Underline className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Strikethrough"
        isDark={isDark}
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive('highlight')}
        title="Highlight"
        isDark={isDark}
      >
        <Highlighter className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="Inline code"
        isDark={isDark}
      >
        <Code className="w-3.5 h-3.5" />
      </ToolbarButton>

      <Divider isDark={isDark} />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet list"
        isDark={isDark}
      >
        <List className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Numbered list"
        isDark={isDark}
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive('taskList')}
        title="Task list"
        isDark={isDark}
      >
        <CheckSquare className="w-3.5 h-3.5" />
      </ToolbarButton>

      <Divider isDark={isDark} />

      {/* Blocks */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Blockquote"
        isDark={isDark}
      >
        <Quote className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        title="Code block"
        isDark={isDark}
      >
        <FileCode className="w-3.5 h-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal rule"
        isDark={isDark}
      >
        <Minus className="w-3.5 h-3.5" />
      </ToolbarButton>
    </div>
  );
}
