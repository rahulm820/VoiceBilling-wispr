import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLedger } from '../api/ledger'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { useNavigate } from 'react-router-dom'

export const Ledger: React.FC = () => {
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({ queryKey: ['ledger', tab, search], queryFn: () => getLedger({ type: tab === 'all' ? undefined : tab, search: search || undefined }) })
  const entries = data?.entries || []

  return (
    <div>
      <h1>Ledger</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <Button variant={tab === 'all' ? 'primary' : 'secondary'} onClick={() => setTab('all')}>All</Button>
        <Button variant={tab === 'sale' ? 'primary' : 'secondary'} onClick={() => setTab('sale')}>Sales</Button>
        <Button variant={tab === 'purchase' ? 'primary' : 'secondary'} onClick={() => setTab('purchase')}>Purchases</Button>
        <input placeholder="Search party" value={search} onChange={e => setSearch(e.target.value)} style={{ padding: 8 }} />
        <Button onClick={() => navigate('/ledger/manual')}>Add Manually</Button>
        <Button onClick={() => navigate('/ledger/voice')}>Add Using Voice</Button>
      </div>
      {isLoading && <div>Loading...</div>}
      {entries.map(e => (
        <Card key={e.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => navigate(`/ledger/${e.id}`)}>
            <div>
              <div style={{ fontWeight: 600 }}>{e.partyName}</div>
              <div style={{ color: 'var(--color-muted)' }}>{e.type} • {new Date(e.date).toLocaleDateString()}</div>
            </div>
            <div style={{ fontWeight: 600 }}>₹{e.total}</div>
          </div>
        </Card>
      ))}
      {entries.length === 0 && !isLoading && <Card>No entries</Card>}
    </div>
  )
}
