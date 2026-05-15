import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { Extension } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import * as Y from 'yjs'
import { HocuspocusProvider } from '@hocuspocus/provider'
import { Box, Chip, Paper, Typography } from '@mui/material'
import CircleIcon from '@mui/icons-material/Circle'
import Toolbar from './Toolbar'
import './TextEditor.css'

const STORAGE_KEY = 'texteditor-content'
const DEBOUNCE_MS = 500

const USER_COLORS = ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']
const userColor = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]
const userName = `User ${Math.floor(Math.random() * 900) + 100}`

const ydoc = new Y.Doc()

const provider = new HocuspocusProvider({
  url: 'ws://localhost:1234',
  name: 'document',
  document: ydoc,
})

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: el => el.style.fontSize || null,
          renderHTML: attrs => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }: { chain: () => { setMark: (name: string, attrs: object) => { run: () => boolean } } }) =>
        chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }: { chain: () => { setMark: (name: string, attrs: object) => { removeEmptyTextStyle: () => { run: () => boolean } } } }) =>
        chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    } as never
  },
})

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

export default function TextEditor() {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('connecting')
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = ({ status }: { status: ConnectionStatus }) => setConnStatus(status)
    provider.on('status', handler)
    return () => {
      provider.off('status', handler)
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ undoRedo: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      FontSize,
      Collaboration.configure({ document: ydoc, provider }),
      CollaborationCaret.configure({
        provider,
        user: { name: userName, color: userColor },
        render(user) {
          const caret = document.createElement('span')
          caret.classList.add('collaboration-carets__caret')
          caret.style.borderColor = user.color

          const label = document.createElement('div')
          label.classList.add('collaboration-carets__label')
          label.style.backgroundColor = user.color
          label.textContent = user.name

          caret.appendChild(label)
          return caret
        },
        selectionRender(user) {
          return {
            nodeName: 'span',
            class: 'collaboration-carets__selection',
            style: `background-color: ${user.color}33`,
          }
        },
      }),
    ],
    onUpdate({ editor }) {
      setSaveStatus('saving')
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(editor.getJSON()))
        setSaveStatus('saved')
      }, DEBOUNCE_MS)
    },
  })

  const text = editor?.getText() ?? ''
  const charCount = text.length
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length

  const connColor = connStatus === 'connected' ? 'success' : connStatus === 'connecting' ? 'warning' : 'error'

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', mt: 4, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Chip
          icon={<CircleIcon sx={{ fontSize: '10px !important' }} />}
          label={connStatus}
          size="small"
          color={connColor}
          variant="outlined"
          sx={{ textTransform: 'capitalize', fontSize: 12 }}
        />
        <Typography variant="caption" color="text.secondary">
          Signed in as <strong style={{ color: userColor }}>{userName}</strong>
        </Typography>
      </Box>
      <Toolbar editor={editor} />
      <Paper
        variant="outlined"
        sx={{ borderRadius: '0 0 8px 8px', minHeight: 480, p: 2, cursor: 'text' }}
        onClick={() => editor?.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" color={saveStatus === 'saving' ? 'text.disabled' : 'success.main'}>
          {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} {charCount === 1 ? 'character' : 'characters'}
        </Typography>
      </Box>
    </Box>
  )
}
