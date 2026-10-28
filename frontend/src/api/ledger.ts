import client from './client'
import { LedgerEntry } from '../types'

export const getLedger = async (params?: any): Promise<{ entries: LedgerEntry[] }> => {
  const res = await client.get('/api/ledger', { params })
  return res.data
}

export const createLedger = async (data: any): Promise<{ entry: LedgerEntry }> => {
  const res = await client.post('/api/ledger', data)
  return res.data
}

export const getLedgerById = async (id: string): Promise<{ entry: LedgerEntry }> => {
  const res = await client.get(`/api/ledger/${id}`)
  return res.data
}
