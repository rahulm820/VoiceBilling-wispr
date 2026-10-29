import { useEffect, useState } from 'react'
import { SquareTerminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAssistant } from '@/hooks/useAssistant'
import { COMMAND_GROUPS } from '@/lib/voiceCommands'
import { cn } from '@/lib/utils'

/** Type the same commands you can speak. Opens from the header or with Ctrl+K. */
export function CommandBar({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const { execute } = useAssistant()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const submit = async (phrase: string) => {
    if (!phrase.trim() || busy) return
    setBusy(true)
    setOpen(false)
    setText('')
    await execute(phrase)
    setBusy(false)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Type a command (Ctrl+K)"
        title="Type a command (Ctrl+K)"
        className={cn(className)}
      >
        <SquareTerminal aria-hidden />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] gap-3 overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Type a command</DialogTitle>
            <DialogDescription>The same words you can say. Press Enter to run. Tap an example to fill it in.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit(text)
            }}
          >
            <Input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Set price of sugar to 45"
              aria-label="Command"
              autoComplete="off"
            />
          </form>
          <div className="space-y-4">
            {COMMAND_GROUPS.map((g) => (
              <section key={g.title}>
                <h3 className="mb-1.5 text-sm font-semibold">{g.title}</h3>
                <ul className="flex flex-wrap gap-1.5">
                  {g.phrases.map((p) => (
                    <li key={p}>
                      <button
                        type="button"
                        onClick={() => setText(p)}
                        className="rounded-md border bg-secondary px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent"
                      >
                        {p}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
