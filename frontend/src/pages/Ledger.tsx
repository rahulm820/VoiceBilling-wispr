import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, ChevronDown, Mic, PenLine, Search } from 'lucide-react'
import { getLedger } from '@/api/ledger'
import { useSettings } from '@/hooks/useSettings'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { ErrorPanel } from '@/components/ErrorPanel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { inr, shortDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export const TypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <Badge
    variant="secondary"
    className={cn(
      'rounded-sm border-0 font-semibold capitalize',
      type === 'sale' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning',
    )}
  >
    {type}
  </Badge>
)

export const Ledger: React.FC = () => {
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { settings } = useSettings()
  const sym = settings?.currencySymbol || '₹'
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['ledger', tab, search],
    queryFn: () => getLedger({ type: tab === 'all' ? undefined : tab, search: search || undefined }),
  })
  const entries = data?.entries || []

  return (
    <div>
      <PageHeader
        en="Ledger"
        hi="खाता"
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="signal">
                New entry <ChevronDown aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              <DropdownMenuItem onSelect={() => navigate('/ledger/voice')}>
                <Mic aria-hidden /> Add using voice
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/ledger/manual')}>
                <PenLine aria-hidden /> Add manually
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sale">Sales</TabsTrigger>
            <TabsTrigger value="purchase">Purchases</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by party name"
            aria-label="Search by party name"
            className="pl-9"
          />
        </div>
      </div>

      {isError && <ErrorPanel message={`Could not load the ledger. ${(error as Error).message}`} onRetry={() => refetch()} />}

      {!isError && (
        <Card className="gap-0 overflow-hidden py-0">
          {isLoading ? (
            <div className="space-y-px">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[60px] w-full rounded-none" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={search ? 'No entries match that name' : 'No entries yet'}
              hint={search ? 'Check the spelling or clear the search.' : 'Your sales and purchases will list here, newest first.'}
              action={
                !search && (
                  <Button variant="signal" onClick={() => navigate('/ledger/voice')}>
                    <Mic aria-hidden /> Add a sale by voice
                  </Button>
                )
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Party</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Entry no.</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.id} className="h-[60px] cursor-pointer" onClick={() => navigate(`/ledger/${e.id}`)}>
                    <TableCell>
                      <Link to={`/ledger/${e.id}`} className="font-semibold hover:underline" onClick={(ev) => ev.stopPropagation()}>
                        {e.partyName}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground md:hidden">
                        <TypeBadge type={e.type} /> {shortDate(e.date)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <TypeBadge type={e.type} />
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{e.entryNumber || '-'}</TableCell>
                    <TableCell className="hidden md:table-cell">{shortDate(e.date)}</TableCell>
                    <TableCell className="text-right text-base font-bold">{inr(e.total, sym)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}
    </div>
  )
}
