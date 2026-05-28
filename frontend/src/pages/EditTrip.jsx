import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTrip, updateTrip, getSettings } from '../api'
import TripForm from '../components/TripForm'
import PageHeader from '../components/PageHeader'

export default function EditTrip() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [trip, setTrip]         = useState(null)
  const [settings, setSettings] = useState({trucks:[], drivers:[]})
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    Promise.all([getTrip(id), getSettings()]).then(([tr, st]) => {
      setTrip(tr.data); setSettings(st.data)
    })
  }, [id])

  const handleSubmit = async (data) => {
    setLoading(true); setError('')
    try {
      await updateTrip(id, data)
      navigate('/trips')
    } catch(e) {
      setError(e.response?.data?.detail || 'Failed to update trip.')
    } finally { setLoading(false) }
  }

  if (!trip) return <div className="text-center py-20 text-slate-400">Loading...</div>

  return (
    <div>
      <PageHeader title={`✏️ Edit Trip #${id}`} subtitle="Update the trip details below"/>
      {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <TripForm initial={trip} settings={settings} onSubmit={handleSubmit} loading={loading}/>
      </div>
    </div>
  )
}
