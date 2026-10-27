import client from './client'
import { Settings } from '../types'

export const getSettings = async (): Promise<Settings> => {
  const res = await client.get('/api/settings')
  return res.data
}

export const updateSettings = async (settings: Partial<Settings>): Promise<Settings> => {
  const res = await client.put('/api/settings', settings)
  return res.data
}

export const getNextBillNumber = async (): Promise<{ billNumber: string }> => {
  const res = await client.get('/api/settings/next-bill-number')
  return res.data
}
