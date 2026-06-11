import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getTrips, deleteTrip, doBackup } from '../api'
import PageHeader from '../components/PageHeader'

const INR = v => `₹${parseFloat(v||0).toLocaleString('en-IN',{minimumFractionDigits:2})}`

export default function Trips() {
  const [trips, setTrips]     = useState([])
  const [summary, setSummary] = useState({total_freight:0,total_balance:0})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({search:'',truck:'All',driver:'All',date_from:'',date_to:''})
  const [trucks, setTrucks]   = useState([])
  const [drivers, setDrivers] = useState([])
  const [backupMsg, setBackupMsg] = useState('')
  const [sortCol, setSortCol] = useState(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [viewMode, setViewMode] = useState('table') // table | card

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.search) params.search = filters.search
      if (filters.truck !== 'All') params.truck = filters.truck
      if (filters.driver !== 'All') params.driver = filters.driver
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to)   params.date_to   = filters.date_to
      const r = await getTrips(params)
      setTrips(r.data.trips)
      setSummary({total_freight:r.data.total_freight, total_balance:r.data.total_balance})
      setTrucks([...new Set(r.data.trips.map(t=>t.truck_no).filter(Boolean))])
      setDrivers([...new Set(r.data.trips.map(t=>t.driver_name).filter(Boolean))])
    } finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleDelete = async id => {
    if (!window.confirm(`Delete Trip #${id}?`)) return
    await deleteTrip(id); load()
  }

  const handleBackup = async () => {
    const r = await doBackup()
    setBackupMsg(r.data.message)
    setTimeout(() => setBackupMsg(''), 4000)
  }

  const sorted = [...trips].sort((a,b) => {
    if (!sortCol) return 0
    const n = parseFloat(a[sortCol]) - parseFloat(b[sortCol])
    if (!isNaN(n)) return sortAsc ? n : -n
    return sortAsc
      ? String(a[sortCol]).localeCompare(String(b[sortCol]))
      : String(b[sortCol]).localeCompare(String(a[sortCol]))
  })

  return (
    <div>
      <PageHeader title="📋 All Trips" subtitle={`${trips.length} records`}>
        <Link to="/new-trip"
          className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 font-black px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md transition-all">
          ➕ New Trip
        </Link>
        <button onClick={handleBackup}
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md transition-all">
          💾 Backup
        </button>
        <button onClick={() => setViewMode(v => v==='table'?'card':'table')}
          className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all">
          {viewMode==='table' ? '📱' : '🖥️'}
        </button>
      </PageHeader>

      {backupMsg && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl mb-4 text-sm font-semibold">
          ✅ {backupMsg}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <input className="col-span-2 sm:col-span-1 border-2 border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            placeholder="🔍 Search..." value={filters.search}
            onChange={e => setFilters(f=>({...f,search:e.target.value}))}/>
          <select className="border-2 border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            value={filters.truck} onChange={e=>setFilters(f=>({...f,truck:e.target.value}))}>
            <option value="All">All Trucks</option>
            {trucks.map(t=><option key={t}>{t}</option>)}
          </select>
          <select className="border-2 border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            value={filters.driver} onChange={e=>setFilters(f=>({...f,driver:e.target.value}))}>
            <option value="All">All Drivers</option>
            {drivers.map(d=><option key={d}>{d}</option>)}
          </select>
          <input type="date" className="border-2 border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            value={filters.date_from} onChange={e=>setFilters(f=>({...f,date_from:e.target.value}))}/>
          <div className="flex gap-2">
            <input type="date" className="flex-1 border-2 border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              value={filters.date_to} onChange={e=>setFilters(f=>({...f,date_to:e.target.value}))}/>
            <button onClick={()=>setFilters({search:'',truck:'All',driver:'All',date_from:'',date_to:''})}
              className="bg-red-100 hover:bg-red-200 text-red-600 font-bold px-3 rounded-xl text-sm transition-all">✕</button>
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          {label:'Trips',val:trips.length,bg:'from-blue-600 to-blue-700',icon:'🚛'},
          {label:'Freight',val:INR(summary.total_freight),bg:'from-green-500 to-emerald-600',icon:'💰'},
          {label:'Balance',val:INR(summary.total_balance),
           bg:summary.total_balance<0?'from-red-500 to-rose-600':'from-indigo-500 to-purple-600',icon:'📊'},
        ].map(c=>(
          <div key={c.label} className={`bg-gradient-to-br ${c.bg} text-white rounded-2xl p-3 sm:p-4 text-center shadow-lg`}>
            <div className="text-lg sm:text-xl mb-0.5">{c.icon}</div>
            <div className="text-sm sm:text-xl font-black truncate">{c.val}</div>
            <div className="text-xs opacity-80">{c.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="text-4xl animate-bounce">🚛</div>
          <p className="text-gray-400 mt-3 font-semibold">Loading trips...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-400 font-semibold">No trips found</p>
          <Link to="/new-trip" className="mt-4 inline-block bg-blue-600 text-white font-bold px-6 py-2 rounded-xl text-sm">
            Add First Trip
          </Link>
        </div>
      ) : viewMode === 'card' ? (
        // Card view (mobile friendly)
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sorted.map(t => (
            <div key={t.id} className={`bg-white rounded-2xl shadow-sm border-2 p-4 transition-all hover:shadow-md
              ${parseFloat(t.balance_amount)<0 ? 'border-red-200' : 'border-gray-100'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-lg">#{t.id}</span>
                  <span className="text-xs text-gray-400 ml-2">{t.date}</span>
                </div>
                <div className="flex gap-1">
                  <Link to={`/edit/${t.id}`} className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-1.5 rounded-lg font-bold text-xs transition-all">✏️</Link>
                  <button onClick={()=>handleDelete(t.id)} className="bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded-lg font-bold text-xs transition-all">🗑️</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-xs text-gray-400">Truck</span><div className="font-bold text-gray-800">{t.truck_no}</div></div>
                <div><span className="text-xs text-gray-400">Driver</span><div className="font-bold text-gray-800">{t.driver_name}</div></div>
                <div><span className="text-xs text-gray-400">From</span><div className="font-semibold text-gray-700 text-xs">{t.loading_point}</div></div>
                <div><span className="text-xs text-gray-400">To</span><div className="font-semibold text-gray-700 text-xs">{t.delivery_point}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                <div className="bg-green-50 rounded-xl p-2 text-center">
                  <div className="text-xs text-green-600 font-bold">Freight</div>
                  <div className="font-black text-green-700 text-sm">{INR(t.freight)}</div>
                </div>
                <div className={`rounded-xl p-2 text-center ${parseFloat(t.balance_amount)<0?'bg-red-50':'bg-blue-50'}`}>
                  <div className={`text-xs font-bold ${parseFloat(t.balance_amount)<0?'text-red-600':'text-blue-600'}`}>Balance</div>
                  <div className={`font-black text-sm ${parseFloat(t.balance_amount)<0?'text-red-700':'text-blue-700'}`}>{INR(t.balance_amount)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Table view
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
                  {[['id','#'],['date','Date'],['truck_no','Truck'],['driver_name','Driver'],
                    ['loading_point','From'],['delivery_point','To'],['freight','Freight'],
                    ['bill_amount','Bill'],['total_trip_amount','Total'],['balance_amount','Balance']
                  ].map(([key,label])=>(
                    <th key={key} onClick={()=>{setSortCol(key);setSortAsc(s=>sortCol===key?!s:true)}}
                      className="px-3 py-3.5 text-center cursor-pointer hover:bg-white/10 whitespace-nowrap font-bold select-none">
                      {label} {sortCol===key?(sortAsc?'↑':'↓'):''}
                    </th>
                  ))}
                  <th className="px-3 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((t,i)=>(
                  <tr key={t.id} className={`border-b border-gray-50 transition-colors
                    ${parseFloat(t.balance_amount)<0?'bg-red-50 hover:bg-red-100':
                      i%2===0?'bg-white hover:bg-blue-50':'bg-slate-50 hover:bg-blue-50'}`}>
                    <td className="px-3 py-2.5 text-center font-bold text-gray-500">#{t.id}</td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">{t.date}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-blue-700">{t.truck_no}</td>
                    <td className="px-3 py-2.5 text-center">{t.driver_name}</td>
                    <td className="px-3 py-2.5 text-center text-gray-600 max-w-[100px] truncate">{t.loading_point}</td>
                    <td className="px-3 py-2.5 text-center text-gray-600 max-w-[100px] truncate">{t.delivery_point}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-green-700">{INR(t.freight)}</td>
                    <td className="px-3 py-2.5 text-center">{INR(t.bill_amount)}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-amber-700">{INR(t.total_trip_amount)}</td>
                    <td className={`px-3 py-2.5 text-center font-black ${parseFloat(t.balance_amount)<0?'text-red-600':'text-blue-700'}`}>
                      {INR(t.balance_amount)}
                    </td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <Link to={`/edit/${t.id}`} className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-lg mr-1 font-bold transition-all">✏️</Link>
                      <button onClick={()=>handleDelete(t.id)} className="bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded-lg font-bold transition-all">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
