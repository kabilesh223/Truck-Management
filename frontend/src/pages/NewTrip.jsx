import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTrip, getSettings } from '../api'
import TripForm from '../components/TripForm'
import PageHeader from '../components/PageHeader'

export default function NewTrip() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({trucks:[],drivers:[]})
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => { getSettings().then(r=>setSettings(r.data)) }, [])

  const handleSubmit = async data => {
    setLoading(true); setError('')
    try {
      await createTrip(data)
      navigate('/trips')
    } catch(e) {
      setError(e.response?.data?.detail || e.response?.data?.message || 'Failed to save trip.')
    } finally { setLoading(false) }
  }

  return (
    <div className="anim-fadeIn">
      <PageHeader title="New Trip Entry" subtitle="Fill in the details to record a new trip"/>
      {error && (
        <div className="px-4 py-3 rounded-xl mb-4 text-xs font-semibold"
          style={{background:'rgba(231,76,60,0.1)', border:'1px solid rgba(231,76,60,0.2)', color:'#E74C3C'}}>
          {error}
        </div>
      )}
      <TripForm settings={settings} onSubmit={handleSubmit} loading={loading}/>
    </div>
  )
}
