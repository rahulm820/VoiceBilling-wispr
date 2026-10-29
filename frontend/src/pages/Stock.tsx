import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Boxes, Loader2, MoreVertical, PackagePlus, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createStock, deleteStock, getStock, updateStock } from '@/api/stock'
import { useSettings } from '@/hooks/useSettings'
import type { Product } from '@/types'
import { inr, qty } from '@/lib/format'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ErrorPanel } from '@/components/ErrorPanel'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'dozen', 'packets', 'bottles', 'bags', 'litres', 'sachets', 'boxes', 'meters', 'feet']

const blank = { name: '', quantity: '0', unit: 'kg', costPrice: '0', defaultSellingPrice: '0' }

export const Stock: React.FC = () => {
  const qc = useQueryClient()
  const { settings } = useSettings()
  const sym = settings?.currencySymbol || '₹'
  const [search, setSearch] = useState('')
  const [lowOnly, setLowOnly] = useState(false)
  const [form, setForm] = useState(blank)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [restock, setRestock] = useState<Product | null>(null)
  const [addQty, setAddQty] = useState('')
  const [toDelete, setToDelete] = useState<Product | null>(null)
  const [formError, setFormError] = useState('')

  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ['stock', search], queryFn: () => getStock(search) })
  let items = data?.products || []
  if (lowOnly) items = items.filter((i) => i.lowStock)

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['stock'] })
    qc.invalidateQueries({ queryKey: ['products'] })
    qc.invalidateQueries({ queryKey: ['insights'] })
  }
  const createMut = useMutation({ mutationFn: createStock, onSuccess: refresh })
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => updateStock(id, data), onSuccess: refresh })
  const deleteMut = useMutation({ mutationFn: deleteStock, onSuccess: refresh })

  const openAdd = () => {
    setEditing(null)
    setForm(blank)
    setFormError('')
    setFormOpen(true)
  }
  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name,
      quantity: String(p.stockQuantity),
      unit: p.unit,
      costPrice: String(p.costPrice),
      defaultSellingPrice: String(p.defaultSellingPrice),
    })
    setFormError('')
    setFormOpen(true)
  }

  const saveForm = async () => {
    if (!form.name.trim()) return setFormError('Give the item a name.')
    const nums = [form.quantity, form.costPrice, form.defaultSellingPrice].map(Number)
    if (nums.some((n) => Number.isNaN(n) || n < 0)) return setFormError('Quantity and prices cannot be negative.')
    setFormError('')
    const body = {
      name: form.name.trim(),
      quantity: nums[0],
      unit: form.unit,
      costPrice: nums[1],
      defaultSellingPrice: nums[2],
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, data: body })
        toast.success(`${body.name} updated`)
      } else {
        const res = await createMut.mutateAsync(body)
        toast.success(res.message || `${body.name} added`)
      }
      setFormOpen(false)
    } catch (e: any) {
      setFormError(e.message)
    }
  }

  const saveRestock = async () => {
    const add = Number(addQty)
    if (!restock || !(add > 0)) return
    try {
      await updateMut.mutateAsync({ id: restock.id, data: { stockQuantity: Number(restock.stockQuantity) + add } })
      toast.success(`Added ${qty(add)} ${restock.unit} to ${restock.name}`)
      setRestock(null)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    try {
      await deleteMut.mutateAsync(toDelete.id)
      toast.success(`${toDelete.name} deleted`)
    } catch (e: any) {
      toast.error(e.message)
    }
    setToDelete(null)
  }

  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })
  const saving = createMut.isPending || updateMut.isPending

  return (
    <div>
      <PageHeader
        en="Stock"
        hi="माल"
        actions={
          <Button onClick={openAdd}>
            <Plus aria-hidden /> Add item
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items" aria-label="Search items" className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="low-only" checked={lowOnly} onCheckedChange={setLowOnly} />
          <Label htmlFor="low-only">Low stock only</Label>
        </div>
      </div>

      {isError && <ErrorPanel message={`Could not load stock. ${(error as Error).message}`} onRetry={() => refetch()} />}

      {!isError && (
        <Card className="gap-0 overflow-hidden py-0">
          {isLoading ? (
            <div className="space-y-px">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[60px] w-full rounded-none" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title={lowOnly ? 'Nothing is running low' : search ? 'No items match that search' : 'No stock yet'}
              hint={lowOnly ? 'Everything is above its low-stock level.' : search ? 'Check the spelling or clear the search.' : 'Add your first item so bills can price it and track what is left.'}
              action={!search && !lowOnly && <Button onClick={openAdd}>Add your first item</Button>}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col">Item</TableHead>
                  <TableHead scope="col" className="text-right">In stock</TableHead>
                  <TableHead scope="col" className="hidden text-right md:table-cell">Cost</TableHead>
                  <TableHead scope="col" className="hidden text-right md:table-cell">Selling price</TableHead>
                  <TableHead scope="col" className="w-0"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p.id} className="h-[60px]">
                    <TableCell>
                      <span className="font-semibold">{p.name}</span>
                      {p.lowStock && (
                        <Badge className="ml-2 rounded-sm border-0 bg-danger-soft font-semibold text-destructive">Low stock</Badge>
                      )}
                      <div className="text-xs text-muted-foreground md:hidden">
                        {inr(p.defaultSellingPrice, sym)} / {p.unit}
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${p.lowStock ? 'text-destructive' : ''}`}>
                      {qty(p.stockQuantity)} <span className="font-normal text-muted-foreground">{p.unit}</span>
                    </TableCell>
                    <TableCell className="hidden text-right md:table-cell">{inr(p.costPrice, sym)}</TableCell>
                    <TableCell className="hidden text-right md:table-cell">{inr(p.defaultSellingPrice, sym)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="hidden sm:inline-flex"
                          onClick={() => {
                            setRestock(p)
                            setAddQty('')
                          }}
                        >
                          <PackagePlus aria-hidden /> Restock
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${p.name}`}>
                              <MoreVertical aria-hidden />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-40">
                            <DropdownMenuItem
                              className="sm:hidden"
                              onSelect={() => {
                                setRestock(p)
                                setAddQty('')
                              }}
                            >
                              <PackagePlus aria-hidden /> Restock
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openEdit(p)}>
                              <Pencil aria-hidden /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => setToDelete(p)}>
                              <Trash2 aria-hidden /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      <Dialog open={formOpen} onOpenChange={(o) => !saving && setFormOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit item' : 'Add item'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Change the details. Past bills keep the prices they were made with.' : 'If this name and unit already exist, the quantity is added to that item.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="s-name">Name</Label>
              <Input id="s-name" value={form.name} onChange={set('name')} autoComplete="off" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="s-qty">Quantity</Label>
                <Input id="s-qty" type="number" min={0} step="any" inputMode="decimal" value={form.quantity} onChange={set('quantity')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-unit">Unit</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger id="s-unit" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-cost">Cost price</Label>
                <Input id="s-cost" type="number" min={0} step="any" inputMode="decimal" value={form.costPrice} onChange={set('costPrice')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-sell">Selling price</Label>
                <Input id="s-sell" type="number" min={0} step="any" inputMode="decimal" value={form.defaultSellingPrice} onChange={set('defaultSellingPrice')} />
              </div>
            </div>
            {formError && (
              <p role="alert" className="rounded-md border border-destructive/40 bg-danger-soft px-3 py-2 text-sm">
                {formError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveForm} disabled={saving}>
              {saving && <Loader2 className="animate-spin" aria-hidden />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!restock} onOpenChange={(o) => !o && setRestock(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Restock {restock?.name}</DialogTitle>
            <DialogDescription>
              Now {qty(restock?.stockQuantity)} {restock?.unit}. Enter how much arrived.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="r-qty">Quantity to add ({restock?.unit})</Label>
            <Input id="r-qty" type="number" min={0} step="any" inputMode="decimal" autoFocus value={addQty} onChange={(e) => setAddQty(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestock(null)}>
              Cancel
            </Button>
            <Button onClick={saveRestock} disabled={!(Number(addQty) > 0) || updateMut.isPending}>
              {updateMut.isPending && <Loader2 className="animate-spin" aria-hidden />} Add to stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>It is removed from stock and the price sheet. Bills already made are not changed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel autoFocus>Keep it</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
