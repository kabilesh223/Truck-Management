import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [tab, setTab]         = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const r = await login(username, password)
      const token = r.data.accessToken || r.data.access_token
      const uname = r.data.username
      localStorage.setItem('token', token)
      localStorage.setItem('username', uname)
      navigate('/trips')
    } catch(e) {
      setError(e.response?.data?.detail || e.response?.data?.message || 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault(); setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { register } = await import('../api')
      await register({ username, password })
      const r = await login(username, password)
      const token = r.data.accessToken || r.data.access_token
      localStorage.setItem('token', token)
      localStorage.setItem('username', r.data.username)
      navigate('/trips')
    } catch(e) {
      setError(e.response?.data?.detail || e.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl"/>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl"/>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-cyan-400 rounded-full opacity-5 blur-3xl"/>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-2xl mb-4 text-4xl">
            🚛
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">TripManager</h1>
          <p className="text-blue-200 mt-1 text-sm">Goods Carrier Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {['login','register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-4 font-bold text-sm transition-all capitalize
                  ${tab===t ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600 bg-gray-50'}`}>
                {t === 'login' ? '🔑 Sign In' : '✨ Register'}
              </button>
            ))}
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">👤</span>
                  <input type="text" value={username} onChange={e=>setUsername(e.target.value)} required
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter your username"/>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔒</span>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} required
                    className="w-full pl-11 pr-12 py-3.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter your password"/>
                  <button type="button" onClick={()=>setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Confirm password for register */}
              {tab === 'register' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔐</span>
                    <input type={showPass ? 'text' : 'password'} value={confirm} onChange={e=>setConfirm(e.target.value)} required
                      className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Confirm your password"/>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                  text-white font-black py-4 rounded-xl text-sm tracking-wide shadow-lg
                  disabled:opacity-60 transition-all transform hover:scale-[1.02] active:scale-95">
                {loading ? '⏳ Please wait...' : tab === 'login' ? '🚀 Sign In' : '✨ Create Account'}
              </button>

              {tab === 'login' && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  Default: <span className="font-bold text-gray-600">admin</span> / <span className="font-bold text-gray-600">admin123</span>
                </p>
              )}
            </form>
          </div>
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">
          © 2024 TripManager — Goods Carrier System
        </p>
      </div>
    </div>
  )
}
