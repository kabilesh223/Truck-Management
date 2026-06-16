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

const navItems = [
  { to: '/trips',     icon: <TruckIcon />, label: 'All Trips' },
  { to: '/new-trip',  icon: <PlusIcon />,  label: 'New Trip' },
  { to: '/dashboard', icon: <ChartIcon />, label: 'Dashboard' },
  { to: '/reports',   icon: <FileIcon />,  label: 'Reports' },
  { to: '/settings',  icon: <GearIcon />,  label: 'Settings' },
]

function Layout() {
  const navigate  = useNavigate()
  const [company, setCompany] = useState('TripManager')
  const [sideOpen, setSideOpen] = useState(false)
  const username = localStorage.getItem('username') || 'User'

  useEffect(() => {
    getSettings().then(r => setCompany(r.data.company_name || 'TripManager')).catch(() => {})
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen" style={{background:'#0F1A15'}}>
      {sideOpen && (
        <div className="fixed inset-0 z-20 lg:hidden" style={{background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)'}}
          onClick={() => setSideOpen(false)}/>
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-30 w-60 flex flex-col transform transition-transform duration-300
        ${sideOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
        style={{background:'linear-gradient(180deg,#1D2E28,#18392B 60%,#0F1A15)', borderRight:'1px solid rgba(46,204,113,0.1)'}}>

        {/* Brand */}
        <div className="px-5 py-6" style={{borderBottom:'1px solid rgba(46,204,113,0.1)'}}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 anim-pulse-glow"
              style={{background:'linear-gradient(135deg,#2ECC71,#1A8A4A)'}}>
              <TruckIcon size={18} color="#0F1A15" />
            </div>
            <div>
              <div className="font-extrabold text-sm leading-tight" style={{color:'#2ECC71'}}>{company}</div>
              <div className="text-xs font-medium" style={{color:'rgba(232,245,233,0.3)'}}>Trip Management</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} onClick={() => setSideOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                 ${isActive ? 'nav-link-active' : ''}`
              }
              style={({ isActive }) => isActive ? {} : {color:'rgba(232,245,233,0.45)'}}>
              <span style={{color:'inherit'}}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 pb-5" style={{borderTop:'1px solid rgba(46,204,113,0.1)', paddingTop:'16px'}}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{background:'linear-gradient(135deg,#2ECC71,#1A8A4A)', color:'#0F1A15'}}>
              {username[0].toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-sm" style={{color:'#E8F5E9'}}>{username}</div>
              <div className="text-xs font-medium" style={{color:'#2ECC71'}}>Active</div>
            </div>
          </div>
          <button onClick={logout} className="btn btn-danger w-full text-xs py-2">Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden px-4 py-3 flex items-center justify-between sticky top-0 z-10"
          style={{background:'rgba(24,57,43,0.95)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(46,204,113,0.12)'}}>
          <button onClick={() => setSideOpen(true)} className="p-2 rounded-lg btn-ghost btn">
            <MenuIcon />
          </button>
          <span className="font-extrabold text-sm" style={{color:'#2ECC71'}}>{company}</span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
            style={{background:'linear-gradient(135deg,#2ECC71,#1A8A4A)', color:'#0F1A15'}}>
            {username[0].toUpperCase()}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 anim-fadeIn">
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
        <Route path="/*" element={<ProtectedRoute><Layout /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

// SVG Icons
function TruckIcon({ size=16, color='currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
}
function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
}
function ChartIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
}
function FileIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
}
function GearIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
}
function MenuIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
}
