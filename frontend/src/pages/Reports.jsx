import { useState, useEffect } from 'react'
import { getTrips, getReport } from '../api'
import PageHeader from '../components/PageHeader'

export default function Reports() {
  const [trucks, setTrucks]   = useState([])
  const [drivers, setDrivers] = useState([])
  const [filters, setFilters] = useState({truck:'All',driver:'All',date_from:'',date_to:''})

  useEffect(() => {
    getTrips({}).then(r => {
      setTrucks([...new Set(r.data.trips.map(t=>t.truck_no).filter(Boolean))])
      setDrivers([...new Set(r.data.trips.map(t=>t.driver_name).filter(Boolean))])
    })
  }, [])

  const set = k => e => setFilters(f=>({...f,[k]:e.target.value}))

  const reports = [
    {type:'full',      icon:'📋',color:'from-blue-900 to-indigo-900', title:'Full Summary',    desc:'All trips in one sheet'},
    {type:'filtered',  icon:'🔍',color:'from-blue-500 to-cyan-500',   title:'Filtered Report', desc:'Apply filters above'},
    {type:'per_truck', icon:'🚛',color:'from-purple-500 to-violet-600',title:'Per-Truck',      desc:'Separate sheet per truck'},
    {type:'per_driver',icon:'👤',color:'from-green-500 to-emerald-600',title:'Per-Driver',     desc:'Separate sheet per driver'},
    {type:'monthly',   icon:'📅',color:'from-orange-500 to-amber-500', title:'Monthly',        desc:'Separate sheet per month'},
  ]

  const inp = "w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"

  return (
    <div>
      <PageHeader title="📄 Reports" subtitle="Generate and download Excel reports"/>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="font-black text-gray-700 mb-4 text-sm uppercase tracking-wide">🔧 Filter Options</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">From</label>
            <input type="date" className={inp} value={filters.date_from} onChange={set('date_from')}/>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">To</label>
            <input type="date" className={inp} value={filters.date_to} onChange={set('date_to')}/>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Truck</label>
            <select className={inp} value={filters.truck} onChange={set('truck')}>
              <option value="All">All Trucks</option>
              {trucks.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Driver</label>
            <select className={inp} value={filters.driver} onChange={set('driver')}>
              <option value="All">All Drivers</option>
              {drivers.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map(r=>(
          <div key={r.type}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
            <div className={`bg-gradient-to-r ${r.color} p-5 text-center`}>
              <div className="text-4xl mb-2">{r.icon}</div>
              <h3 className="text-white font-black text-base">{r.title}</h3>
              <p className="text-white/70 text-xs mt-1">{r.desc}</p>
            </div>
            <div className="p-4">
              <button onClick={()=>getReport({report_type:r.type,...filters})}
                className={`w-full bg-gradient-to-r ${r.color} text-white font-black py-3 rounded-xl text-sm
                  shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-95`}>
                ⬇️ Download Excel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
