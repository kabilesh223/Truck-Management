import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL: `${BASE}/api` })

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const login = (username, password) => {
  return api.post('/auth/login', { username, password })
}
export const register  = (data)   => api.post('/auth/register', data)
export const getMe     = ()       => api.get('/auth/me')
export const getTrips  = (params) => api.get('/trips', { params })
export const getTrip   = (id)     => api.get(`/trips/${id}`)
export const createTrip= (data)   => api.post('/trips', data)
export const updateTrip= (id, d)  => api.put(`/trips/${id}`, d)
export const deleteTrip= (id)     => api.delete(`/trips/${id}`)
export const getDashboard = ()    => api.get('/trips/dashboard')
export const getSettings  = ()    => api.get('/settings')
export const saveSettings = (d)   => api.post('/settings', d)
export const doBackup     = ()    => api.post('/backup')
export const getReport = (params) => {
  const base = import.meta.env.VITE_API_URL || ''
  const token = localStorage.getItem('token')
  const qs = new URLSearchParams(params).toString()
  // Open in new tab with token in header via fetch and blob download
  fetch(`${base}/api/report?${qs}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(r => r.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${params.report_type || 'full'}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
  })
}

export default api
