import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getTrips, deleteTrip, doBackup } from '../api'
import PageHeader from '../components/PageHeader'

const INR = v => `Rs ${parseFloat(v||0).toLocaleString('en-IN',{minimumFractionDigits:2})}`

export default function Trips() {
  const [trips, setTrips]       = useState([])
  const [summary, setSummary]   = useState({total_freight:0,total_balance:0})
  const [loading, setLoading]   = useState(true)
  const [filters, setFilters]   = useState({search:'',truck:'All',driver:'All',date_from:'',date_to:''})
  const [trucks, setTrucks]     = useState([])
  const [drivers, setDrivers]   = useState([])
  const [backupMsg, setBackupMsg] = useState('')
  const [sortCol, setSortCol]   = useState(null)
  const [sortAsc, setSortAsc]   = useState(true)
  const [viewMode, setViewMode] = useState('table')

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
    if (!window.confirm(`Delete Trip #${id}? This cannot be undone.`)) return
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
    return sortAsc ? String(a[sortCol]).localeCompare(String(b[sortCol]))
                   : String(b[sortCol]).localeCompare(String(a[sortCol]))
  })

  const cols = [
    {key:'id',label:'No'},
    {key:'date',label:'Date'},
    {key:'truck_no',label:'Truck'},
    {key:'driver_name',label:'Driver'},
    {key:'loading_point',label:'From'},
    {key:'delivery_point',label:'To'},
    {key:'freight',label:'Freight'},
    {key:'bill_amount',label:'Bill Amt'},
    {key:'advance',label:'Advance'},
    {key:'total_trip_amount',label:'Total Trip'},
  ]

  return (
    <div className="anim-fadeIn">
      <PageHeader title="All Trips" subtitle={`${trips.length} records found`}>
        <Link to="/new-trip" className="btn btn-green text-xs px-4 py-2">New Trip</Link>
        <button onClick={handleBackup} className="btn btn-outline text-xs px-4 py-2">Backup</button>
        <button onClick={() => setViewMode(v => v==='table'?'card':'table')}
          className="btn btn-ghost text-xs px-3 py-2">
          {viewMode==='table' ? 'Card View' : 'Table View'}
        </button>
      </PageHeader>

      {backupMsg && (
        <div className="px-4 py-3 rounded-xl mb-4 text-xs font-semibold anim-fadeIn"
          style={{background:'rgba(46,204,113,0.1)', border:'1px solid rgba(46,204,113,0.2)', color:'#2ECC71'}}>
          {backupMsg}
        </div>
      )}

      {/* Filters */}
      <div className="card-flat p-4 mb-4 anim-fadeInUp">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <input className="inp col-span-2 sm:col-span-1" placeholder="Search trips..."
            value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value}))}/>
          <select className="inp" value={filters.truck} onChange={e=>setFilters(f=>({...f,truck:e.target.value}))}>
            <option value="All">All Trucks</option>
            {trucks.map(t=><option key={t}>{t}</option>)}
          </select>
          <select className="inp" value={filters.driver} onChange={e=>setFilters(f=>({...f,driver:e.target.value}))}>
            <option value="All">All Drivers</option>
            {drivers.map(d=><option key={d}>{d}</option>)}
          </select>
          <input type="date" className="inp" value={filters.date_from}
            onChange={e=>setFilters(f=>({...f,date_from:e.target.value}))}/>
          <div className="flex gap-2">
            <input type="date" className="inp flex-1" value={filters.date_to}
              onChange={e=>setFilters(f=>({...f,date_to:e.target.value}))}/>
            <button onClick={()=>setFilters({search:'',truck:'All',driver:'All',date_from:'',date_to:''})}
              className="btn btn-danger px-3 text-xs">Clear</button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          {label:'Total Trips', val:trips.length, color:'#2ECC71'},
          {label:'Total Freight', val:INR(summary.total_freight), color:'#3498DB'},
          {label:'Total Balance', val:INR(summary.total_balance), color: summary.total_balance<0?'#E74C3C':'#F39C12'},
        ].map(c=>(
          <div key={c.label} className="kpi-card anim-fadeInUp">
            <div className="kpi-val" style={{color:c.color, fontSize:'18px'}}>{c.val}</div>
            <div className="kpi-lbl">{c.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-3"
            style={{borderColor:'rgba(46,204,113,0.3)', borderTopColor:'#2ECC71'}}/>
          <p className="text-xs font-semibold" style={{color:'rgba(232,245,233,0.4)'}}>Loading trips...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 card-flat">
          <p className="text-sm font-semibold mb-3" style={{color:'rgba(232,245,233,0.4)'}}>No trips found</p>
          <Link to="/new-trip" className="btn btn-green text-xs px-6 py-2">Add First Trip</Link>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sorted.map((t,i) => (
            <div key={t.id} className="card p-4 anim-fadeInUp" style={{animationDelay:`${i*0.05}s`}}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="badge badge-green text-xs">#{t.id}</span>
                  <span className="text-xs ml-2" style={{color:'rgba(232,245,233,0.4)'}}>{t.date}</span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/edit/${t.id}`} className="btn btn-outline text-xs py-1 px-3">Edit</Link>
                  <button onClick={()=>handleDelete(t.id)} className="btn btn-danger text-xs py-1 px-3">Delete</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="inp-label">Truck</div>
                  <div className="font-bold" style={{color:'#2ECC71'}}>{t.truck_no}</div>
                </div>
                <div>
                  <div className="inp-label">Driver</div>
                  <div className="font-semibold" style={{color:'#E8F5E9'}}>{t.driver_name}</div>
                </div>
                <div>
                  <div className="inp-label">From</div>
                  <div style={{color:'rgba(232,245,233,0.6)'}}>{t.loading_point}</div>
                </div>
                <div>
                  <div className="inp-label">To</div>
                  <div style={{color:'rgba(232,245,233,0.6)'}}>{t.delivery_point}</div>
                </div>
              </div>
              <div className="flex justify-between mt-3 pt-3" style={{borderTop:'1px solid rgba(46,204,113,0.1)'}}>
                <div>
                  <div className="inp-label">Freight</div>
                  <div className="font-bold text-sm" style={{color:'#2ECC71'}}>{INR(t.freight)}</div>
                </div>
                <div className="text-right">
                  <div className="inp-label">Total Trip</div>
                  <div className="font-bold text-sm" style={{color: parseFloat(t.total_trip_amount)<0?'#E74C3C':'#F39C12'}}>
                    {INR(t.total_trip_amount)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-flat overflow-hidden anim-fadeInUp">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  {cols.map(c=>(
                    <th key={c.key} onClick={()=>{setSortCol(c.key);setSortAsc(s=>sortCol===c.key?!s:true)}}>
                      {c.label} {sortCol===c.key?(sortAsc?'↑':'↓'):''}
                    </th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((t,i) => (
                  <tr key={t.id} style={{background: i%2===0?'rgba(29,46,40,0.4)':'transparent'}}>
                    <td><span className="badge badge-green">#{t.id}</span></td>
                    <td>{t.date}</td>
                    <td style={{color:'#2ECC71', fontWeight:700}}>{t.truck_no}</td>
                    <td>{t.driver_name}</td>
                    <td style={{color:'rgba(232,245,233,0.6)', maxWidth:'100px'}} className="truncate">{t.loading_point}</td>
                    <td style={{color:'rgba(232,245,233,0.6)', maxWidth:'100px'}} className="truncate">{t.delivery_point}</td>
                    <td style={{color:'#2ECC71', fontWeight:700}}>{INR(t.freight)}</td>
                    <td>{INR(t.bill_amount)}</td>
                    <td>{INR(t.advance)}</td>
                    <td style={{color: parseFloat(t.total_trip_amount)<0?'#E74C3C':'#F39C12', fontWeight:800}}>
                      {INR(t.total_trip_amount)}
                    </td>
                    <td>
                      <div className="flex gap-2 justify-center">
                        <Link to={`/edit/${t.id}`} className="btn btn-outline text-xs py-1 px-3">Edit</Link>
                        <button onClick={()=>handleDelete(t.id)} className="btn btn-danger text-xs py-1 px-3">Delete</button>
                      </div>
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
