import { AppBar, Box, CssBaseline, Toolbar, Typography } from '@mui/material'
import EditNoteIcon from '@mui/icons-material/EditNote'
import TextEditor from './components/TextEditor'

function App() {
  return (
    <>
      <CssBaseline />
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar variant="dense">
          <EditNoteIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" color='primary'>
            Text Editor
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f5f5f5', pb: 6 }}>
        <TextEditor />
      </Box>
    </>
  )
}

export default App
