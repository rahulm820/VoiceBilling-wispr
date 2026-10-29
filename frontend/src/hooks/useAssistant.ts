import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { getLedger } from '@/api/ledger'
import { getProducts, updatePriceSheet } from '@/api/products'
import { createStock, deleteStock, updateStock } from '@/api/stock'
import { getSettings, updateSettings } from '@/api/settings'
import { COMMAND_GROUPS, findProduct, normalizeUnit, parseCommand, type VoiceCommand } from '@/lib/voiceCommands'
import { inr, qty } from '@/lib/format'
import { cleanTranscript } from '@/lib/cleanTranscript'
import type { Product } from '@/types'

/** Runs a spoken or typed command against the app. Every change that can be undone offers an Undo. */
export function useAssistant() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { setTheme } = useTheme()

  const refreshStock = () => ['stock', 'products', 'insights'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }))
  const undo = (fn: () => Promise<unknown>, after: () => void = refreshStock) => ({
    label: 'Undo',
    onClick: async () => {
      await fn()
      after()
    },
  })

  const needProduct = async (spoken: string): Promise<Product | undefined> => {
    const { products } = await getProducts()
    const p = findProduct(products, spoken)
    if (!p) toast.error(`No item called "${spoken}"`, { description: 'Say "add new item 10 kg ' + spoken + ' to stock" to create it.' })
    return p
  }

  const createItem = async (rawName: string, amount: number, unit?: string, price?: number) => {
    const name = rawName.trim().replace(/^./, (c) => c.toUpperCase())
    const u = normalizeUnit(unit) || 'pcs'
    const res = await createStock({ name, quantity: amount, unit: u, costPrice: 0, defaultSellingPrice: price ?? 0 })
    refreshStock()
    const merged = !!res.message
    toast.success(merged ? res.message : `New item: ${name}, ${qty(amount)} ${u}`, {
      description: price ? `Selling at ${inr(price)}` : `No selling price yet. Say "set price of ${name.toLowerCase()} to 45".`,
      action: merged ? undefined : undo(() => deleteStock(res.product.id)),
    })
  }

  const run = async (cmd: VoiceCommand, heard: string) => {
    switch (cmd.kind) {
      case 'go':
        navigate(cmd.to)
        toast.success(`Opened ${cmd.label}`)
        return
      case 'newBill':
        navigate(cmd.manual ? '/ledger/manual' : '/ledger/voice', cmd.text ? { state: { text: cmd.text } } : undefined)
        toast.success(cmd.manual ? 'Manual entry opened' : cmd.text ? 'Reading your bill' : 'New bill ready. Tap the mic.')
        return
      case 'openBill': {
        if (!cmd.number) {
          if (cmd.print) window.print()
          else toast.info('Say the bill number, for example "open bill 12".')
          return
        }
        const res = await getLedger({})
        const entry = res.entries?.find((en) => en.entryNumber?.endsWith(cmd.number!) || en.entryNumber?.includes(cmd.number!))
        if (!entry) return void toast.error(`Bill ${cmd.number} not found`)
        navigate(`/ledger/${entry.id}`)
        if (cmd.print) setTimeout(() => window.print(), 700)
        else toast.success(`Opened bill ${cmd.number}`)
        return
      }
      case 'addStock': {
        // One action for old and new items: existing quantity goes up, a missing item is created.
        const { products } = await getProducts()
        const p = findProduct(products, cmd.item)
        if (!p) return createItem(cmd.item, cmd.amount, cmd.unit, cmd.price)
        const before = Number(p.stockQuantity)
        await updateStock(p.id, { stockQuantity: before + cmd.amount })
        if (cmd.price != null) {
          await updatePriceSheet([{ id: p.id, defaultSellingPrice: cmd.price, gstOverride: p.gstOverride ?? null }])
        }
        refreshStock()
        toast.success(`Added ${qty(cmd.amount)} ${p.unit} to ${p.name}`, {
          description: `Now ${qty(before + cmd.amount)} ${p.unit}`,
          action: undo(() => updateStock(p.id, { stockQuantity: before })),
        })
        return
      }
      case 'itemUpdate': {
        const p = await needProduct(cmd.item)
        if (!p) return
        const before: Record<string, unknown> = {
          stockQuantity: p.stockQuantity,
          costPrice: p.costPrice,
          unit: p.unit,
          name: p.name,
        }
        const reverse = Object.fromEntries(Object.keys(cmd.patch).map((k) => [k, before[k]]))
        await updateStock(p.id, cmd.patch)
        refreshStock()
        toast.success(`${p.name}: ${cmd.label}`, { action: undo(() => updateStock(p.id, reverse)) })
        return
      }
      case 'setPrice': {
        const p = await needProduct(cmd.item)
        if (!p) return
        const before = p.defaultSellingPrice
        const send = (price: number) => updatePriceSheet([{ id: p.id, defaultSellingPrice: price, gstOverride: p.gstOverride ?? null }])
        await send(cmd.price)
        refreshStock()
        toast.success(`${p.name} is now ${inr(cmd.price)} per ${p.unit}`, {
          description: cmd.price < p.costPrice ? 'Below cost price' : `Was ${inr(before)}`,
          action: undo(() => send(before)),
        })
        return
      }
      case 'priceShift': {
        const p = await needProduct(cmd.item)
        if (!p) return
        const before = p.defaultSellingPrice
        const delta = cmd.percent != null ? (before * cmd.percent) / 100 : cmd.amount ?? 0
        const next = Math.max(0, Math.round((before + cmd.dir * delta) * 100) / 100)
        const send = (price: number) => updatePriceSheet([{ id: p.id, defaultSellingPrice: price, gstOverride: p.gstOverride ?? null }])
        await send(next)
        refreshStock()
        toast.success(`${p.name} is now ${inr(next)} per ${p.unit}`, {
          description: next < p.costPrice ? 'Below cost price' : `Was ${inr(before)}`,
          action: undo(() => send(before)),
        })
        return
      }
      case 'itemGst': {
        const p = await needProduct(cmd.item)
        if (!p) return
        const before = p.gstOverride ?? null
        const send = (gst: number | null) => updatePriceSheet([{ id: p.id, defaultSellingPrice: p.defaultSellingPrice, gstOverride: gst }])
        await send(cmd.gst)
        refreshStock()
        toast.success(cmd.gst == null ? `${p.name} now uses the default GST` : `${p.name} GST is ${cmd.gst}%`, { action: undo(() => send(before)) })
        return
      }
      case 'deleteItem': {
        const p = await needProduct(cmd.item)
        if (!p) return
        toast.warning(`Delete ${p.name}?`, {
          description: 'It leaves stock and the price sheet. Bills already made are not changed.',
          duration: 10000,
          action: {
            label: 'Delete',
            onClick: async () => {
              try {
                await deleteStock(p.id)
                refreshStock()
                toast.success(`${p.name} deleted`)
              } catch (e: any) {
                toast.error(e.message)
              }
            },
          },
        })
        return
      }
      case 'setting': {
        const current = await getSettings()
        await updateSettings({ ...current, ...cmd.patch })
        qc.invalidateQueries({ queryKey: ['settings'] })
        qc.invalidateQueries({ queryKey: ['insights'] })
        toast.success(cmd.label, { action: undo(() => updateSettings(current), () => qc.invalidateQueries({ queryKey: ['settings'] })) })
        return
      }
      case 'theme':
        setTheme(cmd.mode)
        toast.success(cmd.mode === 'system' ? 'Theme follows your device' : `${cmd.mode === 'dark' ? 'Dark' : 'Light'} mode on`)
        return
      case 'help':
        toast.info('You can say or type', {
          description: COMMAND_GROUPS.map((g) => `${g.title}: ${g.phrases[0]}`).join('\n'),
          duration: 12000,
          className: 'whitespace-pre-line',
        })
        return
      default:
        toast.info(`Heard "${cleanTranscript(heard)}"`, { description: 'Not a command I know. Say or type "help" to see what works.' })
    }
  }

  /** Parse and run; failures surface as a toast instead of throwing. */
  const execute = async (heard: string) => {
    try {
      await run(parseCommand(heard), heard)
    } catch (e: any) {
      toast.error(e.message || 'That did not work')
    }
  }

  return { execute }
}
