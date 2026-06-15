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
  const [balance, setBalance]     = useState(0)

  useEffect(() => {
    const freight    = parseFloat(form.freight)    || 0
    const toll       = parseFloat(form.toll)       || 0
    const commission = parseFloat(form.commission) || 0
    const fuel_amt   = parseFloat(form.fuel_amount)|| 0
    const expenses   = parseFloat(form.expenses)   || 0
    const advance    = parseFloat(form.advance)    || 0
    const bill_amt   = parseFloat(form.bill_amount)|| 0
    const tt = toll + commission + fuel_amt + expenses
    setTotalTrip(tt)
    setBalance(freight - tt - advance - bill_amt)
  }, [form])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    const payload = {}
    const numKeys = ['weight','freight','toll','commission','fuel_liters',
                     'fuel_amount','expenses','advance','bill_amount']
    Object.keys(form).forEach(k => {
      payload[k] = numKeys.includes(k) ? parseFloat(form[k]) || 0 : form[k]
    })
    onSubmit(payload)
  }

  const inp = "w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
  const lbl = "block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide"

  const SectionTitle = ({ icon, text }) => (
    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm mb-4">
      <span>{icon}</span> {text}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Trip Info */}
      <div>
        <SectionTitle icon="📦" text="Trip Information" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={lbl}>Date</label>
            <input className={inp} type="date" value={form.date ?? today} onChange={set('date')} required/>
          </div>
          <div>
            <label className={lbl}>Truck Number</label>
            <input className={inp} type="text" value={form.truck_no ?? ''} onChange={set('truck_no')}
                   list="truckList" required placeholder="e.g. TN01AB1234"/>
            <datalist id="truckList">
              {settings.trucks?.map(t => <option key={t} value={t}/>)}
            </datalist>
          </div>
          <div>
            <label className={lbl}>Driver Name</label>
            <input className={inp} type="text" value={form.driver_name ?? ''} onChange={set('driver_name')}
                   list="driverList" required placeholder="Driver name"/>
            <datalist id="driverList">
              {settings.drivers?.map(d => <option key={d} value={d}/>)}
            </datalist>
          </div>
          <div>
            <label className={lbl}>Weight (Tons)</label>
            <input className={inp} type="number" step="0.01" value={form.weight ?? ''} onChange={set('weight')} placeholder="0.00"/>
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Loading Point</label>
            <input className={inp} type="text" value={form.loading_point ?? ''} onChange={set('loading_point')} required placeholder="From location"/>
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Delivery Point</label>
            <input className={inp} type="text" value={form.delivery_point ?? ''} onChange={set('delivery_point')} required placeholder="To location"/>
          </div>
        </div>
      </div>

      {/* Financial */}
      <div>
        <SectionTitle icon="💰" text="Financial Details" />
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ['Freight (₹)', 'freight', true],
            ['Toll (₹)', 'toll'],
            ['Commission (₹)', 'commission'],
            ['Fuel Liters (L)', 'fuel_liters'],
            ['Fuel Amount (₹)', 'fuel_amount'],
            ['Expenses (₹)', 'expenses'],
            ['Advance (₹)', 'advance'],
            ['Bill Amount (₹)', 'bill_amount'],
          ].map(([label, key, req]) => (
            <div key={key}>
              <label className={lbl}>{label}</label>
              <input className={inp} type="number" step="0.01"
                     value={form[key] ?? ''} onChange={set(key)}
                     placeholder="0.00" required={req}/>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div>
        <SectionTitle icon="🧾" text="Summary" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Total Trip Amount</div>
            <div className="text-2xl font-black text-amber-700">
              ₹{totalTrip.toLocaleString('en-IN', {minimumFractionDigits:2})}
            </div>
          </div>
          <div className={`border-2 rounded-2xl p-4 text-center transition-all ${
            balance < 0
              ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
              : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
          }`}>
            <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
              Balance Amount
            </div>
            <div className={`text-2xl font-black ${balance < 0 ? 'text-red-700' : 'text-green-700'}`}>
              ₹{balance.toLocaleString('en-IN', {minimumFractionDigits:2})}
            </div>
          </div>
          <div className="flex items-center">
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                text-white font-black py-4 rounded-2xl text-sm shadow-lg
                disabled:opacity-60 transition-all transform hover:scale-[1.02] active:scale-95">
              {loading ? '⏳ Saving...' : '💾 Save Trip'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
