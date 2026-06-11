import { useState, useEffect } from 'react'
import { getSettings, saveSettings } from '../api'
import PageHeader from '../components/PageHeader'

export default function Settings() {
  const [form, setForm]           = useState({company_name:'',company_address:'',company_phone:''})
  const [trucksText, setTrucksText]   = useState('')
  const [driversText, setDriversText] = useState('')
  const [msg, setMsg]     = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getSettings().then(r => {
      setForm({
        company_name: r.data.company_name||'',
        company_address: r.data.company_address||'',
        company_phone: r.data.company_phone||''
      })
      setTrucksText((r.data.trucks||[]).join('\n'))
      setDriversText((r.data.drivers||[]).join('\n'))
    })
  }, [])

  const handleSave = async e => {
    e.preventDefault(); setLoading(true); setMsg('')
    const trucks  = trucksText.split('\n').map(s=>s.trim()).filter(Boolean)
    const drivers = driversText.split('\n').map(s=>s.trim()).filter(Boolean)
    try {
      await saveSettings({...form, trucks, drivers})
      setMsg('✅ Settings saved successfully!')
      setTimeout(()=>setMsg(''), 3000)
    } catch { setMsg('❌ Failed to save.') }
    finally { setLoading(false) }
  }

  const inp = "w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
  const lbl = "block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide"

  const Section = ({icon, text}) => (
    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm mb-4">
      <span>{icon}</span> {text}
    </div>
  )

  return (
    <div>
      <PageHeader title="⚙️ Settings" subtitle="Configure company details and lists"/>

      {msg && (
        <div className={`px-4 py-3 rounded-xl mb-5 text-sm font-semibold border
          ${msg.includes('✅') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <Section icon="🏢" text="Company Information"/>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={lbl}>Company Name</label>
              <input className={inp} value={form.company_name}
                onChange={e=>setForm(f=>({...f,company_name:e.target.value}))}
                placeholder="Your company name"/>
            </div>
            <div>
              <label className={lbl}>Address</label>
              <input className={inp} value={form.company_address}
                onChange={e=>setForm(f=>({...f,company_address:e.target.value}))}
                placeholder="Company address"/>
            </div>
            <div>
              <label className={lbl}>Phone</label>
              <input className={inp} value={form.company_phone}
                onChange={e=>setForm(f=>({...f,company_phone:e.target.value}))}
                placeholder="+91 9876543210"/>
            </div>
          </div>
        </div>

        {/* Lists */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <Section icon="🚛" text="Trucks & Drivers"/>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={lbl}>Truck Numbers <span className="text-gray-400 font-normal normal-case">(one per line)</span></label>
              <textarea className={`${inp} h-40 resize-none`} value={trucksText}
                onChange={e=>setTrucksText(e.target.value)}
                placeholder="TN01AB1234&#10;TN02CD5678"/>
            </div>
            <div>
              <label className={lbl}>Driver Names <span className="text-gray-400 font-normal normal-case">(one per line)</span></label>
              <textarea className={`${inp} h-40 resize-none`} value={driversText}
                onChange={e=>setDriversText(e.target.value)}
                placeholder="John Doe&#10;Jane Smith"/>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
            text-white font-black px-10 py-4 rounded-2xl text-sm shadow-lg
            disabled:opacity-60 transition-all transform hover:scale-[1.02] active:scale-95">
          {loading ? '⏳ Saving...' : '💾 Save Settings'}
        </button>
      </form>
    </div>
  )
}
