import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import Router from './router.jsx'
import PageShell from './components/layout/PageShell.jsx'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PageShell>
          <Router />
        </PageShell>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
