import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getLedgerById } from '../api/ledger'
import { useSettings } from '../hooks/useSettings'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

export const LedgerDetails: React.FC = () => {
  const { id } = useParams()
  const { settings } = useSettings()
  const { data, isLoading } = useQuery({ queryKey: ['ledger', id], queryFn: () => getLedgerById(id!) })
  const entry = data?.entry

  const print = () => window.print()

  if (isLoading) return <div>Loading...</div>
  if (!entry) return <div>Not found</div>

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1>Ledger Details</h1>
        <Button onClick={print}>Print</Button>
      </div>
      <Card>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700 }}>{settings?.shopName || 'SmartLedger'}</div>
          <div>{settings?.shopPhone}</div>
          <div>{settings?.shopAddress}</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div>Party: {entry.partyName} {entry.partyPhone}</div>
          <div>Entry: {entry.entryNumber} | {new Date(entry.date).toLocaleString()}</div>
          <div>Type: {entry.type}</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th style={{ textAlign: 'left' }}>Item</th><th>Qty</th><th>Unit</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            {entry.items.map((it, i) => (
              <tr key={i}>
                <td>{it.name}</td>
                <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                <td style={{ textAlign: 'center' }}>{it.unit}</td>
                <td style={{ textAlign: 'center' }}>{it.unitPrice}</td>
                <td style={{ textAlign: 'center' }}>{it.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign: 'right', marginTop: 12 }}>
          <div>Subtotal: {settings?.currencySymbol}{entry.subtotal.toFixed(2)}</div>
          {entry.gstApplied && <div>GST ({entry.gstRate}%): {settings?.currencySymbol}{entry.gstAmount.toFixed(2)}</div>}
          {entry.discountPercent > 0 && <div>Discount ({entry.discountPercent}%): -{settings?.currencySymbol}{entry.discountAmount.toFixed(2)}</div>}
          <div style={{ fontWeight: 600 }}>Grand Total: {settings?.currencySymbol}{entry.total.toFixed(2)}</div>
        </div>
      </Card>
    </div>
  )
}
