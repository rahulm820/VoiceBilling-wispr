import { Mic } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="grid size-8 place-items-center rounded-md bg-signal text-signal-foreground">
        <Mic className="size-[18px]" strokeWidth={2.4} aria-hidden />
      </span>
      <span className={cn('text-lg font-bold tracking-tight', onDark ? 'text-sidebar-foreground' : 'text-foreground')}>
        SmartLedger
      </span>
    </span>
  )
}
