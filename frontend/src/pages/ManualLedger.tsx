import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Trash2, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { getProducts } from '@/api/products'
import { createLedger } from '@/api/ledger'
import { useSettings } from '@/hooks/useSettings'
import type { Product } from '@/types'
import { computeTotals } from '@/lib/bill'
import { inr } from '@/lib/format'
import { PageHeader } from '@/components/PageHeader'
import { BillSaveBar, BillSummary } from '@/components/BillSummary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Line {
  name: string
  quantity: number | string
  unit: string
  unitPrice: number | string
  custom?: boolean
}

const lineTotal = (l: Line) => Number(l.quantity || 0) * Number(l.unitPrice || 0)

export const ManualLedger: React.FC = () => {
  const { settings } = useSettings()
  const sym = settings?.currencySymbol || '₹'
  const { data } = useQuery({ queryKey: ['products'], queryFn: () => getProducts() })
  const products = data?.products || []
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [type, setType] = useState('sale')
  const [partyName, setPartyName] = useState('')
  const [partyPhone, setPartyPhone] = useState('')
  const [gstApplied, setGstApplied] = useState(true)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [items, setItems] = useState<Line[]>([])
  const [find, setFind] = useState('')
  const [warnings, setWarnings] = useState<string[]>([])
  const seeded = useRef(false)

  useEffect(() => {
    if (settings && !seeded.current) {
      seeded.current = true
      setGstApplied(settings.gstOnByDefault)
      setDiscountPercent(settings.discountOnByDefault ? settings.defaultDiscountPercent || 0 : 0)
    }
  }, [settings])

  const gstRate = settings?.defaultGstRate || 18
  const subtotal = items.reduce((s, i) => s + lineTotal(i), 0)
  const totals = computeTotals(subtotal, gstApplied, gstRate, discountPercent)

  const matches = useMemo(() => {
    const q = find.trim().toLowerCase()
    return (q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products).slice(0, 8)
  }, [find, products])

  const addItem = (p: Product) => {
    setItems((cur) => {
      const at = cur.findIndex((l) => l.name === p.name && l.unit === p.unit)
      if (at >= 0) return cur.map((l, i) => (i === at ? { ...l, quantity: Number(l.quantity) + 1 } : l))
      return [...cur, { name: p.name, quantity: 1, unit: p.unit, unitPrice: type === 'purchase' ? p.costPrice : p.defaultSellingPrice }]
    })
    setFind('')
  }

  const addCustom = () => {
    const name = find.trim()
    if (!name) return
    setItems((cur) => [...cur, { name, quantity: 1, unit: 'pcs', unitPrice: '', custom: true }])
    setFind('')
  }

  const patch = (idx: number, key: 'quantity' | 'unitPrice', value: string) =>
    setItems((cur) => cur.map((l, i) => (i === idx ? { ...l, [key]: value } : l)))

  const mutation = useMutation({
    mutationFn: createLedger,
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['ledger'] })
      qc.invalidateQueries({ queryKey: ['stock'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['insights'] })
      if (res.entry?.warnings?.length) {
        setWarnings(res.entry.warnings)
        toast.success('Saved, with warnings')
      } else {
        toast.success(type === 'sale' ? 'Sale saved' : 'Purchase saved')
        navigate('/ledger')
      }
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const save = () => {
    if (!partyName.trim()) return toast.error('Enter the party name first.')
    if (items.length === 0) return toast.error('Add at least one item.')
    if (items.some((i) => !(Number(i.quantity) > 0))) return toast.error('Every item needs a quantity above zero.')
    mutation.mutate({
      type,
      partyName: partyName.trim(),
      partyPhone,
      entryNumber: 'L-' + Date.now(),
      date: new Date().toISOString(),
      items: items.map((i) => ({ name: i.name, quantity: Number(i.quantity), unit: i.unit, unitPrice: Number(i.unitPrice), total: lineTotal(i) })),
      subtotal: totals.subtotal,
      gstApplied,
      gstRate,
      gstAmount: totals.gstAmount,
      discountPercent,
      discountAmount: totals.discountAmount,
      total: totals.total,
    })
  }

  return (
    <div>
      <PageHeader
        en="Manual entry"
        hi="हाथ से लिखें"
        actions={
          <Tabs value={type} onValueChange={setType}>
            <TabsList>
              <TabsTrigger value="sale">Sale</TabsTrigger>
              <TabsTrigger value="purchase">Purchase</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Add items</CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Search your stock" aria-label="Search your stock" className="pl-9" />
              </div>
              {products.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No products yet. Add some in Stock first.</p>
              ) : matches.length === 0 ? (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>Nothing in stock matches “{find}”.</span>
                  <Button variant="outline" size="sm" className="h-10" onClick={addCustom}>
                    <Plus aria-hidden /> Add “{find.trim()}” anyway
                  </Button>
                </div>
              ) : (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {matches.map((p) => (
                    <li key={p.id}>
                      <Button variant="outline" size="sm" className="h-10" onClick={() => addItem(p)}>
                        <Plus aria-hidden /> {p.name}
                        <span className="text-muted-foreground">
                          {inr(type === 'purchase' ? p.costPrice : p.defaultSellingPrice, sym)}/{p.unit}
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base">Items on this bill</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nothing added yet. Tap an item above.</p>
              ) : (
                <ul className="divide-y">
                  {items.map((item, idx) => (
                    <li key={`${item.name}-${idx}`} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex flex-wrap items-center gap-2 font-semibold">
                          {item.name}
                          {item.custom && <span className="rounded-sm bg-warning-soft px-1.5 py-0.5 text-xs font-semibold text-warning">Not in stock</span>}
                          {item.unitPrice === '' && <span className="rounded-sm bg-warning-soft px-1.5 py-0.5 text-xs font-semibold text-warning">No price yet</span>}
                        </p>
                        <Button variant="ghost" size="icon-sm" aria-label={`Remove ${item.name}`} onClick={() => setItems((c) => c.filter((_, i) => i !== idx))}>
                          <Trash2 aria-hidden />
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2">
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            min={0}
                            step="any"
                            inputMode="decimal"
                            value={item.quantity}
                            onChange={(e) => patch(idx, 'quantity', e.target.value)}
                            className="w-24 text-right"
                            aria-label={`${item.name} quantity`}
                          />
                          <span className="w-10 text-sm text-muted-foreground">{item.unit}</span>
                        </div>
                        <span className="text-muted-foreground" aria-hidden>×</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm text-muted-foreground">{sym}</span>
                          <Input
                            type="number"
                            min={0}
                            step="any"
                            inputMode="decimal"
                            value={item.unitPrice}
                            onChange={(e) => patch(idx, 'unitPrice', e.target.value)}
                            className="w-28 text-right"
                            placeholder="Price"
                            aria-label={`${item.name} price per ${item.unit}`}
                          />
                        </div>
                        <p className="ml-auto text-lg font-bold">{inr(lineTotal(item), sym)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {warnings.length > 0 && (
            <div role="alert" className="space-y-2 rounded-md border border-warning/50 bg-warning-soft p-3 text-sm">
              {warnings.map((w, i) => (
                <p key={i} className="flex items-start gap-2">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden /> {w}
                </p>
              ))}
              <Button size="sm" onClick={() => navigate('/ledger')}>
                Go to ledger
              </Button>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <BillSummary
            idPrefix="manual"
            sym={sym}
            totals={totals}
            partyName={partyName}
            partyPhone={partyPhone}
            onParty={(n, p) => {
              setPartyName(n)
              setPartyPhone(p)
            }}
            gstApplied={gstApplied}
            gstRate={gstRate}
            onGst={setGstApplied}
            discountPercent={discountPercent}
            onDiscount={setDiscountPercent}
            defaultDiscount={settings?.defaultDiscountPercent || 0}
            saving={mutation.isPending}
            onSave={save}
            saveLabel={type === 'sale' ? 'Save sale' : 'Save purchase'}
          />
        </div>
      </div>

      <BillSaveBar sym={sym} total={totals.total} saving={mutation.isPending} onSave={save} label={type === 'sale' ? 'Save sale' : 'Save purchase'} />
    </div>
  )
}
