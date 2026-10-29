import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Mic } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register, token } = useAuth()
  const navigate = useNavigate()

  if (token) return <Navigate to="/insights" replace />

  const validate = () => {
    if (!email) return 'Enter your email.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'That email does not look right.'
    if (!password) return 'Enter your password.'
    if (password.length < 4) return 'Password must be at least 4 characters.'
    return ''
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password)
      navigate('/insights')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(420px,520px)]">
      <section className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <Logo onDark />
        <div className="max-w-md">
          <p className="text-4xl font-bold leading-tight tracking-tight">Speak the bill.<br />We write it down.</p>
          <p lang="hi" className="mt-3 text-2xl text-sidebar-muted">बोलिए, बिल बन जाएगा।</p>
          <div className="mt-10 overflow-hidden rounded-md border border-sidebar-border bg-sidebar-accent/60 text-sm" aria-hidden>
            <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-2 text-sidebar-muted">
              <Mic className="size-4 text-signal" /> “2 kilo cheeni, 1 litre tel”
            </div>
            {[
              ['Sugar', '2 kg', '90.00'],
              ['Oil', '1 L', '165.00'],
            ].map(([n, q, p]) => (
              <div key={n} className="grid grid-cols-[1fr_auto_auto] gap-6 border-b border-sidebar-border/60 px-4 py-2.5 last:border-0">
                <span>{n}</span>
                <span className="text-sidebar-muted">{q}</span>
                <span className="font-semibold">₹{p}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-sidebar-muted">Voice billing powered by Wispr</p>
      </section>

      <main className="relative flex items-center justify-center px-5 py-10">
        <ThemeToggle className="absolute right-4 top-4" />
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{mode === 'login' ? 'Log in' : 'Create your account'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'login' ? 'Welcome back. Your shop is waiting.' : 'Start billing by voice in a minute.'}
          </p>

          <Tabs
            value={mode}
            onValueChange={(v) => {
              setMode(v as 'login' | 'register')
              setError('')
            }}
            className="mt-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="register">Sign up</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={submit} noValidate className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-describedby={error ? 'auth-error' : undefined}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-11"
                  aria-describedby={error ? 'auth-error' : undefined}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
                </Button>
              </div>
            </div>
            {error && (
              <p id="auth-error" role="alert" className="rounded-md border border-destructive/40 bg-danger-soft px-3 py-2 text-sm">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" aria-hidden />}
              {mode === 'login' ? 'Log in' : 'Create account'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
