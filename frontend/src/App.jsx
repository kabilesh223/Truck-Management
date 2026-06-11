import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSettings } from './api'
import Trips from './pages/Trips'
import NewTrip from './pages/NewTrip'
import EditTrip from './pages/EditTrip'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function Layout() {
  const navigate   = useNavigate()
  const [company, setCompany]     = useState('TripManager')
  const [sideOpen, setSideOpen]   = useState(false)
  const username = localStorage.getItem('username') || 'User'

  useEffect(() => {
    getSettings().then(r => setCompany(r.data.company_name || 'TripManager')).catch(()=>{})
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  const navItems = [
    { to: '/trips',     icon: '📋', label: 'All Trips' },
    { to: '/new-trip',  icon: '➕', label: 'New Trip' },
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/reports',   icon: '📄', label: 'Reports' },
    { to: '/settings',  icon: '⚙️', label: 'Settings' },
  ]

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
     ${isActive
       ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 shadow-lg'
       : 'text-blue-100 hover:bg-white/10 hover:text-white'}`

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sideOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSideOpen(false)}/>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-30 w-64 flex flex-col
        bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900
        transform transition-transform duration-300 ease-in-out
        ${sideOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-xl shadow-lg flex-shrink-0">
              🚛
            </div>
            <div className="min-w-0">
              <div className="text-yellow-300 font-black text-sm truncate">{company}</div>
              <div className="text-blue-300 text-xs">Trip Management</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={navClass}
              onClick={() => setSideOpen(false)}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {username[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-white font-bold text-sm truncate">{username}</div>
              <div className="text-blue-300 text-xs">Logged in</div>
            </div>
          </div>
          <button onClick={logout}
            className="w-full bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white font-semibold py-2 px-3 rounded-lg text-xs transition-all">
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-lg">
          <button onClick={() => setSideOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <div className="space-y-1.5">
              <div className="w-5 h-0.5 bg-white"/>
              <div className="w-5 h-0.5 bg-white"/>
              <div className="w-5 h-0.5 bg-white"/>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚛</span>
            <span className="font-black text-yellow-300 text-sm">{company}</span>
          </div>
          <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-black text-sm">
            {username[0].toUpperCase()}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 max-w-full overflow-x-hidden">
          <Routes>
            <Route path="/"          element={<Navigate to="/trips" replace />} />
            <Route path="/trips"     element={<Trips />} />
            <Route path="/new-trip"  element={<NewTrip />} />
            <Route path="/edit/:id"  element={<EditTrip />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports"   element={<Reports />} />
            <Route path="/settings"  element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
