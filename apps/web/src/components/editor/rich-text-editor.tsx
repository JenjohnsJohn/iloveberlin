'use client';

import { useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const toolbarButtons = [
  { label: 'B', title: 'Bold', style: 'font-bold' },
  { label: 'I', title: 'Italic', style: 'italic' },
  { label: 'U', title: 'Underline', style: 'underline' },
  { label: 'S', title: 'Strikethrough', style: 'line-through' },
];

const headingButtons = [
  { label: 'H1', title: 'Heading 1' },
  { label: 'H2', title: 'Heading 2' },
  { label: 'H3', title: 'Heading 3' },
];

const listButtons = [
  { label: 'UL', title: 'Bullet List' },
  { label: 'OL', title: 'Numbered List' },
];

const insertButtons = [
  { label: 'Link', title: 'Insert Link' },
  { label: 'Img', title: 'Insert Image' },
  { label: 'Video', title: 'Embed Video' },
  { label: 'Quote', title: 'Block Quote' },
  { label: 'Code', title: 'Code Block' },
];

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [activeFormat] = useState<string | null>(null);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 px-2 py-1.5 flex flex-wrap items-center gap-1">
        {/* Text formatting */}
        <div className="flex items-center border-r border-gray-300 pr-2 mr-1">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              title={btn.title}
              className={`px-2 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${
                btn.style
              } ${activeFormat === btn.label ? 'bg-gray-200' : ''}`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Headings */}
        <div className="flex items-center border-r border-gray-300 pr-2 mr-1">
          {headingButtons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              title={btn.title}
              className="px-2 py-1 text-xs font-semibold rounded hover:bg-gray-200 transition-colors"
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Lists */}
        <div className="flex items-center border-r border-gray-300 pr-2 mr-1">
          {listButtons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              title={btn.title}
              className="px-2 py-1 text-xs font-semibold rounded hover:bg-gray-200 transition-colors"
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Insert */}
        <div className="flex items-center">
          {insertButtons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              title={btn.title}
              className="px-2 py-1 text-xs font-medium rounded hover:bg-gray-200 transition-colors text-gray-600"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor area */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Start writing...'}
        className="w-full min-h-[300px] px-4 py-3 text-sm resize-y focus:outline-none"
        rows={12}
      />

      {/* Status bar */}
      <div className="bg-gray-50 border-t border-gray-300 px-3 py-1.5 flex items-center justify-between text-xs text-gray-500">
        <span>
          {wordCount} word{wordCount !== 1 ? 's' : ''} &middot; {charCount} character{charCount !== 1 ? 's' : ''}
        </span>
        <span className="text-gray-400">
          Toolbar actions are placeholders - rich text editing coming soon
        </span>
      </div>
    </div>
  );
}
