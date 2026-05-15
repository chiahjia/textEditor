import FormatBoldIcon from '@mui/icons-material/FormatBold'
import FormatItalicIcon from '@mui/icons-material/FormatItalic'
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined'
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import UndoIcon from '@mui/icons-material/Undo'
import RedoIcon from '@mui/icons-material/Redo'
import CodeIcon from '@mui/icons-material/Code'
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft'
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter'
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight'
import FormatColorTextIcon from '@mui/icons-material/FormatColorText'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import { Divider, IconButton, MenuItem, Paper, Select, Tooltip } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { Editor } from '@tiptap/react'

interface ToolbarProps {
  editor: Editor | null
}

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px']

const COLORS = [
  { label: 'Default', value: '' },
  { label: 'Black', value: '#000000' },
  { label: 'Gray', value: '#6b7280' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Yellow', value: '#eab308' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Purple', value: '#a855f7' },
]

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null

  const headingValue = (() => {
    if (editor.isActive('heading', { level: 1 })) return '1'
    if (editor.isActive('heading', { level: 2 })) return '2'
    if (editor.isActive('heading', { level: 3 })) return '3'
    return '0'
  })()

  const handleHeadingChange = (e: SelectChangeEvent) => {
    const val = e.target.value
    if (val === '0') editor.chain().focus().setParagraph().run()
    else editor.chain().focus().toggleHeading({ level: Number(val) as 1 | 2 | 3 }).run()
  }

  const handleFontSizeChange = (e: SelectChangeEvent) => {
    const val = e.target.value
    if (!val) (editor.chain().focus() as never as { unsetFontSize: () => { run: () => void } }).unsetFontSize().run()
    else (editor.chain().focus() as never as { setFontSize: (s: string) => { run: () => void } }).setFontSize(val).run()
  }

  const handleColorChange = (e: SelectChangeEvent) => {
    const val = e.target.value
    if (!val) editor.chain().focus().unsetColor().run()
    else editor.chain().focus().setColor(val).run()
  }

  const handleClear = () => {
    editor.chain().focus().clearContent(true).run()
  }

  const currentColor = editor.getAttributes('textStyle').color ?? ''
  const currentFontSize = editor.getAttributes('textStyle').fontSize ?? ''

  const btn = (label: string, onClick: () => void, active: boolean, Icon: React.ElementType) => (
    <Tooltip title={label} key={label}>
      <IconButton size="small" onClick={onClick} color={active ? 'primary' : 'default'} sx={{ borderRadius: 1 }}>
        <Icon fontSize="small" />
      </IconButton>
    </Tooltip>
  )

  const selectSx = { fontSize: 13, height: 32 }

  return (
    <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, p: 0.75, borderRadius: '8px 8px 0 0', borderBottom: 'none' }}>
      <Select size="small" value={headingValue} onChange={handleHeadingChange} sx={{ ...selectSx, minWidth: 110 }}>
        <MenuItem value="0">Paragraph</MenuItem>
        <MenuItem value="1">Heading 1</MenuItem>
        <MenuItem value="2">Heading 2</MenuItem>
        <MenuItem value="3">Heading 3</MenuItem>
      </Select>

      <Select size="small" value={currentFontSize} onChange={handleFontSizeChange} displayEmpty sx={{ ...selectSx, minWidth: 90 }}>
        <MenuItem value=""><em>Size</em></MenuItem>
        {FONT_SIZES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </Select>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {btn('Bold', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'), FormatBoldIcon)}
      {btn('Italic', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'), FormatItalicIcon)}
      {btn('Underline', () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'), FormatUnderlinedIcon)}
      {btn('Strikethrough', () => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'), StrikethroughSIcon)}
      {btn('Code', () => editor.chain().focus().toggleCode().run(), editor.isActive('code'), CodeIcon)}

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {btn('Align Left', () => editor.chain().focus().setTextAlign('left').run(), editor.isActive({ textAlign: 'left' }), FormatAlignLeftIcon)}
      {btn('Align Center', () => editor.chain().focus().setTextAlign('center').run(), editor.isActive({ textAlign: 'center' }), FormatAlignCenterIcon)}
      {btn('Align Right', () => editor.chain().focus().setTextAlign('right').run(), editor.isActive({ textAlign: 'right' }), FormatAlignRightIcon)}

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {btn('Bullet List', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'), FormatListBulletedIcon)}
      {btn('Ordered List', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'), FormatListNumberedIcon)}
      {btn('Blockquote', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'), FormatQuoteIcon)}

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Text Color">
        <Select
          size="small"
          value={currentColor}
          onChange={handleColorChange}
          displayEmpty
          renderValue={() => <FormatColorTextIcon fontSize="small" sx={{ color: currentColor || 'inherit', display: 'block' }} />}
          sx={{ ...selectSx, minWidth: 48, '.MuiSelect-select': { pr: '24px !important', pl: '8px' } }}
        >
          {COLORS.map(c => (
            <MenuItem key={c.value} value={c.value} sx={{ gap: 1 }}>
              <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 2, background: c.value || '#000', border: '1px solid #ccc', flexShrink: 0 }} />
              {c.label}
            </MenuItem>
          ))}
        </Select>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {btn('Undo', () => editor.chain().focus().undo().run(), false, UndoIcon)}
      {btn('Redo', () => editor.chain().focus().redo().run(), false, RedoIcon)}

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Clear content">
        <IconButton size="small" onClick={handleClear} color="error" sx={{ borderRadius: 1 }}>
          <DeleteSweepIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Paper>
  )
}
