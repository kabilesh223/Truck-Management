import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getTrips, deleteTrip, doBackup } from '../api'
import PageHeader from '../components/PageHeader'

const INR = (v) => `₹${parseFloat(v||0).toLocaleString('en-IN',{minimumFractionDigits:2})}`

export default function Trips() {
  const [trips, setTrips]       = useState([])
  const [summary, setSummary]   = useState({total_freight:0, total_balance:0})
  const [loading, setLoading]   = useState(true)
  const [filters, setFilters]   = useState({ search:'', truck:'All', driver:'All', date_from:'', date_to:'' })
  const [trucks, setTrucks]     = useState([])
  const [drivers, setDrivers]   = useState([])
  const [backupMsg, setBackupMsg] = useState('')
  const [sortCol, setSortCol]   = useState(null)
  const [sortAsc, setSortAsc]   = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.search)    params.search    = filters.search
      if (filters.truck !== 'All') params.truck = filters.truck
      if (filters.driver !== 'All') params.driver = filters.driver
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to)   params.date_to   = filters.date_to
      const r = await getTrips(params)
      setTrips(r.data.trips)
      setSummary({ total_freight: r.data.total_freight, total_balance: r.data.total_balance })
      setTrucks([...new Set(r.data.trips.map(t => t.truck_no).filter(Boolean))])
      setDrivers([...new Set(r.data.trips.map(t => t.driver_name).filter(Boolean))])
    } finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete Trip #${id}?`)) return
    await deleteTrip(id)
    load()
  }

  const handleBackup = async () => {
    const r = await doBackup()
    setBackupMsg(r.data.message)
    setTimeout(() => setBackupMsg(''), 4000)
  }

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc)
    else { setSortCol(col); setSortAsc(true) }
  }

  const sorted = [...trips].sort((a, b) => {
    if (!sortCol) return 0
    const av = a[sortCol], bv = b[sortCol]
    const n = parseFloat(av) - parseFloat(bv)
    if (!isNaN(n)) return sortAsc ? n : -n
    return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
  })

  const cols = [
    {key:'id',label:'#',w:'w-10'},
    {key:'date',label:'Date',w:'w-24'},
    {key:'truck_no',label:'Truck',w:'w-24'},
    {key:'driver_name',label:'Driver',w:'w-28'},
    {key:'loading_point',label:'From',w:'w-28'},
    {key:'delivery_point',label:'To',w:'w-28'},
    {key:'weight',label:'Wt(T)',w:'w-16'},
    {key:'freight',label:'Freight',w:'w-24'},
    {key:'toll',label:'Toll',w:'w-20'},
    {key:'commission',label:'Comm.',w:'w-20'},
    {key:'fuel_liters',label:'Fuel L',w:'w-16'},
    {key:'fuel_amount',label:'Fuel ₹',w:'w-20'},
    {key:'expenses',label:'Exp.',w:'w-20'},
    {key:'advance',label:'Advance',w:'w-20'},
    {key:'bill_amount',label:'Bill',w:'w-20'},
    {key:'total_trip_amount',label:'Total',w:'w-24'},
    {key:'balance_amount',label:'Balance',w:'w-24'},
  ]

  const moneyKeys = ['freight','toll','commission','fuel_amount','expenses','advance','bill_amount','total_trip_amount','balance_amount']

  return (
    <div>
      <PageHeader title="📋 All Trip Records" subtitle={`${trips.length} trips`}>
        <Link to="/new-trip" className="bg-yellow-400 hover:bg-yellow-300 text-[#1F4E79] font-bold px-4 py-2 rounded-lg text-sm">
          ➕ New Trip
        </Link>
        <button onClick={handleBackup} className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-lg text-sm">
          💾 Backup
        </button>
      </PageHeader>

      {backupMsg && <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg mb-4 text-sm">{backupMsg}</div>}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <input className="border rounded-lg px-3 py-2 text-sm col-span-2" placeholder="🔍 Search..."
            value={filters.search} onChange={e => setFilters(f=>({...f,search:e.target.value}))}/>
          <select className="border rounded-lg px-3 py-2 text-sm" value={filters.truck}
            onChange={e => setFilters(f=>({...f,truck:e.target.value}))}>
            <option value="All">All Trucks</option>
            {trucks.map(t=><option key={t}>{t}</option>)}
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm" value={filters.driver}
            onChange={e => setFilters(f=>({...f,driver:e.target.value}))}>
            <option value="All">All Drivers</option>
            {drivers.map(d=><option key={d}>{d}</option>)}
          </select>
          <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={filters.date_from}
            onChange={e => setFilters(f=>({...f,date_from:e.target.value}))}/>
          <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={filters.date_to}
            onChange={e => setFilters(f=>({...f,date_to:e.target.value}))}/>
        </div>
        <button onClick={() => setFilters({search:'',truck:'All',driver:'All',date_from:'',date_to:''})}
          className="mt-2 text-xs text-red-500 hover:underline">Clear filters</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          {label:'Trips', val: trips.length, bg:'bg-[#1F4E79]'},
          {label:'Total Freight', val: INR(summary.total_freight), bg:'bg-green-600'},
          {label:'Total Balance', val: INR(summary.total_balance), bg: summary.total_balance < 0 ? 'bg-red-500' : 'bg-blue-600'},
        ].map(c=>(
          <div key={c.label} className={`${c.bg} text-white rounded-xl p-4 text-center`}>
            <div className="text-xl font-bold">{c.val}</div>
            <div className="text-xs opacity-80 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#1F4E79] text-white">
                {cols.map(c=>(
                  <th key={c.key} onClick={()=>handleSort(c.key)}
                    className={`${c.w} px-2 py-3 text-center cursor-pointer hover:bg-blue-700 whitespace-nowrap select-none`}>
                    {c.label} {sortCol===c.key ? (sortAsc?'↑':'↓') : ''}
                  </th>
                ))}
                <th className="px-2 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={cols.length+1} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={cols.length+1} className="text-center py-8 text-slate-400">No trips found.</td></tr>
              ) : sorted.map((t,i) => (
                <tr key={t.id}
                  className={`border-b transition-colors ${
                    parseFloat(t.balance_amount) < 0 ? 'bg-red-50 hover:bg-red-100' :
                    i%2===0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50 hover:bg-slate-100'
                  }`}>
                  {cols.map(c=>(
                    <td key={c.key} className="px-2 py-2 text-center whitespace-nowrap">
                      {moneyKeys.includes(c.key) ? INR(t[c.key]) : (t[c.key] ?? '—')}
                    </td>
                  ))}
                  <td className="px-2 py-2 text-center whitespace-nowrap">
                    <Link to={`/edit/${t.id}`} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded mr-1 font-bold">✏️</Link>
                    <button onClick={()=>handleDelete(t.id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded font-bold">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
