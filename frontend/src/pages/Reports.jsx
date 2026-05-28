import { useState, useEffect } from 'react'
import { getTrips, getReport } from '../api'
import PageHeader from '../components/PageHeader'

export default function Reports() {
  const [trucks, setTrucks]   = useState([])
  const [drivers, setDrivers] = useState([])
  const [filters, setFilters] = useState({ truck:'All', driver:'All', date_from:'', date_to:'' })

  useEffect(() => {
    getTrips({}).then(r => {
      setTrucks([...new Set(r.data.trips.map(t=>t.truck_no).filter(Boolean))])
      setDrivers([...new Set(r.data.trips.map(t=>t.driver_name).filter(Boolean))])
    })
  }, [])

  const download = (report_type) => {
    getReport({ report_type, ...filters })
  }

  const set = k => e => setFilters(f=>({...f,[k]:e.target.value}))

  const reports = [
    { type:'full',       icon:'📋', color:'bg-[#1F4E79]', title:'Full Summary',    desc:'All trips in one sheet' },
    { type:'filtered',   icon:'🔍', color:'bg-blue-600',  title:'Filtered Report', desc:'Apply date/truck/driver filters' },
    { type:'per_truck',  icon:'🚛', color:'bg-purple-600',title:'Per-Truck',       desc:'Separate sheet per truck' },
    { type:'per_driver', icon:'👤', color:'bg-green-600', title:'Per-Driver',      desc:'Separate sheet per driver' },
    { type:'monthly',    icon:'📅', color:'bg-orange-500',title:'Monthly Summary', desc:'Separate sheet per month' },
  ]

  const inp = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"

  return (
    <div>
      <PageHeader title="📄 Reports" subtitle="Generate and download Excel reports"/>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h3 className="font-bold text-slate-700 mb-3">Filter Options</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">From Date</label>
            <input type="date" className={inp} value={filters.date_from} onChange={set('date_from')}/>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">To Date</label>
            <input type="date" className={inp} value={filters.date_to} onChange={set('date_to')}/>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Truck</label>
            <select className={inp} value={filters.truck} onChange={set('truck')}>
              <option value="All">All Trucks</option>
              {trucks.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Driver</label>
            <select className={inp} value={filters.driver} onChange={set('driver')}>
              <option value="All">All Drivers</option>
              {drivers.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map(r=>(
          <div key={r.type} className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-4xl mb-3">{r.icon}</div>
            <h3 className="font-bold text-slate-800 mb-1">{r.title}</h3>
            <p className="text-slate-500 text-sm mb-4">{r.desc}</p>
            <button onClick={()=>download(r.type)}
              className={`${r.color} text-white font-bold px-6 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity`}>
              ⬇️ Download Excel
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
