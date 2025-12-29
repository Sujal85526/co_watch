import Navbar from './Navbar.jsx'

export default function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pb-12">
        {children}
      </main>
    </div>
  )
}
