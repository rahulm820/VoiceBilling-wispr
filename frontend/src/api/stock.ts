import client from './client'
import { Product } from '../types'

export const getStock = async (search?: string): Promise<{ products: Product[] }> => {
  const res = await client.get('/api/products', { params: search ? { search } : {} })
  return res.data
}

export const createStock = async (data: any): Promise<{ product: Product, message?: string }> => {
  const res = await client.post('/api/products', data)
  return res.data
}

export const updateStock = async (id: string, data: any): Promise<Product> => {
  const res = await client.patch(`/api/products/${id}`, data)
  return res.data
}

export const deleteStock = async (id: string): Promise<{ success: boolean }> => {
  const res = await client.delete(`/api/products/${id}`)
  return res.data
}
