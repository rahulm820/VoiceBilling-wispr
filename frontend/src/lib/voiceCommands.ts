import type { Product } from '@/types'

export type VoiceCommand =
  | { kind: 'go'; to: string; label: string }
  | { kind: 'newBill'; text?: string; manual?: boolean }
  | { kind: 'openBill'; number?: string; print: boolean }
  | { kind: 'addStock'; item: string; amount: number; unit?: string; price?: number }
  | { kind: 'setPrice'; item: string; price: number }
  | { kind: 'setting'; patch: Record<string, string | number | boolean>; label: string }
  | { kind: 'theme'; mode: 'dark' | 'light' | 'system' }
  | { kind: 'itemUpdate'; item: string; patch: { stockQuantity?: number; costPrice?: number; unit?: string; name?: string }; label: string }
  | { kind: 'itemGst'; item: string; gst: number | null }
  | { kind: 'priceShift'; item: string; dir: 1 | -1; amount?: number; percent?: number }
  | { kind: 'deleteItem'; item: string }
  | { kind: 'help' }
  | { kind: 'unknown' }

const NUM = '(\\d+(?:\\.\\d+)?)'
const UNIT = '(?:kg|kgs|kilos?|kilograms?|g|grams?|litres?|liters?|l|ml|packets?|pcs|pieces?|units?|dozen|bottles?|bags?|boxes|sachets?)?'

const PAGES: Array<[RegExp, string, string]> = [
  [/\b(insights?|dashboard|home|today)\b/, '/insights', 'Insights'],
  [/\b(price\s*sheet|prices?|rate\s*list)\b/, '/price-sheet', 'Price Sheet'],
  [/\b(stock|inventory|items)\b/, '/stock', 'Stock'],
  [/\b(settings?|setup)\b/, '/settings', 'Settings'],
  [/\b(ledger|khata|bills|entries|sales|purchases)\b/, '/ledger', 'Ledger'],
]

const UNIT_MAP: Record<string, string> = {
  kg: 'kg', kgs: 'kg', kilo: 'kg', kilos: 'kg', kilogram: 'kg', kilograms: 'kg',
  g: 'g', gm: 'g', gram: 'g', grams: 'g',
  l: 'L', litre: 'L', litres: 'L', liter: 'L', liters: 'L', ml: 'ml',
  pc: 'pcs', pcs: 'pcs', piece: 'pcs', pieces: 'pcs', unit: 'pcs', units: 'pcs',
  dozen: 'dozen', packet: 'packets', packets: 'packets', bottle: 'bottles', bottles: 'bottles',
  bag: 'bags', bags: 'bags', box: 'boxes', boxes: 'boxes', sachet: 'sachets', sachets: 'sachets',
}
export const normalizeUnit = (u?: string) => (u ? UNIT_MAP[u.toLowerCase()] : undefined)

const clean = (s: string) => s.trim().replace(/[.,!?]+$/, '').trim()

export function parseCommand(raw: string): VoiceCommand {
  const text = clean(raw.toLowerCase().replace(/\b(please|can you|could you|hey|ok|okay)\b/g, ' ').replace(/\s+/g, ' '))
  let m: RegExpMatchArray | null

  if (/\b(help|what can i say|commands)\b/.test(text)) return { kind: 'help' }

  if ((m = text.match(/\b(dark|light)\s+(?:mode|theme)\b/))) return { kind: 'theme', mode: m[1] as 'dark' | 'light' }
  if (/\b(auto|automatic|system)\s+(?:mode|theme)\b/.test(text)) return { kind: 'theme', mode: 'system' }

  // one stock item's fields: stock count, cost price, unit, name
  if (
    (m = text.match(new RegExp(`\\b(?:set|update|change|make)\\s+(?:the\\s+)?(?:stock|quantity)\\s+(?:of|for)\\s+(.+?)\\s+(?:to|as|at)\\s+${NUM}`))) ||
    (m = text.match(new RegExp(`\\b(?:set|update|change)\\s+(.+?)\\s+(?:stock|quantity)\\s+(?:to|as|at)\\s+${NUM}`)))
  )
    return { kind: 'itemUpdate', item: clean(m[1]), patch: { stockQuantity: Number(m[2]) }, label: `stock set to ${m[2]}` }
  if (
    (m = text.match(new RegExp(`\\b(?:set|update|change|make)\\s+(?:the\\s+)?(?:cost|purchase)(?:\\s+price)?\\s+(?:of|for)\\s+(.+?)\\s+(?:to|as|at)\\s+(?:rs\\.?\\s*|₹\\s*)?${NUM}`))) ||
    (m = text.match(new RegExp(`\\b(?:set|update|change)\\s+(.+?)\\s+(?:cost|purchase)(?:\\s+price)?\\s+(?:to|as|at)\\s+(?:rs\\.?\\s*|₹\\s*)?${NUM}`)))
  )
    return { kind: 'itemUpdate', item: clean(m[1]), patch: { costPrice: Number(m[2]) }, label: `cost price set to ${m[2]}` }
  if ((m = text.match(/\b(?:set|update|change)\s+(?:the\s+)?unit\s+(?:of|for)\s+(.+?)\s+(?:to|as)\s+([a-z]+)$/))) {
    const unit = normalizeUnit(m[2])
    if (unit) return { kind: 'itemUpdate', item: clean(m[1]), patch: { unit }, label: `unit set to ${unit}` }
  }
  if ((m = raw.match(/\brename\s+(?:item\s+)?(.+?)\s+(?:to|as)\s+(.+)$/i)))
    return { kind: 'itemUpdate', item: clean(m[1].toLowerCase()), patch: { name: clean(m[2]) }, label: `renamed to ${clean(m[2])}` }

  // GST override of one item
  if ((m = text.match(new RegExp(`\\b(?:set|update|change)\\s+(?:the\\s+)?gst\\s+(?:of|for|on)\\s+(.+?)\\s+(?:to|as|at)\\s+${NUM}`))))
    return { kind: 'itemGst', item: clean(m[1]), gst: Number(m[2]) }
  if ((m = text.match(/\b(?:remove|clear|reset)\s+(?:the\s+)?gst(?:\s+override)?\s+(?:of|for|on)\s+(.+)$/))) return { kind: 'itemGst', item: clean(m[1]), gst: null }

  // nudge a price: "increase price of sugar by 5", "reduce price of oil by 10 percent"
  if ((m = text.match(new RegExp(`\\b(increase|raise|hike|reduce|decrease|lower|cut)\\s+(?:the\\s+)?(?:selling\\s+)?(?:price|rate)\\s+(?:of|for)\\s+(.+?)\\s+by\\s+(?:rs\\.?\\s*|₹\\s*)?${NUM}\\s*(percent|%)?`)))) {
    const up = /^(increase|raise|hike)$/.test(m[1])
    return { kind: 'priceShift', item: clean(m[2]), dir: up ? 1 : -1, ...(m[4] ? { percent: Number(m[3]) } : { amount: Number(m[3]) }) }
  }

  // delete an item (asks to confirm)
  if ((m = text.match(/\b(?:delete|remove)\s+(?:item|product)\s+(.+)$/)) || (m = text.match(/\b(?:delete|remove)\s+(.+?)\s+from\s+(?:the\s+)?stock$/)))
    return { kind: 'deleteItem', item: clean(m[1]) }

  // shop text settings (original casing kept)
  if ((m = raw.match(/\b(?:set|change|update)\s+(?:the\s+)?owner(?:'s)?(?:\s+name)?\s+(?:to|as)\s+(.+)/i)))
    return { kind: 'setting', patch: { ownerName: clean(m[1]) }, label: `Owner name set to ${clean(m[1])}` }
  if ((m = raw.match(/\b(?:set|change|update)\s+(?:the\s+)?(?:shop\s+)?address\s+(?:to|as)\s+(.+)/i)))
    return { kind: 'setting', patch: { shopAddress: clean(m[1]) }, label: 'Shop address updated' }
  if ((m = raw.match(/\b(?:set|change|update)\s+(?:the\s+)?gst\s*(?:number|no\.?|in)\s+(?:to|as)\s+([a-z0-9 ]+)/i)))
    return { kind: 'setting', patch: { gstNumber: m[1].replace(/\s+/g, '').toUpperCase() }, label: 'GST number updated' }
  if ((m = raw.match(/\b(?:set|change|update)\s+(?:the\s+)?bill(?:\s+number)?\s+prefix\s+(?:to|as)\s+(\S+)/i)))
    return { kind: 'setting', patch: { billNumberPrefix: m[1] }, label: `Bill prefix set to ${m[1]}` }
  if ((m = raw.match(/\b(?:set|change|update)\s+(?:the\s+)?currency(?:\s+symbol)?\s+(?:to|as)\s+(\S+)/i)))
    return { kind: 'setting', patch: { currencySymbol: m[1] }, label: `Currency set to ${m[1]}` }

  // bills: print / open by number
  if ((m = text.match(/\bprint\b.*?\bbill(?:\s+number)?\s*(\d+)/))) return { kind: 'openBill', number: m[1], print: true }
  if (/\bprint\b.*\b(this|the)?\s*(bill|invoice|receipt)\b/.test(text) || text === 'print') return { kind: 'openBill', print: true }
  if ((m = text.match(/\b(?:open|show|view|find|get)\b.*?\bbill(?:\s+number)?\s*(\d+)/))) return { kind: 'openBill', number: m[1], print: false }

  // create a bill, optionally with items spoken in the same breath
  if ((m = text.match(/\b(?:new|create|make|start|generate|banao|bana do)\b.*?\b(?:bill|sale|invoice)\b\s*(?:for|of|with|:)\s+(.+)/))) return { kind: 'newBill', text: m[1] }
  if (/\b(?:new|create|make|start|generate)\b.*\b(?:purchase|manual)\b/.test(text)) return { kind: 'newBill', manual: true }
  if (/\b(?:new|create|make|start|generate|banao)\b.*\b(?:bill|sale|invoice)\b/.test(text) || /\bnaya bill\b/.test(text)) return { kind: 'newBill' }

  // price sheet: "set price of sugar to 45"
  if (
    (m = text.match(new RegExp(`\\b(?:set|update|change|make|edit)\\s+(?:the\\s+)?(?:selling\\s+)?(?:price|rate)\\s+(?:of|for)\\s+(.+?)\\s+(?:to|as|at)\\s+(?:rs\\.?\\s*|₹\\s*)?${NUM}`))) ||
    (m = text.match(new RegExp(`\\b(?:set|update|change|make|edit)\\s+(.+?)\\s+(?:selling\\s+)?(?:price|rate)\\s+(?:to|as|at)\\s+(?:rs\\.?\\s*|₹\\s*)?${NUM}`)))
  ) {
    return { kind: 'setPrice', item: clean(m[1]), price: Number(m[2]) }
  }

  // Adding stock is one action: "add 30 kg sugar", "add new item sugar 30 kg", "restock oil by 5",
  // "30 kg sugar to stock". Old item: its quantity goes up. New item: it is created.
  if ((m = text.match(/^(?:add|restock|refill|increase|put|create|make|new|stock)\b\s*(.*)$/)) || (m = text.match(/^(.+?)\s+(?:to|in|into)\s+(?:the\s+)?stock$/))) {
    const body0 = (m[1] ?? '')
      .replace(/\s+(?:to|in|into)\s+(?:the\s+)?stock$/, '')
      .replace(/^(?:(?:a|the)\s+)?(?:new\s+)?(?:(?:item|product)\s+)?(?:(?:of|stock)\s+)*/, '')
      .replace(/^by\s+/, '')
    let price: number | undefined
    let body = clean(body0)
    const pm = body.match(new RegExp(`\\s+(?:at|for|price|rate)\\s*(?:rs\\.?\\s*|₹\\s*)?${NUM}$`))
    if (pm) {
      price = Number(pm[1])
      body = body.slice(0, pm.index)
    }
    let r: RegExpMatchArray | null
    if ((r = body.match(new RegExp(`^${NUM}\\s*(${UNIT})\\s*(?:of\\s+)?(.+)$`)))) return { kind: 'addStock', item: clean(r[3]), amount: Number(r[1]), unit: normalizeUnit(r[2]), price }
    if ((r = body.match(new RegExp(`^(.+?)\\s+(?:by\\s+)?${NUM}\\s*(${UNIT})$`)))) return { kind: 'addStock', item: clean(r[1]), amount: Number(r[2]), unit: normalizeUnit(r[3]), price }
  }

  // settings
  if ((m = text.match(new RegExp(`\\b(?:set|change|update)\\s+(?:the\\s+)?(?:default\\s+)?gst(?:\\s+rate)?\\s+(?:to|as|at)?\\s*${NUM}`))))
    return { kind: 'setting', patch: { defaultGstRate: Number(m[1]) }, label: `GST rate set to ${m[1]}%` }
  if ((m = text.match(/\b(?:turn|switch)\s+(on|off)\s+(?:default\s+)?gst\b/)) || (m = text.match(/\bgst\s+(?:by default\s+)?(on|off)\b/)))
    return { kind: 'setting', patch: { gstOnByDefault: m[1] === 'on' }, label: `GST is ${m[1]} by default` }
  if ((m = text.match(new RegExp(`\\b(?:set|change|update)\\s+(?:the\\s+)?(?:default\\s+)?discount(?:\\s+percent(?:age)?)?\\s+(?:to|as|at)?\\s*${NUM}`))))
    return { kind: 'setting', patch: { defaultDiscountPercent: Number(m[1]) }, label: `Discount set to ${m[1]}%` }
  if ((m = text.match(/\b(?:turn|switch)\s+(on|off)\s+(?:default\s+)?discount\b/)) || (m = text.match(/\bdiscount\s+(?:by default\s+)?(on|off)\b/)))
    return { kind: 'setting', patch: { discountOnByDefault: m[1] === 'on' }, label: `Discount is ${m[1]} by default` }
  if ((m = text.match(new RegExp(`\\blow\\s*stock\\s+(?:level|limit|threshold)\\s+(?:to|as|at)?\\s*${NUM}`))))
    return { kind: 'setting', patch: { defaultLowStockThreshold: Number(m[1]) }, label: `Low-stock level set to ${m[1]}` }
  if ((m = raw.match(/\b(?:set|change|update)\s+(?:the\s+)?shop\s+name\s+(?:to|as)\s+(.+)/i)))
    return { kind: 'setting', patch: { shopName: clean(m[1]) }, label: `Shop name set to ${clean(m[1])}` }
  if ((m = raw.match(/\b(?:set|change|update)\s+(?:the\s+)?(?:shop\s+)?(?:phone|mobile)(?:\s+number)?\s+(?:to|as)\s+([\d\s+-]+)/i)))
    return { kind: 'setting', patch: { shopPhone: m[1].replace(/\s+/g, '') }, label: `Shop phone updated` }

  // navigation
  if (/\b(open|go to|goto|show|take me to|navigate|kholo|dikhao|switch to)\b/.test(text) || text.split(' ').length <= 3) {
    for (const [re, to, label] of PAGES) if (re.test(text)) return { kind: 'go', to, label }
  }

  return { kind: 'unknown' }
}

/** Best product for a spoken name: exact, then substring either way, then shared words. */
export function findProduct(products: Product[], spoken: string): Product | undefined {
  const q = spoken.toLowerCase().replace(/\b(the|of|some)\b/g, '').trim()
  if (!q) return undefined
  let best: { p: Product; score: number } | undefined
  for (const p of products) {
    const n = p.name.toLowerCase()
    let score = 0
    if (n === q) score = 4
    else if (n.includes(q) || q.includes(n)) score = 3
    else {
      const shared = q.split(/\s+/).filter((w) => w.length > 2 && n.includes(w)).length
      score = shared > 0 ? 1 + shared / 10 : 0
    }
    if (score > 0 && (!best || score > best.score)) best = { p, score }
  }
  return best?.p
}

/** Everything the assistant understands, by area. Spoken or typed, the phrases are identical. */
export const COMMAND_GROUPS: Array<{ title: string; phrases: string[] }> = [
  {
    title: 'Bills',
    phrases: ['New bill', 'New bill for 2 kg sugar and 1 litre oil', 'New purchase', 'Open bill 12', 'Print bill 12', 'Print this bill'],
  },
  {
    title: 'Stock',
    phrases: [
      'Add 30 kg sugar',
      'Add sugar 30 kg at 45',
      'Restock oil by 5',
      'Set stock of sugar to 50',
      'Set cost price of sugar to 40',
      'Set unit of sugar to kg',
      'Rename sugar to cheeni',
      'Delete item sugar',
    ],
  },
  {
    title: 'Price sheet',
    phrases: ['Set price of sugar to 45', 'Increase price of sugar by 5', 'Reduce price of oil by 10 percent', 'Set GST of sugar to 5', 'Remove GST of sugar'],
  },
  {
    title: 'Settings',
    phrases: [
      'Set shop name to Sharma Store',
      'Set owner name to Ravi Sharma',
      'Set shop phone to 9876543210',
      'Set shop address to 12 Main Road',
      'Set GST number to 22AAAAA0000A1Z5',
      'Set GST to 5',
      'Turn off GST',
      'Set discount to 10',
      'Turn on discount',
      'Set bill prefix to INV-',
      'Set currency to ₹',
      'Set low stock level to 3',
    ],
  },
  { title: 'Look and feel', phrases: ['Dark mode', 'Light mode', 'Auto mode'] },
  { title: 'Go to', phrases: ['Open insights', 'Open ledger', 'Open stock', 'Open price sheet', 'Open settings'] },
]

export const HELP_LINES = COMMAND_GROUPS.map((g) => `${g.title}: ${g.phrases.slice(0, 2).join(' / ')}`)
