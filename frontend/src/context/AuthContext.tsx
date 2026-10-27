import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '../types'
import * as authApi from '../api/auth'
import { MOCK_API } from '../utils/env'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restore = async () => {
      const t = localStorage.getItem('token')
      const u = localStorage.getItem('user')
      if (t && u) {
        setToken(t)
        setUser(JSON.parse(u))
      } else if (t && !MOCK_API) {
        try {
          const res = await authApi.me()
          setUser(res.user)
          localStorage.setItem('user', JSON.stringify(res.user))
        } catch {
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }
    restore()
  }, [])

  const login = async (email: string, password: string) => {
    if (MOCK_API) {
      if (!email.includes('@') || password.length < 4) throw new Error('Invalid credentials')
      const user = { id: 'mock1', email }
      const token = 'mock-token'
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setToken(token)
      setUser(user)
      return
    }
    const res = await authApi.login(email, password)
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res.user))
    setToken(res.token)
    setUser(res.user)
  }

  const register = async (email: string, password: string) => {
    if (MOCK_API) {
      if (!email.includes('@') || password.length < 4) throw new Error('Invalid')
      const user = { id: 'mock1', email }
      const token = 'mock-token'
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setToken(token)
      setUser(user)
      return
    }
    const res = await authApi.register(email, password)
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(res.user))
    setToken(res.token)
    setUser(res.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
