import client from '../api/client'
import { MOCK_API } from '../utils/env'

export const transcribeLedger = async (audioBlob: Blob): Promise<{ transcript: string, items: Array<{ name: string, quantity: number, unit: string, price: number }> }> => {
  if (MOCK_API) {
    await new Promise(r => setTimeout(r, 1500))
    return {
      transcript: 'Add two kilos of sugar at forty rupees, one litre of oil at one hundred twenty rupees, and three packets of rice at sixty rupees per packet.',
      items: [
        { name: 'Sugar', quantity: 2, unit: 'kg', price: 40 },
        { name: 'Oil', quantity: 1, unit: 'L', price: 120 },
        { name: 'Rice', quantity: 3, unit: 'packets', price: 60 },
      ]
    }
  }
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  const res = await client.post('/api/voice/bill', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const transcribeText = async (text: string): Promise<{ transcript: string, items: Array<{ name: string, quantity: number, unit: string, price: number }> }> => {
  const res = await client.post('/api/voice/text', { text })
  return res.data
}
