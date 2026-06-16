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
        company_name:    r.data.company_name    || '',
        company_address: r.data.company_address || '',
        company_phone:   r.data.company_phone   || ''
      })
      setTrucksText((r.data.trucks  || []).join('\n'))
      setDriversText((r.data.drivers|| []).join('\n'))
    })
  }, [])

  const handleSave = async e => {
    e.preventDefault(); setLoading(true); setMsg('')
    const trucks  = trucksText.split('\n').map(s=>s.trim()).filter(Boolean)
    const drivers = driversText.split('\n').map(s=>s.trim()).filter(Boolean)
    try {
      await saveSettings({...form, trucks, drivers})
      setMsg('Settings saved successfully.')
      setTimeout(() => setMsg(''), 3000)
    } catch { setMsg('Failed to save settings.') }
    finally { setLoading(false) }
  }

  return (
    <div className="anim-fadeIn">
      <PageHeader title="Settings" subtitle="Configure company information and preferences"/>

      {msg && (
        <div className="px-4 py-3 rounded-xl mb-5 text-xs font-semibold anim-fadeIn"
          style={{background:'rgba(46,204,113,0.1)', border:'1px solid rgba(46,204,113,0.2)', color:'#2ECC71'}}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 max-w-3xl">
        {/* Company */}
        <div className="card-flat p-5 anim-fadeInUp">
          <div className="section-header mb-4">Company Information</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="inp-label">Company Name</label>
              <input className="inp" value={form.company_name}
                onChange={e=>setForm(f=>({...f,company_name:e.target.value}))}
                placeholder="Your company name"/>
            </div>
            <div>
              <label className="inp-label">Address</label>
              <input className="inp" value={form.company_address}
                onChange={e=>setForm(f=>({...f,company_address:e.target.value}))}
                placeholder="Company address"/>
            </div>
            <div>
              <label className="inp-label">Phone</label>
              <input className="inp" value={form.company_phone}
                onChange={e=>setForm(f=>({...f,company_phone:e.target.value}))}
                placeholder="+91 9876543210"/>
            </div>
          </div>
        </div>

        {/* Trucks & Drivers */}
        <div className="card-flat p-5 anim-fadeInUp d-100">
          <div className="section-header mb-4">Trucks and Drivers</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="inp-label">Truck Numbers <span style={{color:'rgba(232,245,233,0.3)', fontWeight:400, textTransform:'none', letterSpacing:0}}>(one per line)</span></label>
              <textarea className="inp" style={{height:'140px', resize:'none'}}
                value={trucksText} onChange={e=>setTrucksText(e.target.value)}
                placeholder="TN01AB1234&#10;TN02CD5678"/>
            </div>
            <div>
              <label className="inp-label">Driver Names <span style={{color:'rgba(232,245,233,0.3)', fontWeight:400, textTransform:'none', letterSpacing:0}}>(one per line)</span></label>
              <textarea className="inp" style={{height:'140px', resize:'none'}}
                value={driversText} onChange={e=>setDriversText(e.target.value)}
                placeholder="John Doe&#10;Jane Smith"/>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-green px-10 py-3">
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
