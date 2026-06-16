import { useEffect, useState } from 'react'
import { getDashboard } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import PageHeader from '../components/PageHeader'

const INR = v => `Rs ${parseFloat(v||0).toLocaleString('en-IN',{minimumFractionDigits:0})}`

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{background:'#1D2E28', border:'1px solid rgba(46,204,113,0.2)', borderRadius:'10px', padding:'10px 14px'}}>
      <p style={{color:'rgba(232,245,233,0.6)', fontSize:'11px', marginBottom:'4px'}}>{label}</p>
      <p style={{color:'#2ECC71', fontWeight:700, fontSize:'13px'}}>{payload[0].name === 'value' ? INR(payload[0].value) : payload[0].value}</p>
    </div>
  )
  return null
}

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => { getDashboard().then(r=>setData(r.data)) }, [])

  if (!data) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <div className="inline-block w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mb-4"
          style={{borderColor:'rgba(46,204,113,0.2)', borderTopColor:'#2ECC71'}}/>
        <p className="text-xs font-semibold" style={{color:'rgba(232,245,233,0.4)'}}>Loading dashboard...</p>
      </div>
    </div>
  )

  const kpis = [
    {label:'Total Trips',   val:data.total_trips,                       color:'#2ECC71'},
    {label:'Total Freight', val:INR(data.total_freight),                color:'#3498DB'},
    {label:'Net Balance',   val:INR(data.total_balance),                color:data.total_balance<0?'#E74C3C':'#F39C12'},
    {label:'Fuel Consumed', val:`${parseFloat(data.total_fuel||0).toFixed(1)} L`, color:'#9B59B6'},
    {label:'Active Trucks', val:data.trucks_count,                      color:'#1ABC9C'},
  ]

  const truckData  = Object.entries(data.truck_freight||{}).map(([k,v])=>({name:k,value:v}))
  const monthData  = Object.entries(data.monthly||{}).map(([k,v])=>({name:k,value:v}))
  const driverData = Object.entries(data.driver_bal||{}).map(([k,v])=>({name:k,value:v}))

  const axisStyle = { fontSize:10, fill:'rgba(232,245,233,0.4)', fontFamily:'Plus Jakarta Sans' }

  return (
    <div className="anim-fadeIn">
      <PageHeader title="Dashboard" subtitle="Overview of all trip activity"/>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {kpis.map((k,i) => (
          <div key={k.label} className={`kpi-card anim-fadeInUp d-${(i+1)*100}`}>
            <div className="kpi-val" style={{color:k.color}}>{k.val}</div>
            <div className="kpi-lbl">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Freight per Truck">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={truckData} margin={{bottom:28,left:10}}>
              <XAxis dataKey="name" tick={axisStyle} angle={-30} textAnchor="end" interval={0}/>
              <YAxis tick={axisStyle} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="value" fill="#2ECC71" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Trips per Month">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthData} margin={{bottom:28}}>
              <XAxis dataKey="name" tick={axisStyle} angle={-30} textAnchor="end" interval={0}/>
              <YAxis tick={axisStyle} allowDecimals={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="value" fill="#3498DB" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Balance per Driver">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={driverData} margin={{bottom:28,left:10}}>
              <XAxis dataKey="name" tick={axisStyle} angle={-30} textAnchor="end" interval={0}/>
              <YAxis tick={axisStyle} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {driverData.map((d,i)=><Cell key={i} fill={d.value>=0?'#2ECC71':'#E74C3C'}/>)}
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
    <div className="card-flat overflow-hidden anim-fadeInUp">
      <div className="px-5 py-3" style={{borderBottom:'1px solid rgba(46,204,113,0.1)'}}>
        <span className="section-header" style={{fontSize:'10px', padding:'4px 10px'}}>{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
