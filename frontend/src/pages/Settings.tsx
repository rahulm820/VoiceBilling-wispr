import React, { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { Loader2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/useSettings'
import { useAuth } from '@/hooks/useAuth'
import type { Settings as SettingsT } from '@/types'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/PageHeader'
import { ErrorPanel } from '@/components/ErrorPanel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-b py-6 first:pt-0 md:grid-cols-[240px_1fr] md:gap-8">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      </div>
      <div className="grid max-w-xl gap-4">{children}</div>
    </section>
  )
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

export const Settings: React.FC = () => {
  const { settings, isLoading, error, update, updating } = useSettings()
  const { logout, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [form, setForm] = useState<Partial<SettingsT>>({})
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (settings) setForm(settings)
  }, [settings])

  const dirty = useMemo(() => !!settings && JSON.stringify(form) !== JSON.stringify(settings), [form, settings])
  const change = <K extends keyof SettingsT>(key: K, value: SettingsT[K]) => setForm((f) => ({ ...f, [key]: value }))
  const text = (key: keyof SettingsT) => (e: React.ChangeEvent<HTMLInputElement>) => change(key, e.target.value as never)
  const num = (key: keyof SettingsT) => (e: React.ChangeEvent<HTMLInputElement>) => change(key, Number(e.target.value) as never)

  const save = async () => {
    setFormError('')
    const gst = form.defaultGstRate ?? 0
    const disc = form.defaultDiscountPercent ?? 0
    if (gst < 0 || gst > 100) return setFormError('GST rate must be between 0 and 100.')
    if (disc < 0 || disc > 100) return setFormError('Discount must be between 0 and 100.')
    try {
      await update(form)
      toast.success('Settings saved')
    } catch (e: any) {
      setFormError(e.message)
    }
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader en="Settings" hi="सेटिंग" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className={cn(dirty && 'pb-20')}>
      <PageHeader en="Settings" hi="सेटिंग" />
      {error && <ErrorPanel message={`Could not load settings. ${(error as Error).message}`} />}

      <Section title="Shop profile" hint="Printed at the top of every bill.">
        <Field id="owner" label="Owner name">
          <Input id="owner" value={form.ownerName || ''} onChange={text('ownerName')} />
        </Field>
        <Field id="shop" label="Shop name">
          <Input id="shop" value={form.shopName || ''} onChange={text('shopName')} />
        </Field>
        <Field id="phone" label="Phone">
          <Input id="phone" type="tel" inputMode="tel" value={form.shopPhone || ''} onChange={text('shopPhone')} />
        </Field>
        <Field id="addr" label="Address">
          <Input id="addr" value={form.shopAddress || ''} onChange={text('shopAddress')} />
        </Field>
        <Field id="gstin" label="GST number">
          <Input id="gstin" value={form.gstNumber || ''} onChange={text('gstNumber')} className="uppercase" />
        </Field>
      </Section>

      <Section title="Billing defaults" hint="New bills start with these. You can change them on each bill.">
        <div className="grid grid-cols-2 gap-3">
          <Field id="gst-rate" label="GST rate (%)">
            <Input id="gst-rate" type="number" min={0} max={100} step="any" inputMode="decimal" value={form.defaultGstRate ?? 18} onChange={num('defaultGstRate')} />
          </Field>
          <Field id="disc" label="Discount (%)">
            <Input id="disc" type="number" min={0} max={100} step="any" inputMode="decimal" value={form.defaultDiscountPercent ?? 0} onChange={num('defaultDiscountPercent')} />
          </Field>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="gst-on">GST on by default</Label>
          <Switch id="gst-on" checked={form.gstOnByDefault ?? true} onCheckedChange={(v) => change('gstOnByDefault', v)} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="disc-on">Discount on by default</Label>
          <Switch id="disc-on" checked={form.discountOnByDefault ?? false} onCheckedChange={(v) => change('discountOnByDefault', v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field id="prefix" label="Bill number prefix">
            <Input id="prefix" value={form.billNumberPrefix || ''} onChange={text('billNumberPrefix')} />
          </Field>
          <Field id="cur" label="Currency symbol">
            <Input id="cur" value={form.currencySymbol || ''} onChange={text('currencySymbol')} maxLength={4} />
          </Field>
        </div>
      </Section>

      <Section title="Stock defaults" hint="When an item counts as running low.">
        <Field id="low" label="Low-stock level">
          <Input id="low" type="number" min={0} step="any" inputMode="decimal" value={form.defaultLowStockThreshold ?? 5} onChange={num('defaultLowStockThreshold')} className="max-w-40" />
        </Field>
      </Section>

      <Section title="Appearance" hint="Dark mode is easier on the eyes at night.">
        <Tabs value={theme ?? 'system'} onValueChange={setTheme}>
          <TabsList>
            <TabsTrigger value="light">Light</TabsTrigger>
            <TabsTrigger value="dark">Dark</TabsTrigger>
            <TabsTrigger value="system">Auto</TabsTrigger>
          </TabsList>
        </Tabs>
      </Section>

      <Section title="Account" hint={user?.email ? `Signed in as ${user.email}.` : 'Signed in.'}>
        <div>
          <Button variant="outline" onClick={logout}>
            <LogOut aria-hidden /> Log out
          </Button>
        </div>
      </Section>

      {dirty && (
        <div className="fixed inset-x-0 bottom-16 z-20 flex items-center justify-between gap-3 border-t bg-card px-4 py-3 md:bottom-0 md:left-[72px] md:px-6 lg:left-60 lg:px-8">
          <p role={formError ? 'alert' : undefined} className={cn('text-sm font-semibold', formError && 'text-destructive')}>
            {formError || 'You have unsaved changes'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => settings && setForm(settings)} disabled={updating}>
              Discard
            </Button>
            <Button onClick={save} disabled={updating}>
              {updating && <Loader2 className="animate-spin" aria-hidden />} Save settings
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
