import type { ReactNode } from 'react'
import { Sign } from '@/components/Sign'

export function PageHeader({ en, hi, actions }: { en: string; hi: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <h1 className="text-2xl font-bold tracking-tight">
        <Sign en={en} hi={hi} inline hiClassName="text-base" />
      </h1>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
