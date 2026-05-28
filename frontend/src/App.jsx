import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSettings } from './api'
import Trips from './pages/Trips'
import NewTrip from './pages/NewTrip'
import EditTrip from './pages/EditTrip'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

export default function App() {
  const [company, setCompany] = useState('GOODS CARRIER')
  useEffect(() => {
    getSettings().then(r => setCompany(r.data.company_name || 'GOODS CARRIER'))
  }, [])

  const navClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all
     ${isActive ? 'bg-blue-600 text-yellow-300' : 'text-blue-200 hover:bg-blue-700 hover:text-white'}`

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-100">
        {/* Sidebar */}
        <aside className="w-56 bg-[#1F4E79] flex flex-col py-6 px-3 fixed h-full z-10">
          <div className="text-center mb-8">
            <div className="text-4xl mb-1">🚛</div>
            <div className="text-yellow-300 font-bold text-sm leading-tight">{company}</div>
            <div className="text-blue-300 text-xs mt-1">Trip Management</div>
          </div>
          <nav className="flex flex-col gap-1">
            <NavLink to="/trips"     className={navClass}>📋 All Trips</NavLink>
            <NavLink to="/new-trip"  className={navClass}>➕ New Trip</NavLink>
            <NavLink to="/dashboard" className={navClass}>📊 Dashboard</NavLink>
            <NavLink to="/reports"   className={navClass}>📄 Reports</NavLink>
            <NavLink to="/settings"  className={navClass}>⚙️ Settings</NavLink>
          </nav>
        </aside>

        {/* Main */}
        <main className="ml-56 flex-1 p-6">
          <Routes>
            <Route path="/"          element={<Trips />} />
            <Route path="/trips"     element={<Trips />} />
            <Route path="/new-trip"  element={<NewTrip />} />
            <Route path="/edit/:id"  element={<EditTrip />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports"   element={<Reports />} />
            <Route path="/settings"  element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
