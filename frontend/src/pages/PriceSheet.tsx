import React, { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, updatePriceSheet } from '../api/products'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Link } from 'react-router-dom'

export const PriceSheet: React.FC = () => {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['products'], queryFn: () => getProducts() })
  const products = data?.products || []
  const [rows, setRows] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    setRows(products.map(p => ({ ...p, changed: false })))
  }, [products])

  const mutation = useMutation({
    mutationFn: (items: any[]) => updatePriceSheet(items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] })
  })

  const change = (id: string, key: string, value: any) => {
    setRows(rows.map(r => r.id === id ? { ...r, [key]: value, changed: true } : r))
  }

  const filtered = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
  const changed = rows.filter(r => r.changed)

  const save = async () => {
    const items = changed.map(r => ({ id: r.id, defaultSellingPrice: Number(r.defaultSellingPrice), gstOverride: r.gstOverride === '' ? null : (r.gstOverride == null ? null : Number(r.gstOverride)) }))
    await mutation.mutateAsync(items)
    setRows(rows.map(r => ({ ...r, changed: false })))
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>Price Sheet</h1>
      <div style={{ marginBottom: 12 }}>
        <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} style={{ padding: 8 }} />
      </div>
      {products.length === 0 && <Card><Empty /></Card>}
      {products.length > 0 && (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
                  <th>Unit</th>
                  <th>Cost Price</th>
                  <th>Default Selling Price</th>
                  <th>Margin %</th>
                  <th>GST Override</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const margin = r.costPrice > 0 ? ((Number(r.defaultSellingPrice) - r.costPrice) / r.costPrice) * 100 : 0
                  const warn = Number(r.defaultSellingPrice) < r.costPrice
                  return (
                    <tr key={r.id} style={{ background: r.changed ? '#fffbe6' : 'transparent' }}>
                      <td style={{ padding: 8 }}>{r.name}</td>
                      <td style={{ textAlign: 'center' }}>{r.unit}</td>
                      <td style={{ textAlign: 'center' }}>{r.costPrice}</td>
                      <td style={{ textAlign: 'center' }}>
                        <input type="number" value={r.defaultSellingPrice} onChange={e => change(r.id, 'defaultSellingPrice', e.target.value)} style={{ width: 80, borderColor: warn ? 'var(--color-danger)' : 'var(--color-border)' }} />
                        {warn && <div style={{ color: 'var(--color-danger)', fontSize: 11 }}>Below cost</div>}
                      </td>
                      <td style={{ textAlign: 'center' }}>{margin.toFixed(1)}%</td>
                      <td style={{ textAlign: 'center' }}>
                        <input type="number" value={r.gstOverride ?? ''} onChange={e => change(r.id, 'gstOverride', e.target.value)} style={{ width: 60 }} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12 }}>
            <Button onClick={save} disabled={changed.length === 0 || mutation.isPending} loading={mutation.isPending}>Save All ({changed.length})</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

const Empty: React.FC = () => (
  <div style={{ textAlign: 'center' }}>
    <div>No products yet</div>
    <Link to="/stock">Add in Stock</Link>
  </div>
)
