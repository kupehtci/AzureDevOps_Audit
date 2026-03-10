import './App.css'
import { AuditLogViewer } from './components'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <AuditLogViewer />
    </ThemeProvider>
  )
}

export default App
