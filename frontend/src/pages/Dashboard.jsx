import { useEffect, useState } from 'react'
import { getDashboard } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import PageHeader from '../components/PageHeader'

const INR = v => `₹${parseFloat(v||0).toLocaleString('en-IN',{minimumFractionDigits:0})}`

export default function Dashboard() {
  const [data, setData] = useState(null)
  useEffect(() => { getDashboard().then(r=>setData(r.data)) }, [])

  if (!data) return (
    <div className="text-center py-20">
      <div className="text-5xl animate-bounce">📊</div>
      <p className="text-gray-400 mt-3 font-semibold">Loading dashboard...</p>
    </div>
  )

  const kpis = [
    {label:'Total Trips',   val:data.total_trips,               bg:'from-blue-600 to-blue-700',    icon:'🚛'},
    {label:'Total Freight', val:INR(data.total_freight),         bg:'from-green-500 to-emerald-600',icon:'💰'},
    {label:'Net Balance',   val:INR(data.total_balance),         bg:data.total_balance<0?'from-red-500 to-rose-600':'from-indigo-500 to-purple-600',icon:'📊'},
    {label:'Fuel (L)',      val:parseFloat(data.total_fuel||0).toFixed(1), bg:'from-purple-500 to-violet-600',icon:'⛽'},
    {label:'Active Trucks', val:data.trucks_count,               bg:'from-rose-500 to-pink-600',    icon:'🚚'},
  ]

  const truckData  = Object.entries(data.truck_freight||{}).map(([k,v])=>({name:k,value:v}))
  const monthData  = Object.entries(data.monthly||{}).map(([k,v])=>({name:k,value:v}))
  const driverData = Object.entries(data.driver_bal||{}).map(([k,v])=>({name:k,value:v}))

  return (
    <div>
      <PageHeader title="📊 Dashboard" subtitle="Live overview of all operations"/>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {kpis.map(k=>(
          <div key={k.label} className={`bg-gradient-to-br ${k.bg} text-white rounded-2xl p-4 text-center shadow-lg`}>
            <div className="text-2xl mb-1">{k.icon}</div>
            <div className="text-lg sm:text-xl font-black">{k.val}</div>
            <div className="text-xs opacity-80 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="🚛 Freight per Truck">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={truckData} margin={{bottom:30,left:10}}>
              <XAxis dataKey="name" tick={{fontSize:10}} angle={-30} textAnchor="end" interval={0}/>
              <YAxis tick={{fontSize:9}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v=>INR(v)} contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}/>
              <Bar dataKey="value" fill="#3B82F6" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="📅 Trips per Month">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthData} margin={{bottom:30}}>
              <XAxis dataKey="name" tick={{fontSize:10}} angle={-30} textAnchor="end" interval={0}/>
              <YAxis tick={{fontSize:9}} allowDecimals={false}/>
              <Tooltip contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}/>
              <Bar dataKey="value" fill="#10B981" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="👤 Balance per Driver">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={driverData} margin={{bottom:30,left:10}}>
              <XAxis dataKey="name" tick={{fontSize:10}} angle={-30} textAnchor="end" interval={0}/>
              <YAxis tick={{fontSize:9}} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v=>INR(v)} contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}/>
              <Bar dataKey="value" radius={[6,6,0,0]}>
                {driverData.map((d,i)=><Cell key={i} fill={d.value>=0?'#10B981':'#EF4444'}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

function ChartCard({title, children}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-4 py-3 font-bold text-sm">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  )
}
