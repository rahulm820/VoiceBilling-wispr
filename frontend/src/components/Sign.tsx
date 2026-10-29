import { cn } from '@/lib/utils'

/** Station-sign pair: English first, Hindi beneath or beside. */
export function Sign({
  en,
  hi,
  className,
  hiClassName,
  inline = false,
}: {
  en: string
  hi: string
  className?: string
  hiClassName?: string
  inline?: boolean
}) {
  return (
    <span className={cn(inline ? 'inline-flex items-baseline gap-2' : 'flex flex-col leading-tight', className)}>
      <span>{en}</span>
      <span lang="hi" className={cn('text-[0.8em] font-normal opacity-75', hiClassName)}>
        {hi}
      </span>
    </span>
  )
}
