import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTrip, updateTrip, getSettings } from '../api'
import TripForm from '../components/TripForm'
import PageHeader from '../components/PageHeader'

export default function EditTrip() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [trip, setTrip]         = useState(null)
  const [settings, setSettings] = useState({trucks:[],drivers:[]})
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    Promise.all([getTrip(id), getSettings()]).then(([tr, st]) => {
      setTrip(tr.data)
      setSettings(st.data)
    })
  }, [id])

  const handleSubmit = async data => {
    setLoading(true); setError('')
    try {
      await updateTrip(id, data)
      navigate('/trips')
    } catch(e) {
      setError(e.response?.data?.detail || e.response?.data?.message || 'Failed to update trip.')
    } finally { setLoading(false) }
  }

  if (!trip) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <div className="inline-block w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-3"
          style={{borderColor:'rgba(46,204,113,0.2)', borderTopColor:'#2ECC71'}}/>
        <p className="text-xs font-semibold" style={{color:'rgba(232,245,233,0.4)'}}>Loading trip...</p>
      </div>
    </div>
  )

  return (
    <div className="anim-fadeIn">
      <PageHeader title={`Edit Trip #${id}`} subtitle="Update the trip details below"/>
      {error && (
        <div className="px-4 py-3 rounded-xl mb-4 text-xs font-semibold"
          style={{background:'rgba(231,76,60,0.1)', border:'1px solid rgba(231,76,60,0.2)', color:'#E74C3C'}}>
          {error}
        </div>
      )}
      <TripForm initial={trip} settings={settings} onSubmit={handleSubmit} loading={loading}/>
    </div>
  )
}
