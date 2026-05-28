import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''
const api = axios.create({ baseURL: `${BASE}/api` })

export const getTrips    = (params) => api.get('/trips', { params })
export const getTrip     = (id)     => api.get(`/trips/${id}`)
export const createTrip  = (data)   => api.post('/trips', data)
export const updateTrip  = (id, data) => api.put(`/trips/${id}`, data)
export const deleteTrip  = (id)     => api.delete(`/trips/${id}`)
export const getDashboard= ()       => api.get('/dashboard')
export const getSettings = ()       => api.get('/settings')
export const saveSettings= (data)   => api.post('/settings', data)
export const doBackup    = ()       => api.post('/backup')
export const getReport = (params) => {
  const base = import.meta.env.VITE_API_URL || ''
  const qs = new URLSearchParams(params).toString()
  window.open(`${base}/api/report?${qs}`, '_blank')
}

export default api
