import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTrip, getSettings } from '../api'
import TripForm from '../components/TripForm'
import PageHeader from '../components/PageHeader'

export default function NewTrip() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({trucks:[], drivers:[]})
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    getSettings().then(r => setSettings(r.data))
  }, [])

  const handleSubmit = async (data) => {
    setLoading(true); setError('')
    try {
      await createTrip(data)
      navigate('/trips')
    } catch(e) {
      setError(e.response?.data?.detail || 'Failed to save trip.')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <PageHeader title="➕ New Trip Entry" subtitle="Fill in the trip details below"/>
      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <TripForm settings={settings} onSubmit={handleSubmit} loading={loading}/>
      </div>
    </div>
  )
}
