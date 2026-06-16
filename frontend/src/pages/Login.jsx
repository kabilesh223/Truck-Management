import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

export default function Login() {
  const navigate = useNavigate()
  const [tab, setTab]           = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [waking, setWaking]     = useState(false)

  useEffect(() => {
    setWaking(true)
    axios.get(`${BASE}/api/auth/me`, { timeout: 60000 })
      .catch(() => {})
      .finally(() => setWaking(false))
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const r = await login(username, password)
      const token = r.data.accessToken || r.data.access_token
      localStorage.setItem('token', token)
      localStorage.setItem('username', r.data.username)
      navigate('/trips')
    } catch(err) {
      if (!err.response) setError('Server is starting up. Please wait 30 seconds and try again.')
      else setError(err.response?.data?.message || err.response?.data?.detail || 'Invalid username or password.')
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault(); setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const { register } = await import('../api')
      await register({ username, password })
      const r = await login(username, password)
      const token = r.data.accessToken || r.data.access_token
      localStorage.setItem('token', token)
      localStorage.setItem('username', r.data.username)
      navigate('/trips')
    } catch(err) {
      if (!err.response) setError('Server is starting up. Please wait 30 seconds and try again.')
      else setError(err.response?.data?.message || err.response?.data?.detail || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background:'linear-gradient(135deg, #0F1A15 0%, #1D2E28 50%, #18392B 100%)'}}>
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-5" style={{background:'#2ECC71', filter:'blur(80px)'}}/>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5" style={{background:'#27AE60', filter:'blur(100px)'}}/>
      </div>

      <div className="w-full max-w-sm relative z-10 anim-fadeInUp">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 anim-pulse-glow"
            style={{background:'linear-gradient(135deg,#2ECC71,#1A8A4A)', boxShadow:'0 0 30px rgba(46,204,113,0.3)'}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0F1A15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{color:'#E8F5E9'}}>Trip Manager</h1>
          <p className="text-sm font-medium mt-1" style={{color:'rgba(232,245,233,0.4)'}}>Goods Carrier Management System</p>
        </div>

        {/* Card */}
        <div className="card-flat overflow-hidden" style={{background:'rgba(24,57,43,0.7)', backdropFilter:'blur(20px)'}}>
          {/* Tabs */}
          <div className="flex" style={{borderBottom:'1px solid rgba(46,204,113,0.12)'}}>
            {[['login','Sign In'],['register','Register']].map(([t, label]) => (
              <button key={t} onClick={() => { setTab(t); setError('') }}
                className="flex-1 py-3.5 text-sm font-bold tracking-wide transition-all"
                style={tab === t
                  ? {background:'linear-gradient(135deg,rgba(46,204,113,0.15),rgba(39,174,96,0.08))', color:'#2ECC71', borderBottom:'2px solid #2ECC71'}
                  : {color:'rgba(232,245,233,0.35)', background:'transparent', borderBottom:'2px solid transparent'}
                }>
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {waking && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-4 text-xs font-semibold"
                style={{background:'rgba(243,156,18,0.1)', border:'1px solid rgba(243,156,18,0.2)', color:'#F39C12'}}>
                <span className="inline-block w-3 h-3 rounded-full animate-ping" style={{background:'#F39C12'}}/>
                Server is starting up, please wait...
              </div>
            )}
            {error && (
              <div className="px-3 py-2.5 rounded-lg mb-4 text-xs font-semibold"
                style={{background:'rgba(231,76,60,0.1)', border:'1px solid rgba(231,76,60,0.2)', color:'#E74C3C'}}>
                {error}
              </div>
            )}

            <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-4">
              <div>
                <label className="inp-label">Username</label>
                <input className="inp" type="text" value={username} onChange={e=>setUsername(e.target.value)}
                  required placeholder="Enter your username" autoComplete="username"/>
              </div>

              <div>
                <label className="inp-label">Password</label>
                <div style={{position:'relative'}}>
                  <input className="inp" type={showPass ? 'text' : 'password'} value={password}
                    onChange={e=>setPassword(e.target.value)} required placeholder="Enter your password"
                    autoComplete={tab==='login'?'current-password':'new-password'}
                    style={{paddingRight:'44px'}}/>
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                      background:'none', border:'none', cursor:'pointer', color:'rgba(232,245,233,0.4)', padding:0}}>
                    {showPass
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {tab === 'register' && (
                <div>
                  <label className="inp-label">Confirm Password</label>
                  <input className="inp" type={showPass ? 'text' : 'password'} value={confirm}
                    onChange={e=>setConfirm(e.target.value)} required placeholder="Re-enter your password"
                    autoComplete="new-password"/>
                </div>
              )}

              <button type="submit" disabled={loading || waking}
                className="btn btn-green w-full py-3 text-sm tracking-wide mt-2">
                {waking ? 'Server Starting...' : loading ? 'Please Wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              {tab === 'login' && (
                <p className="text-center text-xs" style={{color:'rgba(232,245,233,0.25)'}}>
                  Default — admin / admin123
                </p>
              )}
            </form>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{color:'rgba(232,245,233,0.2)'}}>
          &copy; 2024 Trip Manager. All rights reserved.
        </p>
      </div>
    </div>
  )
}
