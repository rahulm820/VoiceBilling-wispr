const money = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const whole = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })
const qtyFmt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 3 })

export const inr = (n: number | string | null | undefined, symbol = '₹') =>
  `${symbol}${money.format(Number(n) || 0)}`

export const inrWhole = (n: number | string | null | undefined, symbol = '₹') =>
  `${symbol}${whole.format(Number(n) || 0)}`

export const qty = (n: number | string | null | undefined) => qtyFmt.format(Number(n) || 0)

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
