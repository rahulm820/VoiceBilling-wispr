import client from './client'
import { Product } from '../types'

export const getProducts = async (search?: string): Promise<{ products: Product[] }> => {
  const res = await client.get('/api/products', { params: search ? { search } : {} })
  return res.data
}

export const updatePriceSheet = async (items: Array<{ id: string, defaultSellingPrice: number, gstOverride?: number | null }>): Promise<{ products: Product[] }> => {
  const res = await client.put('/api/products/price-sheet', { items })
  return res.data
}
