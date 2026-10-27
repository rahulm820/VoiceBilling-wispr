import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts } from '../api/products'
import { createLedger } from '../api/ledger'
import { useSettings } from '../hooks/useSettings'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { useNavigate } from 'react-router-dom'

export const ManualLedger: React.FC = () => {
  const { settings } = useSettings()
  const { data } = useQuery({ queryKey: ['products'], queryFn: () => getProducts() })
  const products = data?.products || []
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [type, setType] = useState('sale')
  const [partyName, setPartyName] = useState('')
  const [partyPhone, setPartyPhone] = useState('')
  const [gstApplied, setGstApplied] = useState(settings?.gstOnByDefault ?? true)
  const [discountPercent, setDiscountPercent] = useState(settings?.discountOnByDefault ? (settings?.defaultDiscountPercent || 0) : 0)
  const [items, setItems] = useState<any[]>([])
  const [msg, setMsg] = useState('')
  const [warnings, setWarnings] = useState<string[]>([])

  const addItem = (p: any) => {
    setItems([...items, { name: p.name, quantity: 1, unit: p.unit, unitPrice: p.defaultSellingPrice, total: p.defaultSellingPrice }])
  }

  const updateItem = (idx: number, key: string, value: any) => {
    const copy = [...items]
    copy[idx][key] = value
    if (key === 'quantity' || key === 'unitPrice') {
      copy[idx].total = Number(copy[idx].quantity) * Number(copy[idx].unitPrice)
    }
    setItems(copy)
  }

  const subtotal = items.reduce((s, i) => s + Number(i.total || 0), 0)
  const gstRate = settings?.defaultGstRate || 18
  const gstAmount = gstApplied ? (subtotal * gstRate) / 100 : 0
  const discountAmount = discountPercent ? (subtotal * discountPercent) / 100 : 0
  const total = subtotal + gstAmount - discountAmount

  const mutation = useMutation({
    mutationFn: createLedger,
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['ledger'] })
      qc.invalidateQueries({ queryKey: ['stock'] })
      qc.invalidateQueries({ queryKey: ['insights'] })
      if (res.entry?.warnings) setWarnings(res.entry.warnings)
      else { navigate('/ledger') }
    }
  })

  const save = async () => {
    setMsg('')
    try {
      if (!partyName) throw new Error('Customer name required')
      if (items.length === 0) throw new Error('At least one item required')
      await mutation.mutateAsync({
        type,
        partyName,
        partyPhone,
        entryNumber: 'L-' + Date.now(),
        date: new Date().toISOString(),
        items: items.map(i => ({ name: i.name, quantity: Number(i.quantity), unit: i.unit, unitPrice: Number(i.unitPrice), total: Number(i.total) })),
        subtotal,
        gstApplied,
        gstRate,
        gstAmount,
        discountPercent,
        discountAmount,
        total,
      })
    } catch (e: any) { setMsg(e.message) }
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h1>Manual Entry</h1>
      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <Button variant={type === 'sale' ? 'primary' : 'secondary'} onClick={() => setType('sale')}>Sale</Button>
          <Button variant={type === 'purchase' ? 'primary' : 'secondary'} onClick={() => setType('purchase')}>Purchase</Button>
        </div>
        <Input label="Party Name" value={partyName} onChange={e => setPartyName(e.target.value)} />
        <Input label="Party Phone" value={partyPhone} onChange={e => setPartyPhone(e.target.value)} />
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Add Item</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {products.map(p => <Button key={p.id} variant="secondary" onClick={() => addItem(p)}>{p.name}</Button>)}
          </div>
        </div>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <input value={item.name} readOnly style={{ padding: 8 }} />
            <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} style={{ width: 80, padding: 8 }} />
            <input value={item.unit} readOnly style={{ width: 60, padding: 8 }} />
            <input type="number" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} style={{ width: 100, padding: 8 }} />
            <div style={{ padding: 8 }}>₹{item.total}</div>
            <Button variant="danger" onClick={() => setItems(items.filter((_, i) => i !== idx))}>Remove</Button>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, marginTop: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={gstApplied} onChange={e => setGstApplied(e.target.checked)} /> GST ({gstRate}%)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <input type="checkbox" checked={discountPercent > 0} onChange={e => setDiscountPercent(e.target.checked ? (settings?.defaultDiscountPercent || 0) : 0)} /> Discount ({discountPercent}%)
          </label>
          <div style={{ marginTop: 12 }}>Subtotal: ₹{subtotal.toFixed(2)}</div>
          {gstApplied && <div>GST: ₹{gstAmount.toFixed(2)}</div>}
          {discountPercent > 0 && <div>Discount: -₹{discountAmount.toFixed(2)}</div>}
          <div style={{ fontWeight: 600, fontSize: 18 }}>Grand Total: ₹{total.toFixed(2)}</div>
        </div>
        {msg && <div style={{ color: 'var(--color-danger)', marginTop: 8 }}>{msg}</div>}
        {warnings.map((w, i) => <div key={i} style={{ color: 'var(--color-warning)', marginTop: 4 }}>{w}</div>)}
        <div style={{ marginTop: 12 }}>
          <Button onClick={save} loading={mutation.isPending} disabled={mutation.isPending}>Save</Button>
        </div>
      </Card>
    </div>
  )
}
