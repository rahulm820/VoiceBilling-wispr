export interface User {
  id: string
  email: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Settings {
  ownerName?: string
  shopName?: string
  shopPhone?: string
  shopAddress?: string
  gstNumber?: string
  defaultGstRate: number
  gstOnByDefault: boolean
  defaultDiscountPercent: number
  discountOnByDefault: boolean
  billNumberPrefix: string
  nextBillNumber: number
  defaultLowStockThreshold: number
  currencySymbol: string
}

export interface Product {
  id: string
  name: string
  unit: string
  stockQuantity: number
  costPrice: number
  defaultSellingPrice: number
  gstOverride?: number
  lowStockThreshold?: number
  lowStock?: boolean
  createdAt: string
  updatedAt: string
}

export interface LedgerItem {
  name: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
  costPriceSnapshot?: number
}

export interface LedgerEntry {
  id: string
  type: string
  partyName: string
  partyPhone?: string
  entryNumber?: string
  date: string
  items: LedgerItem[]
  subtotal: number
  gstApplied: boolean
  gstRate: number
  gstAmount: number
  discountPercent: number
  discountAmount: number
  total: number
  note?: string
  createdAt: string
  warnings?: string[]
}

export interface LowStockItem {
  id: string
  name: string
  stockQuantity: number
  unit: string
}

export interface DailyInsights {
  salesToday?: number
  salesChangePercent?: number | null
  salesCount?: number
  averageSaleValue?: number
  purchasesToday?: number
  estimatedGrossProfit?: number
  lowStockItems?: LowStockItem[]
}

export interface TrendDay {
  date: string
  sales: number
  purchases: number
  profit: number
}
