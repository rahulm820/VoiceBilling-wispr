import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { useAuth } from '../hooks/useAuth'

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    if (!email) return 'Email required'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Invalid email'
    if (!password) return 'Password required'
    if (password.length < 4) return 'Password too short'
    return ''
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate()
    if (v) { setError(v); return }
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 16 }}>
      <Card>
        <h2>SmartLedger</h2>
        <p>{mode === 'login' ? 'Login' : 'Sign Up'}</p>
        <form onSubmit={submit}>
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <Input label="Password" type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} /> Show password
          </label>
          {error && <div style={{ color: 'var(--color-danger)', marginBottom: 12 }}>{error}</div>}
          <Button type="submit" loading={loading} disabled={loading} style={{ width: '100%' }}>{mode === 'login' ? 'Login' : 'Sign Up'}</Button>
        </form>
        <button style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--color-primary)' }} onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Create account' : 'Have an account? Login'}
        </button>
      </Card>
    </div>
  )
}
