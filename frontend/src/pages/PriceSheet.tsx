import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Search, Tags, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { getProducts, updatePriceSheet } from '@/api/products'
import { useSettings } from '@/hooks/useSettings'
import { inr } from '@/lib/format'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ErrorPanel } from '@/components/ErrorPanel'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Edit = { price?: string; gst?: string }

export const PriceSheet: React.FC = () => {
  const qc = useQueryClient()
  const { settings } = useSettings()
  const sym = settings?.currencySymbol || '₹'
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ['products'], queryFn: () => getProducts() })
  const products = useMemo(() => data?.products ?? [], [data])
  const [edits, setEdits] = useState<Record<string, Edit>>({})
  const [search, setSearch] = useState('')

  const mutation = useMutation({
    mutationFn: updatePriceSheet,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['stock'] })
    },
  })

  const setEdit = (id: string, patch: Edit) => setEdits((cur) => ({ ...cur, [id]: { ...cur[id], ...patch } }))

  const priceOf = (id: string, base: number) => edits[id]?.price ?? String(base)
  const gstOf = (id: string, base?: number | null) => edits[id]?.gst ?? (base == null ? '' : String(base))

  const changed = products.filter((p) => {
    const e = edits[p.id]
    if (!e) return false
    const priceChanged = e.price !== undefined && Number(e.price) !== p.defaultSellingPrice
    const gstChanged = e.gst !== undefined && (e.gst === '' ? null : Number(e.gst)) !== (p.gstOverride ?? null)
    return priceChanged || gstChanged
  })

  const save = async () => {
    const items = changed.map((p) => ({
      id: p.id,
      defaultSellingPrice: Number(priceOf(p.id, p.defaultSellingPrice)),
      gstOverride: gstOf(p.id, p.gstOverride) === '' ? null : Number(gstOf(p.id, p.gstOverride)),
    }))
    if (items.some((i) => Number.isNaN(i.defaultSellingPrice) || i.defaultSellingPrice < 0)) return toast.error('Prices cannot be negative.')
    if (items.some((i) => i.gstOverride != null && (Number.isNaN(i.gstOverride) || i.gstOverride < 0 || i.gstOverride > 100)))
      return toast.error('GST must be between 0 and 100.')
    try {
      await mutation.mutateAsync(items)
      setEdits({})
      toast.success(`${items.length} price${items.length === 1 ? '' : 's'} saved`)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className={cn(changed.length > 0 && 'pb-20')}>
      <PageHeader en="Price Sheet" hi="भाव" />

      {products.length > 0 && (
        <div className="relative mb-4 max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items" aria-label="Search items" className="pl-9" />
        </div>
      )}

      {isError && <ErrorPanel message={`Could not load prices. ${(error as Error).message}`} onRetry={() => refetch()} />}

      {!isError && (
        <Card className="gap-0 overflow-hidden py-0">
          {isLoading ? (
            <div className="space-y-px">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-none" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={Tags}
              title="No prices to set yet"
              hint="Items you add in Stock show up here, so you can set their selling price."
              action={
                <Button asChild>
                  <Link to="/stock">Go to Stock</Link>
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col">Item</TableHead>
                  <TableHead scope="col" className="text-right">Cost</TableHead>
                  <TableHead scope="col" className="text-right">Selling price</TableHead>
                  <TableHead scope="col" className="text-right">Margin</TableHead>
                  <TableHead scope="col" className="text-right">GST %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const price = Number(priceOf(p.id, p.defaultSellingPrice))
                  const margin = p.costPrice > 0 ? ((price - p.costPrice) / p.costPrice) * 100 : null
                  const below = price < p.costPrice
                  const dirty = changed.some((c) => c.id === p.id)
                  return (
                    <TableRow key={p.id} className={cn('h-16', dirty && 'bg-info-soft hover:bg-info-soft', below && !dirty && 'bg-warning-soft hover:bg-warning-soft')}>
                      <TableCell>
                        <span className="font-semibold">{p.name}</span>
                        <span className="ml-1 text-sm text-muted-foreground">/ {p.unit}</span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{inr(p.costPrice, sym)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <Input
                            type="number"
                            min={0}
                            step="any"
                            inputMode="decimal"
                            value={priceOf(p.id, p.defaultSellingPrice)}
                            onChange={(e) => setEdit(p.id, { price: e.target.value })}
                            className="h-10 w-28 text-right"
                            aria-label={`${p.name} selling price`}
                            aria-invalid={below}
                          />
                          {below && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning">
                              <TriangleAlert className="size-3.5" aria-hidden /> Below cost
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={cn('text-right font-semibold', margin != null && margin < 0 ? 'text-destructive' : 'text-success')}>
                        {margin == null ? '-' : `${margin.toFixed(1)}%`}
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step="any"
                          inputMode="decimal"
                          placeholder={String(settings?.defaultGstRate ?? 18)}
                          value={gstOf(p.id, p.gstOverride)}
                          onChange={(e) => setEdit(p.id, { gst: e.target.value })}
                          className="ml-auto h-10 w-20 text-right"
                          aria-label={`${p.name} GST override`}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {changed.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-20 flex items-center justify-between gap-3 border-t bg-card px-4 py-3 md:bottom-0 md:left-[72px] md:px-6 lg:left-60 lg:px-8">
          <p className="text-sm font-semibold">
            {changed.length} unsaved change{changed.length === 1 ? '' : 's'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEdits({})} disabled={mutation.isPending}>
              Discard
            </Button>
            <Button onClick={save} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" aria-hidden />} Save all
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
