import { useState, useCallback } from 'react'

const cardStyle = {
  background: 'rgba(29,46,40,0.8)',
  border: '1px solid rgba(46,204,113,0.15)',
  borderRadius: '14px',
  padding: '20px',
  marginBottom: '16px'
}
const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'rgba(232,245,233,0.5)',
  marginBottom: '6px'
}
const inputStyle = {
  display: 'block',
  width: '100%',
  background: '#0F1A15',
  border: '1.5px solid rgba(46,204,113,0.3)',
  borderRadius: '10px',
  padding: '11px 14px',
  fontSize: '14px',
  color: '#E8F5E9',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  cursor: 'text'
}
const sectionStyle = {
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#2ECC71',
  borderLeft: '3px solid #2ECC71',
  paddingLeft: '10px',
  marginBottom: '16px'
}

function calcTotal(form) {
  const freight    = parseFloat(form.freight)    || 0
  const toll       = parseFloat(form.toll)       || 0
  const commission = parseFloat(form.commission) || 0
  const fuel_amt   = parseFloat(form.fuel_amount)|| 0
  const expenses   = parseFloat(form.expenses)   || 0
  const advance    = parseFloat(form.advance)    || 0
  const bill_amt   = parseFloat(form.bill_amount)|| 0
  return (bill_amt + advance) - (freight + toll + commission + fuel_amt + expenses)
}

export default function TripForm({ initial = {}, settings = {}, onSubmit, loading }) {
  const today = new Date().toISOString().split('T')[0]

  const [date,           setDate]          = useState(initial.date           ?? today)
  const [truck_no,       setTruckNo]       = useState(initial.truck_no       ?? '')
  const [driver_name,    setDriverName]    = useState(initial.driver_name    ?? '')
  const [loading_point,  setLoadingPoint]  = useState(initial.loading_point  ?? '')
  const [delivery_point, setDeliveryPoint] = useState(initial.delivery_point ?? '')
  const [weight,         setWeight]        = useState(initial.weight         ?? '')
  const [freight,        setFreight]       = useState(initial.freight        ?? '')
  const [toll,           setToll]          = useState(initial.toll           ?? '')
  const [commission,     setCommission]    = useState(initial.commission     ?? '')
  const [fuel_liters,    setFuelLiters]    = useState(initial.fuel_liters    ?? '')
  const [fuel_amount,    setFuelAmount]    = useState(initial.fuel_amount    ?? '')
  const [expenses,       setExpenses]      = useState(initial.expenses       ?? '')
  const [advance,        setAdvance]       = useState(initial.advance        ?? '')
  const [bill_amount,    setBillAmount]    = useState(initial.bill_amount    ?? '')

  const form = {
    date, truck_no, driver_name, loading_point, delivery_point,
    weight, freight, toll, commission, fuel_liters,
    fuel_amount, expenses, advance, bill_amount
  }

  const totalTrip = calcTotal(form)

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit({
      date, truck_no, driver_name, loading_point, delivery_point,
      weight:      parseFloat(weight)      || 0,
      freight:     parseFloat(freight)     || 0,
      toll:        parseFloat(toll)        || 0,
      commission:  parseFloat(commission)  || 0,
      fuel_liters: parseFloat(fuel_liters) || 0,
      fuel_amount: parseFloat(fuel_amount) || 0,
      expenses:    parseFloat(expenses)    || 0,
      advance:     parseFloat(advance)     || 0,
      bill_amount: parseFloat(bill_amount) || 0,
    })
  }

  const inp = (value, setter, extra = {}) => ({
    style: inputStyle,
    value: value,
    onChange: e => setter(e.target.value),
    autoComplete: 'off',
    onFocus: e => {
      e.target.style.borderColor = '#2ECC71'
      e.target.style.boxShadow = '0 0 0 3px rgba(46,204,113,0.12)'
    },
    onBlur: e => {
      e.target.style.borderColor = 'rgba(46,204,113,0.3)'
      e.target.style.boxShadow = 'none'
    },
    ...extra
  })

  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }
  const grid3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }

  return (
    <form onSubmit={handleSubmit}>

      {/* Trip Information */}
      <div style={cardStyle}>
        <div style={sectionStyle}>Trip Information</div>
        <div style={grid2}>
          <div>
            <label style={labelStyle}>Date</label>
            <input {...inp(date, setDate)} type="date" required/>
          </div>
          <div>
            <label style={labelStyle}>Truck Number</label>
            <input {...inp(truck_no, setTruckNo)} list="truckList" required placeholder="e.g. TN01AB1234"/>
            <datalist id="truckList">{settings.trucks?.map(t=><option key={t} value={t}/>)}</datalist>
          </div>
          <div>
            <label style={labelStyle}>Driver Name</label>
            <input {...inp(driver_name, setDriverName)} list="driverList" required placeholder="Driver name"/>
            <datalist id="driverList">{settings.drivers?.map(d=><option key={d} value={d}/>)}</datalist>
          </div>
          <div>
            <label style={labelStyle}>Weight (Tons)</label>
            <input {...inp(weight, setWeight)} type="number" step="0.01" placeholder="0.00"/>
          </div>
          <div style={{gridColumn:'span 2'}}>
            <label style={labelStyle}>Loading Point</label>
            <input {...inp(loading_point, setLoadingPoint)} required placeholder="From location"/>
          </div>
          <div style={{gridColumn:'span 2'}}>
            <label style={labelStyle}>Delivery Point</label>
            <input {...inp(delivery_point, setDeliveryPoint)} required placeholder="To location"/>
          </div>
        </div>
      </div>

      {/* Financial Details */}
      <div style={cardStyle}>
        <div style={sectionStyle}>Financial Details</div>
        <div style={grid3}>
          <div>
            <label style={labelStyle}>Freight Amount (Rs)</label>
            <input {...inp(freight, setFreight)} type="number" step="0.01" placeholder="0.00" required/>
          </div>
          <div>
            <label style={labelStyle}>Toll Charges (Rs)</label>
            <input {...inp(toll, setToll)} type="number" step="0.01" placeholder="0.00"/>
          </div>
          <div>
            <label style={labelStyle}>Commission (Rs)</label>
            <input {...inp(commission, setCommission)} type="number" step="0.01" placeholder="0.00"/>
          </div>
          <div>
            <label style={labelStyle}>Fuel Liters (L)</label>
            <input {...inp(fuel_liters, setFuelLiters)} type="number" step="0.01" placeholder="0.00"/>
          </div>
          <div>
            <label style={labelStyle}>Fuel Amount (Rs)</label>
            <input {...inp(fuel_amount, setFuelAmount)} type="number" step="0.01" placeholder="0.00"/>
          </div>
          <div>
            <label style={labelStyle}>Expenses (Rs)</label>
            <input {...inp(expenses, setExpenses)} type="number" step="0.01" placeholder="0.00"/>
          </div>
        </div>
      </div>

      {/* Truck Bill */}
      <div style={cardStyle}>
        <div style={sectionStyle}>Truck Bill</div>
        <div style={grid2}>
          <div>
            <label style={labelStyle}>Bill Amount (Rs)</label>
            <input {...inp(bill_amount, setBillAmount)} type="number" step="0.01" placeholder="0.00"/>
          </div>
          <div>
            <label style={labelStyle}>Advance (Rs)</label>
            <input {...inp(advance, setAdvance)} type="number" step="0.01" placeholder="0.00"/>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div style={cardStyle}>
        <div style={sectionStyle}>Summary</div>
        <div style={{...grid2, alignItems:'center'}}>
          <div style={{background:'rgba(46,204,113,0.08)', border:'1px solid rgba(46,204,113,0.2)',
            borderRadius:'12px', padding:'20px', textAlign:'center'}}>
            <div style={{fontSize:'11px', fontWeight:'700', textTransform:'uppercase',
              letterSpacing:'0.08em', color:'rgba(46,204,113,0.6)', marginBottom:'8px'}}>
              Total Trip Amount
            </div>
            <div style={{fontSize:'28px', fontWeight:'900',
              color: totalTrip < 0 ? '#E74C3C' : '#2ECC71'}}>
              Rs {totalTrip.toLocaleString('en-IN',{minimumFractionDigits:2})}
            </div>
            <div style={{fontSize:'11px', color:'rgba(232,245,233,0.3)', marginTop:'8px'}}>
              (Bill + Advance) &minus; (Freight + Toll + Comm + Fuel + Exp)
            </div>
          </div>
          <button type="submit" disabled={loading} style={{
            width:'100%', background:'linear-gradient(135deg,#2ECC71,#27AE60)',
            color:'#0F1A15', fontWeight:'800', fontSize:'14px', border:'none',
            borderRadius:'12px', padding:'16px', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily:'inherit', opacity: loading ? 0.6 : 1
          }}>
            {loading ? 'Saving...' : 'Save Trip'}
          </button>
        </div>
      </div>

    </form>
  )
}
