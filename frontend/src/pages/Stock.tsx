import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStock, createStock, updateStock, deleteStock } from '../api/stock'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Modal } from '../components/Modal'

const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'dozen', 'packets', 'bottles', 'bags', 'litres', 'sachets', 'boxes', 'meters', 'feet']

export const Stock: React.FC = () => {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [lowOnly, setLowOnly] = useState(false)
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<any>(null)
  const [restock, setRestock] = useState<any>(null)
  const [form, setForm] = useState<any>({ name: '', quantity: 0, unit: 'kg', costPrice: 0, defaultSellingPrice: 0 })
  const [msg, setMsg] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['stock', search], queryFn: () => getStock(search) })
  let items = data?.products || []
  if (lowOnly) items = items.filter(i => i.lowStock)

  const createMut = useMutation({ mutationFn: createStock, onSuccess: () => qc.invalidateQueries({ queryKey: ['stock'] }) })
  const updateMut = useMutation({ mutationFn: ({ id, data }: any) => updateStock(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['stock'] }) })
  const deleteMut = useMutation({ mutationFn: deleteStock, onSuccess: () => qc.invalidateQueries({ queryKey: ['stock'] }) })

  const openAdd = () => { setEdit(null); setForm({ name: '', quantity: 0, unit: 'kg', costPrice: 0, defaultSellingPrice: 0 }); setMsg(''); setOpen(true) }
  const openEdit = (p: any) => { setEdit(p); setForm({ name: p.name, quantity: p.stockQuantity, unit: p.unit, costPrice: p.costPrice, defaultSellingPrice: p.defaultSellingPrice }); setMsg(''); setOpen(true) }
  const openRestock = (p: any) => { setRestock(p); setForm({ quantity: 0 }); setOpen(true) }

  const save = async () => {
    setMsg('')
    try {
      if (restock) {
        await updateMut.mutateAsync({ id: restock.id, data: { stockQuantity: Number(restock.stockQuantity) + Number(form.quantity) } })
        setOpen(false); setRestock(null); return
      }
      if (edit) {
        await updateMut.mutateAsync({ id: edit.id, data: form })
        setOpen(false); return
      }
      const res: any = await createMut.mutateAsync(form)
      if (res.message) setMsg(res.message)
      setOpen(false)
    } catch (e: any) { setMsg(e.message) }
  }

  const del = async (id: string) => {
    if (!confirm('Delete this item?')) return
    await deleteMut.mutateAsync(id)
  }

  return (
    <div>
      <h1>Stock</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} style={{ padding: 8 }} />
        <label><input type="checkbox" checked={lowOnly} onChange={e => setLowOnly(e.target.checked)} /> Low stock only</label>
        <Button onClick={openAdd}>Add Item</Button>
      </div>
      {msg && <div style={{ color: 'var(--color-success)', marginBottom: 8 }}>{msg}</div>}
      {isLoading && <div>Loading...</div>}
      {items.length === 0 && !isLoading && <Card>No items</Card>}
      {items.length > 0 && (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr><th style={{ textAlign: 'left', padding: 8 }}>Name</th><th>Qty</th><th>Unit</th><th>Cost</th><th>Price</th><th></th></tr>
              </thead>
              <tbody>
                {items.map(p => (
                  <tr key={p.id}>
                    <td style={{ padding: 8 }}>{p.name} {p.lowStock && <span style={{ color: 'var(--color-danger)' }}>LOW</span>}</td>
                    <td style={{ textAlign: 'center' }}>{p.stockQuantity}</td>
                    <td style={{ textAlign: 'center' }}>{p.unit}</td>
                    <td style={{ textAlign: 'center' }}>{p.costPrice}</td>
                    <td style={{ textAlign: 'center' }}>{p.defaultSellingPrice}</td>
                    <td style={{ textAlign: 'center', display: 'flex', gap: 6 }}>
                      <Button onClick={() => openRestock(p)}>Add Stock</Button>
                      <Button variant="secondary" onClick={() => openEdit(p)}>Edit</Button>
                      <Button variant="danger" onClick={() => del(p.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal open={open && !restock} onClose={() => setOpen(false)} title={edit ? 'Edit Item' : 'Add Item'}>
        <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input label="Quantity" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
        <label>Unit</label>
        <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={{ width: '100%', padding: 8, marginBottom: 12 }}>
          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <Input label="Cost Price" type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} />
        <Input label="Default Selling Price" type="number" value={form.defaultSellingPrice} onChange={e => setForm({ ...form, defaultSellingPrice: e.target.value })} />
        <Button onClick={save}>Save</Button>
      </Modal>
      <Modal open={open && !!restock} onClose={() => { setOpen(false); setRestock(null) }} title="Add Stock">
        <div style={{ marginBottom: 12 }}>{restock?.name}</div>
        <Input label="Quantity to add" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
        <Button onClick={save}>Add</Button>
      </Modal>
    </div>
  )
}
