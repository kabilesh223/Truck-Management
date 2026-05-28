import { useState, useEffect } from 'react'

const fmt = (v) => v === '' || v === null || v === undefined ? '' : v

export default function TripForm({ initial = {}, settings = {}, onSubmit, loading }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    date: today, truck_no: '', driver_name: '', loading_point: '',
    delivery_point: '', weight: '', freight: '', toll: '', commission: '',
    fuel_liters: '', fuel_amount: '', expenses: '', advance: '', bill_amount: '',
    ...initial
  })
  const [totalTrip, setTotalTrip] = useState(0)
  const [balance, setBalance]     = useState(0)

  useEffect(() => {
    const freight    = parseFloat(form.freight)    || 0
    const toll       = parseFloat(form.toll)       || 0
    const commission = parseFloat(form.commission) || 0
    const fuel_amt   = parseFloat(form.fuel_amount)|| 0
    const expenses   = parseFloat(form.expenses)   || 0
    const advance    = parseFloat(form.advance)    || 0
    const bill_amt   = parseFloat(form.bill_amount)|| 0
    const tt = toll + commission + fuel_amt + expenses + advance
    setTotalTrip(tt)
    setBalance(freight - tt - bill_amt)
  }, [form])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {}
    Object.keys(form).forEach(k => {
      payload[k] = ['weight','freight','toll','commission','fuel_liters','fuel_amount',
                    'expenses','advance','bill_amount'].includes(k)
        ? parseFloat(form[k]) || 0 : form[k]
    })
    onSubmit(payload)
  }

  const inp = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const lbl = "block text-sm font-semibold text-slate-700 mb-1"

  const Field = ({ label, name, type = 'text', list, required }) => (
    <div>
      <label className={lbl}>{label}</label>
      <input className={inp} type={type} value={fmt(form[name])} onChange={set(name)}
             list={list} required={required} step={type==='number'?'0.01':undefined}
             placeholder={type==='number'?'0.00':undefined}/>
      {list && <datalist id={list}>
        {(name==='truck_no' ? settings.trucks : settings.drivers)?.map(v =>
          <option key={v} value={v}/>)}
      </datalist>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Trip Info */}
      <div>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm mb-3">
          📦 Trip Information
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Date" name="date" type="date" required/>
          <Field label="Truck Number" name="truck_no" list="truckList" required/>
          <Field label="Driver Name" name="driver_name" list="driverList" required/>
          <Field label="Weight (Tons)" name="weight" type="number"/>
          <div className="col-span-2">
            <Field label="Loading Point" name="loading_point" required/>
          </div>
          <div className="col-span-2">
            <Field label="Delivery Point" name="delivery_point" required/>
          </div>
        </div>
      </div>

      {/* Financial */}
      <div>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm mb-3">
          💰 Financial Details
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Freight Amount (₹)" name="freight" type="number" required/>
          <Field label="Toll Charges (₹)" name="toll" type="number"/>
          <Field label="Commission (₹)" name="commission" type="number"/>
          <Field label="Fuel Liters (L)" name="fuel_liters" type="number"/>
          <Field label="Fuel Amount (₹)" name="fuel_amount" type="number"/>
          <Field label="Expenses (₹)" name="expenses" type="number"/>
          <Field label="Advance (₹)" name="advance" type="number"/>
          <Field label="Bill Amount (₹)" name="bill_amount" type="number"/>
        </div>
      </div>

      {/* Summary */}
      <div>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm mb-3">
          🧾 Summary
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <div className="text-xs text-slate-500 font-semibold">Total Trip Amount</div>
            <div className="text-2xl font-bold text-amber-700 mt-1">
              ₹{totalTrip.toLocaleString('en-IN', {minimumFractionDigits:2})}
            </div>
          </div>
          <div className={`border rounded-xl p-4 text-center ${balance < 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="text-xs text-slate-500 font-semibold">Balance Amount</div>
            <div className={`text-2xl font-bold mt-1 ${balance < 0 ? 'text-red-700' : 'text-green-700'}`}>
              ₹{balance.toLocaleString('en-IN', {minimumFractionDigits:2})}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#1F4E79] hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60">
              {loading ? 'Saving...' : '💾 Save Trip'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
