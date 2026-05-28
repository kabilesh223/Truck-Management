import { useEffect, useState } from 'react'
import { getDashboard } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import PageHeader from '../components/PageHeader'

const INR = (v) => `₹${parseFloat(v||0).toLocaleString('en-IN',{minimumFractionDigits:0})}`

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getDashboard().then(r => setData(r.data))
  }, [])

  if (!data) return <div className="text-center py-20 text-slate-400">Loading dashboard...</div>

  const kpis = [
    { label:'Total Trips',    val: data.total_trips,                    bg:'bg-[#1F4E79]', icon:'🚛' },
    { label:'Total Freight',  val: INR(data.total_freight),             bg:'bg-green-600', icon:'💰' },
    { label:'Net Balance',    val: INR(data.total_balance),             bg: data.total_balance < 0 ? 'bg-red-500' : 'bg-blue-600', icon:'📊' },
    { label:'Fuel (L)',       val: parseFloat(data.total_fuel||0).toFixed(1), bg:'bg-purple-600', icon:'⛽' },
    { label:'Active Trucks',  val: data.trucks_count,                   bg:'bg-rose-600',  icon:'🚚' },
  ]

  const truckData  = Object.entries(data.truck_freight||{}).map(([k,v])=>({name:k, value:v}))
  const monthData  = Object.entries(data.monthly||{}).map(([k,v])=>({name:k, value:v}))
  const driverData = Object.entries(data.driver_bal||{}).map(([k,v])=>({name:k, value:v}))

  return (
    <div>
      <PageHeader title="📊 Dashboard" subtitle="Overview of all trip activity"/>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {kpis.map(k=>(
          <div key={k.label} className={`${k.bg} text-white rounded-xl p-4 text-center`}>
            <div className="text-2xl mb-1">{k.icon}</div>
            <div className="text-xl font-bold">{k.val}</div>
            <div className="text-xs opacity-80 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="Freight per Truck">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={truckData} margin={{bottom:30}}>
              <XAxis dataKey="name" tick={{fontSize:11}} angle={-30} textAnchor="end"/>
              <YAxis tick={{fontSize:10}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v=>INR(v)}/>
              <Bar dataKey="value" fill="#2E75B6" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Trips per Month">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthData} margin={{bottom:30}}>
              <XAxis dataKey="name" tick={{fontSize:11}} angle={-30} textAnchor="end"/>
              <YAxis tick={{fontSize:10}} allowDecimals={false}/>
              <Tooltip/>
              <Bar dataKey="value" fill="#27AE60" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Balance per Driver">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={driverData} margin={{bottom:30}}>
              <XAxis dataKey="name" tick={{fontSize:11}} angle={-30} textAnchor="end"/>
              <YAxis tick={{fontSize:10}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v=>INR(v)}/>
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {driverData.map((d,i)=>(
                  <Cell key={i} fill={d.value >= 0 ? '#27AE60' : '#E74C3C'}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-[#1F4E79] text-white px-4 py-3 font-bold text-sm">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  )
}
