import { useState, useEffect } from 'react'

const S = {
  card: {
    background: 'rgba(29,46,40,0.8)',
    border: '1px solid rgba(46,204,113,0.15)',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'rgba(232,245,233,0.5)',
    marginBottom: '6px'
  },
  input: {
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
    WebkitTextFillColor: '#E8F5E9',
    opacity: '1',
    cursor: 'text'
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#2ECC71',
    borderLeft: '3px solid #2ECC71',
    paddingLeft: '10px',
    marginBottom: '16px'
  },
  totalBox: {
    background: 'rgba(46,204,113,0.08)',
    border: '1px solid rgba(46,204,113,0.2)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center'
  },
  btn: {
    width: '100%',
    background: 'linear-gradient(135deg,#2ECC71,#27AE60)',
    color: '#0F1A15',
    fontWeight: '800',
    fontSize: '14px',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.02em'
  }
}

export default function TripForm({ initial = {}, settings = {}, onSubmit, loading }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    date: today, truck_no: '', driver_name: '',
    loading_point: '', delivery_point: '', weight: '',
    freight: '', toll: '', commission: '',
    fuel_liters: '', fuel_amount: '', expenses: '',
    advance: '', bill_amount: '',
    ...initial
  })
  const [totalTrip, setTotalTrip] = useState(0)

  useEffect(() => {
    const freight    = parseFloat(form.freight)    || 0
    const toll       = parseFloat(form.toll)       || 0
    const commission = parseFloat(form.commission) || 0
    const fuel_amt   = parseFloat(form.fuel_amount)|| 0
    const expenses   = parseFloat(form.expenses)   || 0
    const advance    = parseFloat(form.advance)    || 0
    const bill_amt   = parseFloat(form.bill_amount)|| 0
    setTotalTrip((bill_amt + advance) - (freight + toll + commission + fuel_amt + expenses))
  }, [form])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    const numKeys = ['weight','freight','toll','commission','fuel_liters',
                     'fuel_amount','expenses','advance','bill_amount']
    const payload = {}
    Object.keys(form).forEach(k => {
      payload[k] = numKeys.includes(k) ? parseFloat(form[k]) || 0 : form[k]
    })
    onSubmit(payload)
  }

  const Field = ({ label, name, type = 'text', list, required, colSpan }) => (
    <div style={colSpan ? { gridColumn: `span ${colSpan}` } : {}}>
      <label style={S.label}>{label}</label>
      <input
        style={S.input}
        type={type}
        value={form[name] ?? ''}
        onChange={set(name)}
        list={list}
        required={required}
        step={type === 'number' ? '0.01' : undefined}
        placeholder={type === 'number' ? '0.00' : ''}
        autoComplete="off"
        onFocus={e => { e.target.style.borderColor = '#2ECC71'; e.target.style.boxShadow = '0 0 0 3px rgba(46,204,113,0.12)' }}
        onBlur={e => { e.target.style.borderColor = 'rgba(46,204,113,0.3)'; e.target.style.boxShadow = 'none' }}
      />
      {list && (
        <datalist id={list}>
          {(name === 'truck_no' ? settings.trucks : settings.drivers)?.map(v =>
            <option key={v} value={v} />
          )}
        </datalist>
      )}
    </div>
  )

  const gridStyle = (cols) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '16px'
  })

  return (
    <form onSubmit={handleSubmit}>

      {/* Trip Information */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Trip Information</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'16px'}}>
          <Field label="Date" name="date" type="date" required />
          <Field label="Truck Number" name="truck_no" list="truckList" required />
          <Field label="Driver Name" name="driver_name" list="driverList" required />
          <Field label="Weight (Tons)" name="weight" type="number" />
          <div style={{gridColumn:'span 2'}}>
            <Field label="Loading Point" name="loading_point" required />
          </div>
          <div style={{gridColumn:'span 2'}}>
            <Field label="Delivery Point" name="delivery_point" required />
          </div>
        </div>
      </div>

      {/* Financial Details */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Financial Details</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'16px'}}>
          <Field label="Freight Amount (Rs)" name="freight" type="number" required />
          <Field label="Toll Charges (Rs)" name="toll" type="number" />
          <Field label="Commission (Rs)" name="commission" type="number" />
          <Field label="Fuel Liters (L)" name="fuel_liters" type="number" />
          <Field label="Fuel Amount (Rs)" name="fuel_amount" type="number" />
          <Field label="Expenses (Rs)" name="expenses" type="number" />
        </div>
      </div>

      {/* Truck Bill */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Truck Bill</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'16px'}}>
          <Field label="Bill Amount (Rs)" name="bill_amount" type="number" />
          <Field label="Advance (Rs)" name="advance" type="number" />
        </div>
      </div>

      {/* Summary */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Summary</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', alignItems:'center'}}>
          <div style={S.totalBox}>
            <div style={{fontSize:'11px', fontWeight:'700', textTransform:'uppercase',
              letterSpacing:'0.08em', color:'rgba(46,204,113,0.6)', marginBottom:'8px'}}>
              Total Trip Amount
            </div>
            <div style={{fontSize:'28px', fontWeight:'900',
              color: totalTrip < 0 ? '#E74C3C' : '#2ECC71'}}>
              Rs {totalTrip.toLocaleString('en-IN', {minimumFractionDigits: 2})}
            </div>
            <div style={{fontSize:'11px', color:'rgba(232,245,233,0.3)', marginTop:'8px'}}>
              (Bill + Advance) &minus; (Freight + Toll + Commission + Fuel + Expenses)
            </div>
          </div>
          <button type="submit" disabled={loading} style={{
            ...S.btn,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'Saving...' : 'Save Trip'}
          </button>
        </div>
      </div>

    </form>
  )
}
