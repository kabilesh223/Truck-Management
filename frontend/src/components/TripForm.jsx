import { useState, useEffect } from 'react'

export default function TripForm({ initial = {}, settings = {}, onSubmit, loading }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    date: today, truck_no: '', driver_name: '', loading_point: '',
    delivery_point: '', weight: '', freight: '', toll: '', commission: '',
    fuel_liters: '', fuel_amount: '', expenses: '', advance: '', bill_amount: '',
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
    setTotalTrip((freight + toll + commission + fuel_amt + expenses) - (bill_amt + advance))
  }, [form])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    const numKeys = ['weight','freight','toll','commission','fuel_liters','fuel_amount','expenses','advance','bill_amount']
    const payload = {}
    Object.keys(form).forEach(k => {
      payload[k] = numKeys.includes(k) ? parseFloat(form[k]) || 0 : form[k]
    })
    onSubmit(payload)
  }

  const SectionTitle = ({ text }) => (
    <div className="section-header">{text}</div>
  )

  const Field = ({ label, name, type='text', list, required, span=1 }) => (
    <div style={span>1 ? {gridColumn:`span ${span}`} : {}}>
      <label className="inp-label">{label}</label>
      <input className="inp" type={type} value={form[name] ?? ''} onChange={set(name)}
        list={list} required={required} step={type==='number'?'0.01':undefined}
        placeholder={type==='number'?'0.00':undefined}
        autoComplete="off"/>
      {list && (
        <datalist id={list}>
          {(name==='truck_no' ? settings.trucks : settings.drivers)?.map(v => <option key={v} value={v}/>)}
        </datalist>
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Trip Info */}
      <div className="card-flat p-5 anim-fadeInUp">
        <SectionTitle text="Trip Information" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Date" name="date" type="date" required />
          <Field label="Truck Number" name="truck_no" list="truckList" required />
          <Field label="Driver Name" name="driver_name" list="driverList" required />
          <Field label="Weight (Tons)" name="weight" type="number" />
          <Field label="Loading Point" name="loading_point" required span={2} />
          <Field label="Delivery Point" name="delivery_point" required span={2} />
        </div>
      </div>

      {/* Financial */}
      <div className="card-flat p-5 anim-fadeInUp d-100">
        <SectionTitle text="Financial Details" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Freight Amount (Rs)" name="freight" type="number" required />
          <Field label="Toll Charges (Rs)" name="toll" type="number" />
          <Field label="Commission (Rs)" name="commission" type="number" />
          <Field label="Fuel Liters (L)" name="fuel_liters" type="number" />
          <Field label="Fuel Amount (Rs)" name="fuel_amount" type="number" />
          <Field label="Expenses (Rs)" name="expenses" type="number" />
        </div>
      </div>

      {/* Truck Bill */}
      <div className="card-flat p-5 anim-fadeInUp d-200">
        <SectionTitle text="Truck Bill" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Bill Amount (Rs)" name="bill_amount" type="number" />
          <Field label="Advance (Rs)" name="advance" type="number" />
        </div>
      </div>

      {/* Summary */}
      <div className="card-flat p-5 anim-fadeInUp d-300">
        <SectionTitle text="Summary" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="text-center py-4 rounded-xl" style={{background:'rgba(46,204,113,0.08)', border:'1px solid rgba(46,204,113,0.2)'}}>
            <div className="inp-label" style={{color:'rgba(46,204,113,0.6)'}}>Total Trip Amount</div>
            <div className="text-3xl font-extrabold mt-1" style={{color: totalTrip < 0 ? '#E74C3C' : '#2ECC71'}}>
              Rs {totalTrip.toLocaleString('en-IN', {minimumFractionDigits:2})}
            </div>
            <div className="text-xs mt-2" style={{color:'rgba(232,245,233,0.3)'}}>
              (Freight + Toll + Commission + Fuel + Expenses) &minus; (Bill + Advance)
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="btn btn-green py-4 text-base w-full">
            {loading ? 'Saving...' : 'Save Trip'}
          </button>
        </div>
      </div>
    </form>
  )
}
