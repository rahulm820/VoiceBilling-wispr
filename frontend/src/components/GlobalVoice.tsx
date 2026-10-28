import React, { useRef, useState } from 'react'
import { transcribeText } from '../services/wispr'
import { useNavigate } from 'react-router-dom'
import { getLedger } from '../api/ledger'

export const GlobalVoice: React.FC = () => {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const navigate = useNavigate()

  const start = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition not supported')
      return
    }
    const rec = new SpeechRecognition()
    recognitionRef.current = rec
    rec.lang = 'en-IN'
    rec.onresult = async (e: any) => {
      const text = e.results[0][0].transcript.toLowerCase()
      setListening(false)
      const billMatch = text.match(/bill(?: number)?\s*(\d+)/)
      if (billMatch) {
        const num = billMatch[1]
        try {
          const res = await getLedger({})
          const entry = res.entries?.find((en: any) => en.entryNumber?.includes(num))
          if (entry) navigate(`/ledger/${entry.id}`)
          else alert('Bill not found')
        } catch {}
        return
      }
      if (text.includes('print')) {
        const billMatch2 = text.match(/bill(?: number)?\s*(\d+)/)
        if (billMatch2) {
          const num = billMatch2[1]
          try {
            const res = await getLedger({})
            const entry = res.entries?.find((en: any) => en.entryNumber?.includes(num))
            if (entry) { navigate(`/ledger/${entry.id}`); setTimeout(() => window.print(), 500) }
          } catch {}
        }
        return
      }
      try {
        await transcribeText(e.results[0][0].transcript)
      } catch {}
    }
    rec.onend = () => setListening(false)
    rec.start()
    setListening(true)
  }

  return (
    <button onClick={start} style={{ position: 'fixed', bottom: 20, right: 20, width: 60, height: 60, borderRadius: '50%', background: listening ? 'var(--color-danger)' : 'var(--color-primary)', color: '#fff', border: 'none', fontSize: 24 }}>
      🎤
    </button>
  )
}
