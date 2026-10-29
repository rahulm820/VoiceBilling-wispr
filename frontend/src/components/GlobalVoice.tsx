import { useRef, useState } from 'react'
import { AudioLines } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAssistant } from '@/hooks/useAssistant'
import { cn } from '@/lib/utils'

/** Hands-free assistant: speak a command and it navigates, prints, restocks, reprices or changes settings. */
export function GlobalVoice({ className }: { className?: string }) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const { execute } = useAssistant()

  const start = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Voice commands are not supported in this browser', { description: 'Try Chrome or Edge, or type the command instead.' })
      return
    }
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    const rec = new SpeechRecognition()
    recognitionRef.current = rec
    rec.lang = 'en-IN'
    rec.onresult = (e: any) => {
      setListening(false)
      execute(e.results[0][0].transcript)
    }
    rec.onerror = (e: any) => {
      setListening(false)
      if (e.error === 'not-allowed') toast.error('Microphone is blocked. Allow it in your browser settings.')
    }
    rec.onend = () => setListening(false)
    rec.start()
    setListening(true)
    toast.dismiss()
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={start}
      aria-pressed={listening}
      aria-label={listening ? 'Listening for a command. Tap to stop' : 'Voice command'}
      title="Voice command"
      className={cn(listening && 'animate-pulse bg-destructive/20 text-destructive', className)}
    >
      <AudioLines aria-hidden />
    </Button>
  )
}
