import client from '../api/client'

export const getDailyInsights = async (date?: string) => {
  const res = await client.get('/api/insights/daily', { params: date ? { date } : {} })
  return res.data
}

export const getTrend = async (days = 7) => {
  const res = await client.get('/api/insights/trend', { params: { days } })
  return res.data
}
