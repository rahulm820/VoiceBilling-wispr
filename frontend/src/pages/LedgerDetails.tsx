import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Printer } from 'lucide-react'
import { getLedgerById } from '@/api/ledger'
import { useSettings } from '@/hooks/useSettings'
import { TypeBadge } from '@/pages/Ledger'
import { ErrorPanel } from '@/components/ErrorPanel'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { inr, qty } from '@/lib/format'

export const LedgerDetails: React.FC = () => {
  const { id } = useParams()
  const { settings } = useSettings()
  const sym = settings?.currencySymbol || '₹'
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ['ledger', id], queryFn: () => getLedgerById(id!) })
  const entry = data?.entry

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-4 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/ledger">
            <ArrowLeft aria-hidden /> Ledger
          </Link>
        </Button>
        {entry && (
          <Button onClick={() => window.print()}>
            <Printer aria-hidden /> Print
          </Button>
        )}
      </div>

      {isLoading && <Skeleton className="h-96 w-full" />}
      {isError && <ErrorPanel message={`Could not load this entry. ${(error as Error).message}`} onRetry={() => refetch()} />}

      {entry && (
        <article className="print-sheet rounded-lg border bg-card p-5 md:p-8">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
            <div>
              <h1 className="text-xl font-bold">{settings?.shopName || 'SmartLedger'}</h1>
              {settings?.shopAddress && <p className="text-sm text-muted-foreground">{settings.shopAddress}</p>}
              {settings?.shopPhone && <p className="text-sm text-muted-foreground">{settings.shopPhone}</p>}
              {settings?.gstNumber && <p className="text-sm text-muted-foreground">GSTIN {settings.gstNumber}</p>}
            </div>
            <div className="text-right text-sm">
              <TypeBadge type={entry.type} />
              <p className="mt-2 font-semibold">{entry.entryNumber || 'No entry number'}</p>
              <p className="text-muted-foreground">{new Date(entry.date).toLocaleString('en-IN')}</p>
            </div>
          </header>

          <section className="py-4 text-sm">
            <p className="text-muted-foreground">{entry.type === 'purchase' ? 'Supplier' : 'Billed to'}</p>
            <p className="text-base font-semibold">{entry.partyName}</p>
            {entry.partyPhone && <p>{entry.partyPhone}</p>}
          </section>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col">Item</TableHead>
                <TableHead scope="col" className="text-right">Qty</TableHead>
                <TableHead scope="col" className="text-right">Rate</TableHead>
                <TableHead scope="col" className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entry.items.map((it, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{it.name}</TableCell>
                  <TableCell className="text-right">
                    {qty(it.quantity)} {it.unit}
                  </TableCell>
                  <TableCell className="text-right">{inr(it.unitPrice, sym)}</TableCell>
                  <TableCell className="text-right font-semibold">{inr(it.total, sym)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <dl className="ml-auto mt-5 w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{inr(entry.subtotal, sym)}</dd>
            </div>
            {entry.gstApplied && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">GST ({entry.gstRate}%)</dt>
                <dd>{inr(entry.gstAmount, sym)}</dd>
              </div>
            )}
            {entry.discountPercent > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Discount ({entry.discountPercent}%)</dt>
                <dd>-{inr(entry.discountAmount, sym)}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t pt-3">
              <dt className="font-semibold">Grand total</dt>
              <dd className="text-2xl font-bold">{inr(entry.total, sym)}</dd>
            </div>
          </dl>
        </article>
      )}
    </div>
  )
}
