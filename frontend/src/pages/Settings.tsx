import React, { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { useSettings } from '../hooks/useSettings'

export const Settings: React.FC = () => {
  const { settings, isLoading, update, updating } = useSettings()
  const [form, setForm] = useState<any>({})
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (settings) setForm(settings)
  }, [settings])

  const change = (key: string, value: any) => {
    setForm({ ...form, [key]: value })
    setSaved(false)
  }

  const save = async () => {
    setError('')
    try {
      if (form.defaultGstRate < 0 || form.defaultGstRate > 100) throw new Error('GST must be 0-100')
      if (form.defaultDiscountPercent < 0 || form.defaultDiscountPercent > 100) throw new Error('Discount must be 0-100')
      await update(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div style={{ maxWidth: 700 }}>
      <h1>Settings</h1>
      <Card>
        <h3>Shop Profile</h3>
        <Input label="Owner Name" value={form.ownerName || ''} onChange={e => change('ownerName', e.target.value)} />
        <Input label="Shop Name" value={form.shopName || ''} onChange={e => change('shopName', e.target.value)} />
        <Input label="Phone" value={form.shopPhone || ''} onChange={e => change('shopPhone', e.target.value)} />
        <Input label="Address" value={form.shopAddress || ''} onChange={e => change('shopAddress', e.target.value)} />
        <Input label="GST Number" value={form.gstNumber || ''} onChange={e => change('gstNumber', e.target.value)} />
      </Card>
      <div style={{ height: 16 }} />
      <Card>
        <h3>Billing Defaults</h3>
        <Input label="Default GST Rate (%)" type="number" value={form.defaultGstRate ?? 18} onChange={e => change('defaultGstRate', Number(e.target.value))} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <input type="checkbox" checked={form.gstOnByDefault ?? true} onChange={e => change('gstOnByDefault', e.target.checked)} /> GST on by default
        </label>
        <Input label="Default Discount (%)" type="number" value={form.defaultDiscountPercent ?? 0} onChange={e => change('defaultDiscountPercent', Number(e.target.value))} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <input type="checkbox" checked={form.discountOnByDefault ?? false} onChange={e => change('discountOnByDefault', e.target.checked)} /> Discount on by default
        </label>
        <Input label="Bill Number Prefix" value={form.billNumberPrefix || 'B-'} onChange={e => change('billNumberPrefix', e.target.value)} />
        <Input label="Currency Symbol" value={form.currencySymbol || '₹'} onChange={e => change('currencySymbol', e.target.value)} />
      </Card>
      <div style={{ height: 16 }} />
      <Card>
        <h3>Stock Defaults</h3>
        <Input label="Default Low Stock Threshold" type="number" value={form.defaultLowStockThreshold ?? 5} onChange={e => change('defaultLowStockThreshold', Number(e.target.value))} />
      </Card>
      <div style={{ height: 16 }} />
      {error && <div style={{ color: 'var(--color-danger)', marginBottom: 8 }}>{error}</div>}
      {saved && <div style={{ color: 'var(--color-success)', marginBottom: 8 }}>Saved</div>}
      <Button onClick={save} loading={updating} disabled={updating}>Save Settings</Button>
    </div>
  )
}
