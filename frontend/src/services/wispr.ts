import client from '../api/client'
import { MOCK_API } from '../utils/env'

export const transcribeLedger = async (audioBlob: Blob): Promise<{ transcript: string, items: Array<{ name: string, quantity: number, unit: string, price: number, priceFromSheet?: boolean }> }> => {
  if (MOCK_API) {
    await new Promise(r => setTimeout(r, 1500))
    return {
      transcript: '2 kg sugar and 3 kg oil',
      items: [
        { name: 'Sugar', quantity: 2, unit: 'kg', price: 0, priceFromSheet: true },
        { name: 'Oil', quantity: 3, unit: 'kg', price: 0, priceFromSheet: true },
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

export const transcribeText = async (text: string): Promise<{ transcript: string, items: Array<{ name: string, quantity: number, unit: string, price: number, priceFromSheet?: boolean }> }> => {
  const res = await client.post('/api/voice/text', { text })
  return res.data
}
