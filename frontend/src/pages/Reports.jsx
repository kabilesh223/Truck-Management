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
    {type:'full',       title:'Full Summary',    desc:'All trips exported to one sheet'},
    {type:'filtered',   title:'Filtered Report', desc:'Apply date, truck or driver filters'},
    {type:'per_truck',  title:'Per Truck',        desc:'Separate sheet for each truck'},
    {type:'per_driver', title:'Per Driver',       desc:'Separate sheet for each driver'},
    {type:'monthly',    title:'Monthly Summary',  desc:'Separate sheet for each month'},
  ]

  return (
    <div className="anim-fadeIn">
      <PageHeader title="Reports" subtitle="Generate and download Excel reports"/>

      {/* Filters */}
      <div className="card-flat p-5 mb-6 anim-fadeInUp">
        <div className="section-header mb-4">Filter Options</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="inp-label">From Date</label>
            <input type="date" className="inp" value={filters.date_from} onChange={set('date_from')}/>
          </div>
          <div>
            <label className="inp-label">To Date</label>
            <input type="date" className="inp" value={filters.date_to} onChange={set('date_to')}/>
          </div>
          <div>
            <label className="inp-label">Truck</label>
            <select className="inp" value={filters.truck} onChange={set('truck')}>
              <option value="All">All Trucks</option>
              {trucks.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="inp-label">Driver</label>
            <select className="inp" value={filters.driver} onChange={set('driver')}>
              <option value="All">All Drivers</option>
              {drivers.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r,i) => (
          <div key={r.type} className={`card p-5 flex flex-col justify-between anim-fadeInUp d-${(i+1)*100}`}>
            <div>
              <div className="font-extrabold text-sm mb-1" style={{color:'#E8F5E9'}}>{r.title}</div>
              <div className="text-xs mb-4" style={{color:'rgba(232,245,233,0.4)'}}>{r.desc}</div>
            </div>
            <button onClick={() => getReport({report_type:r.type,...filters})}
              className="btn btn-green text-xs py-2.5 w-full">
              Download Excel
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
