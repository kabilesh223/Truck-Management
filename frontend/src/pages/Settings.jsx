import { useState, useEffect } from 'react'
import { getSettings, saveSettings } from '../api'
import PageHeader from '../components/PageHeader'

export default function Settings() {
  const [form, setForm]   = useState({ company_name:'', company_address:'', company_phone:'', trucks:[], drivers:[] })
  const [trucksText, setTrucksText]   = useState('')
  const [driversText, setDriversText] = useState('')
  const [msg, setMsg]     = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getSettings().then(r => {
      setForm(r.data)
      setTrucksText((r.data.trucks||[]).join('\n'))
      setDriversText((r.data.drivers||[]).join('\n'))
    })
  }, [])

  const handleSave = async (e) => {
    e.preventDefault(); setLoading(true); setMsg('')
    const trucks  = trucksText.split('\n').map(s=>s.trim()).filter(Boolean)
    const drivers = driversText.split('\n').map(s=>s.trim()).filter(Boolean)
    try {
      await saveSettings({ ...form, trucks, drivers })
      setMsg('Settings saved successfully!')
      setTimeout(()=>setMsg(''), 3000)
    } catch { setMsg('Failed to save.') }
    finally { setLoading(false) }
  }

  const inp = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const lbl = "block text-sm font-semibold text-slate-700 mb-1"

  return (
    <div>
      <PageHeader title="⚙️ Settings" subtitle="Configure company info and lists"/>
      {msg && <div className="bg-green-100 text-green-800 px-4 py-3 rounded-xl mb-4 text-sm font-semibold">{msg}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm mb-4">🏢 Company Information</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={lbl}>Company Name</label>
              <input className={inp} value={form.company_name||''} onChange={e=>setForm(f=>({...f,company_name:e.target.value}))}/>
            </div>
            <div>
              <label className={lbl}>Address</label>
              <input className={inp} value={form.company_address||''} onChange={e=>setForm(f=>({...f,company_address:e.target.value}))}/>
            </div>
            <div>
              <label className={lbl}>Phone</label>
              <input className={inp} value={form.company_phone||''} onChange={e=>setForm(f=>({...f,company_phone:e.target.value}))}/>
            </div>
          </div>
        </div>

        {/* Lists */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm mb-4">🚛 Trucks & Drivers</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={lbl}>Truck Numbers <span className="text-slate-400 font-normal">(one per line)</span></label>
              <textarea className={`${inp} h-36 resize-none`} value={trucksText}
                onChange={e=>setTrucksText(e.target.value)} placeholder="TN01AB1234&#10;TN02CD5678"/>
            </div>
            <div>
              <label className={lbl}>Driver Names <span className="text-slate-400 font-normal">(one per line)</span></label>
              <textarea className={`${inp} h-36 resize-none`} value={driversText}
                onChange={e=>setDriversText(e.target.value)} placeholder="John Doe&#10;Jane Smith"/>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="bg-[#1F4E79] hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-60">
          {loading ? 'Saving...' : '💾 Save Settings'}
        </button>
      </form>
    </div>
  )
}
