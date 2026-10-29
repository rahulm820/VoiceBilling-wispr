import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { BillTotals } from '@/lib/bill'
import { inr } from '@/lib/format'

interface Props {
  sym: string
  totals: BillTotals
  partyName: string
  partyPhone: string
  onParty: (name: string, phone: string) => void
  gstApplied: boolean
  gstRate: number
  onGst: (on: boolean) => void
  discountPercent: number
  onDiscount: (percent: number) => void
  defaultDiscount: number
  saving: boolean
  onSave: () => void
  saveLabel: string
  idPrefix: string
}

export function BillSummary(p: Props) {
  const discountOn = p.discountPercent > 0
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-4">
        <CardTitle className="text-base">Bill</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <div className="space-y-1.5">
          <Label htmlFor={`${p.idPrefix}-party`}>Party name</Label>
          <Input id={`${p.idPrefix}-party`} value={p.partyName} onChange={(e) => p.onParty(e.target.value, p.partyPhone)} autoComplete="off" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${p.idPrefix}-phone`}>Phone (optional)</Label>
          <Input
            id={`${p.idPrefix}-phone`}
            type="tel"
            inputMode="tel"
            value={p.partyPhone}
            onChange={(e) => p.onParty(p.partyName, e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <Label htmlFor={`${p.idPrefix}-gst`} className="text-sm">
            GST ({p.gstRate}%)
          </Label>
          <Switch id={`${p.idPrefix}-gst`} checked={p.gstApplied} onCheckedChange={p.onGst} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={`${p.idPrefix}-disc`} className="text-sm">
            Discount
          </Label>
          <div className="flex items-center gap-2">
            {discountOn && (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={p.discountPercent}
                  onChange={(e) => p.onDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="h-9 w-16 px-2 text-right"
                  aria-label="Discount percent"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            )}
            <Switch
              id={`${p.idPrefix}-disc`}
              checked={discountOn}
              onCheckedChange={(on) => p.onDiscount(on ? p.defaultDiscount || 5 : 0)}
            />
          </div>
        </div>

        <dl className="space-y-1.5 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{inr(p.totals.subtotal, p.sym)}</dd>
          </div>
          {p.gstApplied && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">GST</dt>
              <dd>{inr(p.totals.gstAmount, p.sym)}</dd>
            </div>
          )}
          {discountOn && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Discount</dt>
              <dd>-{inr(p.totals.discountAmount, p.sym)}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between pt-2">
            <dt className="font-semibold">Grand total</dt>
            <dd className="text-3xl font-bold tracking-tight">{inr(p.totals.total, p.sym)}</dd>
          </div>
        </dl>

        <Button size="lg" className="hidden w-full lg:inline-flex" onClick={p.onSave} disabled={p.saving}>
          {p.saving && <Loader2 className="animate-spin" aria-hidden />}
          {p.saveLabel}
        </Button>
      </CardContent>
    </Card>
  )
}

/** Phone-only sticky total + save, sits above the bottom nav. */
export function BillSaveBar({ sym, total, saving, onSave, label }: { sym: string; total: number; saving: boolean; onSave: () => void; label: string }) {
  return (
    <div className="no-print fixed inset-x-0 bottom-16 z-20 flex items-center justify-between gap-3 border-t bg-card px-4 py-2.5 lg:hidden">
      <div>
        <p className="text-xs text-muted-foreground">Grand total</p>
        <p className="text-xl font-bold leading-tight">{inr(total, sym)}</p>
      </div>
      <Button size="lg" onClick={onSave} disabled={saving}>
        {saving && <Loader2 className="animate-spin" aria-hidden />}
        {label}
      </Button>
    </div>
  )
}
