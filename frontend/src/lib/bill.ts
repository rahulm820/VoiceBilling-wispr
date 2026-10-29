export interface BillTotals {
  subtotal: number
  gstAmount: number
  discountAmount: number
  total: number
}

export const computeTotals = (subtotal: number, gstApplied: boolean, gstRate: number, discountPercent: number): BillTotals => {
  const gstAmount = gstApplied ? (subtotal * gstRate) / 100 : 0
  const discountAmount = discountPercent > 0 ? (subtotal * discountPercent) / 100 : 0
  return { subtotal, gstAmount, discountAmount, total: subtotal + gstAmount - discountAmount }
}
