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

export const login    = (username, password) => {
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  return api.post('/auth/login', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
}
export const register  = (data)   => api.post('/auth/register', data)
export const getMe     = ()       => api.get('/auth/me')
export const getTrips  = (params) => api.get('/trips', { params })
export const getTrip   = (id)     => api.get(`/trips/${id}`)
export const createTrip= (data)   => api.post('/trips', data)
export const updateTrip= (id, d)  => api.put(`/trips/${id}`, d)
export const deleteTrip= (id)     => api.delete(`/trips/${id}`)
export const getDashboard = ()    => api.get('/dashboard')
export const getSettings  = ()    => api.get('/settings')
export const saveSettings = (d)   => api.post('/settings', d)
export const doBackup     = ()    => api.post('/backup')
export const getReport    = (params) => {
  const base = import.meta.env.VITE_API_URL || ''
  const token = localStorage.getItem('token')
  const qs = new URLSearchParams({...params, token}).toString()
  window.open(`${base}/api/report?${qs}`, '_blank')
}

export default api
