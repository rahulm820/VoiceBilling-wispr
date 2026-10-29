import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Mic, PackagePlus, PenLine, TriangleAlert } from 'lucide-react'
import { getDailyInsights, getTrend } from '@/api/insights'
import { useSettings } from '@/hooks/useSettings'
import type { DailyInsights, TrendDay } from '@/types'
import { PageHeader } from '@/components/PageHeader'
import { ErrorPanel } from '@/components/ErrorPanel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { dayLabel, inr, inrWhole } from '@/lib/format'
import { cn } from '@/lib/utils'

const today = () => new Date().toISOString().slice(0, 10)

function Change({ value }: { value?: number | null }) {
  if (value == null) return <span className="text-sm text-muted-foreground">No earlier data to compare</span>
  const up = value >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm font-semibold', up ? 'text-success' : 'text-destructive')}>
      <Icon className="size-4" aria-hidden />
      {Math.abs(value).toFixed(1)}% {up ? 'up' : 'down'} from yesterday
    </span>
  )
}

function Cell({ label, hint, value, tone }: { label: string; hint?: string; value: string; tone?: 'good' | 'bad' }) {
  return (
    <div className="px-4 py-3.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={cn('mt-0.5 text-xl font-bold md:text-2xl', tone === 'good' && 'text-success', tone === 'bad' && 'text-destructive')}>
        {value}
      </dd>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export const Insights: React.FC = () => {
  const [days, setDays] = useState('7')
  const [date, setDate] = useState(today())
  const navigate = useNavigate()
  const { settings } = useSettings()
  const sym = settings?.currencySymbol || '₹'

  const dailyQ = useQuery<DailyInsights>({
    queryKey: ['insights', 'daily', date],
    queryFn: () => getDailyInsights(date === today() ? undefined : date),
  })
  const trendQ = useQuery<{ days: TrendDay[] }>({
    queryKey: ['insights', 'trend', days],
    queryFn: () => getTrend(Number(days)),
  })
  const d = dailyQ.data
  const low = d?.lowStockItems ?? []
  const profit = d?.estimatedGrossProfit ?? 0
  const isToday = date === today()

  return (
    <div>
      <PageHeader
        en="Insights"
        hi="आज का हाल"
        actions={
          <>
            <Input
              type="date"
              value={date}
              max={today()}
              onChange={(e) => setDate(e.target.value || today())}
              className="w-auto"
              aria-label="Day to show"
            />
            <Button variant="outline" onClick={() => navigate('/ledger/manual')} className="hidden sm:inline-flex">
              <PenLine aria-hidden /> New sale manually
            </Button>
            <Button variant="outline" onClick={() => navigate('/stock')} className="hidden sm:inline-flex">
              <PackagePlus aria-hidden /> Add stock
            </Button>
            <Button variant="signal" onClick={() => navigate('/ledger/voice')} className="hidden md:inline-flex">
              <Mic aria-hidden /> New sale by voice
            </Button>
          </>
        }
      />

      {dailyQ.isError && (
        <div className="mb-4">
          <ErrorPanel message={`Could not load the day's numbers. ${(dailyQ.error as Error).message}`} onRetry={() => dailyQ.refetch()} />
        </div>
      )}

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b px-4 py-4 md:px-5">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{isToday ? 'Sales today' : `Sales on ${dayLabel(date)}`}</p>
            {dailyQ.isLoading ? (
              <Skeleton className="mt-1 h-10 w-44" />
            ) : (
              <p className="text-4xl font-bold tracking-tight md:text-5xl">{inr(d?.salesToday, sym)}</p>
            )}
          </div>
          {!dailyQ.isLoading && <Change value={d?.salesChangePercent} />}
        </div>
        <dl className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0 [&>div:nth-child(odd)]:border-l-0">
          {dailyQ.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-4 py-3.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="mt-2 h-7 w-24" />
              </div>
            ))
          ) : (
            <>
              <Cell label="Bills" value={String(d?.salesCount ?? 0)} />
              <Cell label="Average bill" value={inrWhole(d?.averageSaleValue, sym)} />
              <Cell label="Purchases" value={inrWhole(d?.purchasesToday, sym)} />
              <Cell label="Profit (estimated)" value={inrWhole(profit, sym)} tone={profit > 0 ? 'good' : profit < 0 ? 'bad' : undefined} />
            </>
          )}
        </dl>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Trend</CardTitle>
            <Tabs value={days} onValueChange={setDays}>
              <TabsList>
                <TabsTrigger value="7">7 days</TabsTrigger>
                <TabsTrigger value="30">30 days</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {[
                ['Sales', 'var(--chart-sales)'],
                ['Purchases', 'var(--chart-purchases)'],
                ['Profit', 'var(--chart-profit)'],
              ].map(([n, c]) => (
                <span key={n} className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-4 rounded" style={{ background: c }} aria-hidden /> {n}
                </span>
              ))}
            </div>
            <div className="h-64 w-full">
              {trendQ.isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : trendQ.isError ? (
                <ErrorPanel message="Could not load the trend." onRetry={() => trendQ.refetch()} />
              ) : (trendQ.data?.days ?? []).length === 0 ? (
                <div className="grid h-full place-items-center text-sm text-muted-foreground">No bills in this period yet.</div>
              ) : (
                <ResponsiveContainer>
                  <AreaChart data={trendQ.data?.days} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={dayLabel} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} minTickGap={24} />
                    <YAxis tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} width={52} tickFormatter={(v) => inrWhole(v, '')} />
                    <Tooltip
                      labelFormatter={(l) => dayLabel(String(l))}
                      formatter={(v, name) => [inr(Number(v), sym), String(name)]}
                      contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--popover-foreground)' }}
                    />
                    <Area type="monotone" dataKey="sales" name="Sales" stroke="var(--chart-sales)" fill="var(--chart-sales)" fillOpacity={0.1} strokeWidth={2} />
                    <Area type="monotone" dataKey="purchases" name="Purchases" stroke="var(--chart-purchases)" fill="none" strokeWidth={2} strokeDasharray="5 4" />
                    <Area type="monotone" dataKey="profit" name="Profit" stroke="var(--chart-profit)" fill="none" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              Low stock <span lang="hi" className="text-sm font-normal text-muted-foreground">कम माल</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {dailyQ.isLoading ? (
              <div className="space-y-3 p-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : low.length === 0 ? (
              <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-success" aria-hidden /> Everything is above its low-stock level.
              </div>
            ) : (
              <ul className="divide-y">
                {low.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <TriangleAlert className="size-4 shrink-0 text-destructive" aria-hidden />
                    <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
                    <span className="text-sm font-semibold text-destructive">
                      {item.stockQuantity} {item.unit} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {low.length > 0 && (
              <div className="border-t p-3">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/stock">Restock in Stock</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!dailyQ.isLoading && (d?.salesCount ?? 0) === 0 && !dailyQ.isError && (
        <Card className="mt-4">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {isToday ? 'No bills yet today. Say your first one.' : 'No bills on this day.'}
            </p>
            <Button variant="signal" onClick={() => navigate('/ledger/voice')}>
              <Mic aria-hidden /> Start a sale by voice
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
