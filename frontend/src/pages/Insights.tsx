import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDailyInsights, getTrend } from '../api/insights'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'

export const Insights: React.FC = () => {
  const [days, setDays] = useState(7)
  const { data: daily } = useQuery({ queryKey: ['insights', 'daily'], queryFn: () => getDailyInsights() })
  const { data: trend } = useQuery({ queryKey: ['insights', 'trend', days], queryFn: () => getTrend(days) })
  const navigate = useNavigate()

  return (
    <div>
      <h1>Insights</h1>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Card><div>Sales Today</div><div style={{ fontSize: 24, fontWeight: 700 }}>₹{daily?.salesToday || 0}</div><div>{daily?.salesChangePercent != null ? daily.salesChangePercent + '%' : ''}</div></Card>
        <Card><div>Bills</div><div style={{ fontSize: 24, fontWeight: 700 }}>{daily?.salesCount || 0}</div></Card>
        <Card><div>Avg Bill</div><div style={{ fontSize: 24, fontWeight: 700 }}>₹{daily?.averageSaleValue || 0}</div></Card>
        <Card><div>Purchases</div><div style={{ fontSize: 24, fontWeight: 700 }}>₹{daily?.purchasesToday || 0}</div></Card>
        <Card><div>Profit</div><div style={{ fontSize: 24, fontWeight: 700 }}>₹{daily?.estimatedGrossProfit || 0}</div></Card>
      </div>
      <div style={{ height: 16 }} />
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontWeight: 600 }}>Trend</div>
          <div>
            <button onClick={() => setDays(7)}>7D</button>
            <button onClick={() => setDays(30)}>30D</button>
          </div>
        </div>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <LineChart data={trend?.days || []}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#1976D2" />
              <Line type="monotone" dataKey="purchases" stroke="#F39C12" />
              <Line type="monotone" dataKey="profit" stroke="#2ECC71" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div style={{ height: 16 }} />
      <div style={{ display: 'flex', gap: 12 }}>
        <Button onClick={() => navigate('/ledger/voice')}>New Sale by Voice</Button>
        <Button onClick={() => navigate('/ledger/manual')}>New Sale Manually</Button>
        <Button onClick={() => navigate('/stock')}>Add Stock</Button>
      </div>
      <div style={{ height: 16 }} />
      <Card>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Low Stock</div>
        {(daily?.lowStockItems || []).map((item: any) => (
          <div key={item.id} style={{ padding: 4 }}>{item.name} - {item.stockQuantity} {item.unit} (low)</div>
        ))}
        {(daily?.lowStockItems || []).length === 0 && <div>No low stock</div>}
      </Card>
    </div>
  )
}
