'use client'

import { useRef, useEffect } from 'react'
import { Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Minus } from 'lucide-react'
import { Button } from './button'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  // Initialize content ONLY on first mount if there's a value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, []) // We explicitly only want this to run once or handle carefully

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const exec = (command: string, arg?: string) => {
    document.execCommand(command, false, arg)
    if (editorRef.current) {
      editorRef.current.focus()
      onChange(editorRef.current.innerHTML)
    }
  }

  const colors = ['#111827', '#4b5563', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#6366f1', '#a855f7', '#ec4899']

  return (
    <div className={`flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#5138EE] focus-within:border-transparent ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 bg-gray-50/80">
        <button type="button" onClick={() => exec('bold')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => exec('italic')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => exec('underline')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Underline">
          <Underline className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button type="button" onClick={() => exec('formatBlock', 'H1')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors font-bold text-sm" title="Heading 1">
          H1
        </button>
        <button type="button" onClick={() => exec('formatBlock', 'H2')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors font-bold text-sm" title="Heading 2">
          H2
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button type="button" onClick={() => exec('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Bullet List">
          <List className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => exec('insertOrderedList')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Number List">
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button type="button" onClick={() => exec('insertHorizontalRule')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Horizontal Line">
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <div className="flex items-center gap-1 px-2">
          <span className="text-xs text-gray-500 font-medium mr-1">Color:</span>
          {colors.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => exec('foreColor', c)}
              className="w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform shadow-sm"
              style={{ backgroundColor: c }}
              title={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-6 focus:outline-none min-h-[300px] prose max-w-none w-full"
        style={{ minHeight: '300px' }}
      />
    </div>
  )
}
