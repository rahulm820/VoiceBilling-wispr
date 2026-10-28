import client from './client'
import { AuthResponse, User } from '../types'

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await client.post('/api/auth/login', { email, password })
  return res.data
}

export const register = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await client.post('/api/auth/register', { email, password })
  return res.data
}

export const me = async (): Promise<{ user: User }> => {
  const res = await client.get('/api/auth/me')
  return res.data
}
