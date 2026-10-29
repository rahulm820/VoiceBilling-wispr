import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Keyboard, Loader2, Mic, Plus, RotateCcw, Square, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { transcribeLedger, transcribeText } from '@/services/wispr'
import { createLedger } from '@/api/ledger'
import { getProducts } from '@/api/products'
import { useSettings } from '@/hooks/useSettings'
import type { Product } from '@/types'
import { computeTotals } from '@/lib/bill'
import { inr } from '@/lib/format'
import { cleanTranscript } from '@/lib/cleanTranscript'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/PageHeader'
import { ErrorPanel } from '@/components/ErrorPanel'
import { BillSaveBar, BillSummary } from '@/components/BillSummary'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type Stage = 'idle' | 'listening' | 'transcribing' | 'review'

interface Row {
  id: number
  name: string
  quantity: number | string
  unit: string
  price: number | string
  priceFromSheet: boolean
  inStock: boolean
}

const MAX_SECONDS = 300
const BARS = 11
let rowSeq = 1

const fmtClock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export const VoiceLedger: React.FC = () => {
  const [stage, setStage] = useState<Stage>('idle')
  const [error, setError] = useState('')
  const [transcript, setTranscript] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [typing, setTyping] = useState(false)
  const [text, setText] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [partyName, setPartyName] = useState('')
  const [partyPhone, setPartyPhone] = useState('')
  const [gstApplied, setGstApplied] = useState(true)
  const [discountPercent, setDiscountPercent] = useState(0)

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const clockRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const barRefs = useRef<(HTMLSpanElement | null)[]>([])
  const seeded = useRef(false)
  const recogRef = useRef<any>(null)
  const liveRef = useRef('')
  const [live, setLive] = useState('')

  const { settings } = useSettings()
  const sym = settings?.currencySymbol || '₹'
  const navigate = useNavigate()
  const location = useLocation()
  const qc = useQueryClient()
  const { data: prodData } = useQuery({ queryKey: ['products'], queryFn: () => getProducts() })
  const productsRef = useRef<Product[]>([])
  productsRef.current = prodData?.products || []

  useEffect(() => {
    if (settings && !seeded.current) {
      seeded.current = true
      setGstApplied(settings.gstOnByDefault)
      setDiscountPercent(settings.discountOnByDefault ? settings.defaultDiscountPercent || 0 : 0)
    }
  }, [settings])

  // "new bill for 2 kg sugar" from the voice assistant arrives as router state
  const handedOver = useRef(false)
  useEffect(() => {
    const spoken = (location.state as { text?: string } | null)?.text
    if (spoken && prodData && !handedOver.current) {
      handedOver.current = true
      setText(spoken)
      parseText(spoken)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prodData, location.state])

  const stopMeters = useCallback(() => {
    if (clockRef.current) window.clearInterval(clockRef.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    clockRef.current = null
    rafRef.current = null
    ctxRef.current?.close().catch(() => {})
    ctxRef.current = null
    barRefs.current.forEach((b) => b && (b.style.transform = 'scaleY(0.12)'))
  }, [])

  useEffect(
    () => () => {
      stopMeters()
      if (mediaRef.current && mediaRef.current.state === 'recording') {
        mediaRef.current.onstop = null
        mediaRef.current.stop()
        mediaRef.current.stream.getTracks().forEach((t) => t.stop())
      }
    },
    [stopMeters],
  )

  const toRows = (items: Array<{ name: string; quantity: number; unit: string; price: number }>): Row[] =>
    items.map((it) => {
      const p = productsRef.current.find((pr) => pr.name.toLowerCase() === it.name.toLowerCase())
      return {
        id: rowSeq++,
        name: it.name,
        quantity: it.quantity,
        unit: it.unit || p?.unit || 'pcs',
        price: p?.defaultSellingPrice || it.price || '',
        priceFromSheet: !!p && !!p.defaultSellingPrice,
        inStock: !!p,
      }
    })

  const finish = (res: { transcript: string; items: any[] }, fallback = '') => {
    setTranscript(cleanTranscript(res.transcript || fallback))
    setRows(toRows(res.items || []))
    setStage('review')
  }

  const fail = (msg: string) => {
    setError(msg)
    setStage('idle')
  }

  const startMeters = (stream: MediaStream) => {
    try {
      const ctx = new AudioContext()
      ctxRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      ctx.createMediaStreamSource(stream).connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteFrequencyData(data)
        for (let i = 0; i < BARS; i++) {
          const v = data[Math.min(data.length - 1, Math.floor((i / BARS) * data.length * 0.8))] / 255
          const el = barRefs.current[i]
          if (el) el.style.transform = `scaleY(${Math.max(0.12, v).toFixed(2)})`
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      /* meter is cosmetic */
    }
  }

  const startRecognition = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    liveRef.current = ''
    setLive('')
    if (!SR) return
    try {
      const rec = new SR()
      rec.lang = 'en-IN'
      rec.continuous = true
      rec.interimResults = true
      rec.onresult = (e: any) => {
        let finalText = ''
        let interim = ''
        for (let i = 0; i < e.results.length; i++) {
          const r = e.results[i]
          if (r.isFinal) finalText += r[0].transcript + ' '
          else interim += r[0].transcript
        }
        liveRef.current = (finalText + interim).trim()
        setLive(cleanTranscript(liveRef.current))
      }
      rec.onerror = () => {}
      rec.start()
      recogRef.current = rec
    } catch {
      /* the recorded audio still goes to Wispr */
    }
  }

  const start = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        stopMeters()
        setStage('transcribing')
        const spoken = liveRef.current.trim()
        try {
          const res = await transcribeLedger(new Blob(chunksRef.current, { type: 'audio/webm' }))
          if ((res.items || []).length === 0 && spoken) {
            finish(await transcribeText(spoken), spoken)
          } else {
            finish(res, spoken)
          }
        } catch (e: any) {
          if (!spoken) return fail(`Wispr could not read that recording. ${e.message}`)
          try {
            finish(await transcribeText(spoken), spoken)
          } catch (e2: any) {
            fail(`Could not read that. ${e2.message}`)
          }
        }
      }
      mr.start()
      startRecognition()
      setSeconds(0)
      setStage('listening')
      startMeters(stream)
      clockRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) stop()
          return s + 1
        })
      }, 1000)
    } catch (e: any) {
      fail(
        e?.name === 'NotAllowedError'
          ? 'Microphone is blocked. Allow it in your browser settings, then try again.'
          : `Could not start the microphone. ${e.message}`,
      )
    }
  }

  function stop() {
    try {
      recogRef.current?.stop()
    } catch {
      /* already stopped */
    }
    if (mediaRef.current && mediaRef.current.state === 'recording') mediaRef.current.stop()
  }

  const parseText = async (input: string = text) => {
    if (!input.trim()) return
    setError('')
    setStage('transcribing')
    try {
      finish(await transcribeText(input), input)
      setTyping(false)
    } catch (e: any) {
      fail(`Could not read that. ${e.message}`)
    }
  }

  const reset = () => {
    setStage('idle')
    setRows([])
    setTranscript('')
    setError('')
    setText('')
  }

  const patch = (id: number, key: keyof Row, value: string) =>
    setRows((cur) => cur.map((r) => (r.id === id ? { ...r, [key]: value, ...(key === 'price' ? { priceFromSheet: false } : {}) } : r)))

  const rowTotal = (r: Row) => Number(r.price || 0) * Number(r.quantity || 0)
  const subtotal = rows.reduce((s, r) => s + rowTotal(r), 0)
  const gstRate = settings?.defaultGstRate || 18
  const totals = computeTotals(subtotal, gstApplied, gstRate, discountPercent)

  const saveMut = useMutation({
    mutationFn: createLedger,
    onSuccess: () => {
      ;['ledger', 'stock', 'products', 'insights'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }))
      toast.success('Sale saved')
      navigate('/ledger')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const save = () => {
    if (!partyName.trim()) return toast.error('Enter the party name first.')
    if (rows.length === 0) return toast.error('Add at least one item.')
    if (rows.some((r) => !r.name.trim() || !(Number(r.quantity) > 0))) return toast.error('Every item needs a name and a quantity above zero.')
    const missing = rows.filter((r) => r.price === '' || !r.inStock).length
    if (missing) toast.warning(`${missing} item${missing === 1 ? ' is' : 's are'} not in stock or have no price. Saving anyway.`)
    saveMut.mutate({
      type: 'sale',
      partyName: partyName.trim(),
      partyPhone,
      entryNumber: 'L-' + Date.now(),
      date: new Date().toISOString(),
      items: rows.map((r) => ({ name: r.name.trim(), quantity: Number(r.quantity), unit: r.unit, unitPrice: Number(r.price), total: rowTotal(r) })),
      subtotal: totals.subtotal,
      gstApplied,
      gstRate,
      gstAmount: totals.gstAmount,
      discountPercent,
      discountAmount: totals.discountAmount,
      total: totals.total,
    })
  }

  const listening = stage === 'listening'
  const busy = stage === 'transcribing'
  const review = stage === 'review'

  const status = listening
    ? 'Listening. Tap the square when you are done.'
    : busy
      ? 'Transcribing with Wispr'
      : review
        ? 'Check the items, then save.'
        : 'Tap the mic and say the bill.'

  return (
    <div>
      <PageHeader en="Voice sale" hi="आवाज़ से बिल" />

      <div className={cn('grid gap-4', review && 'lg:grid-cols-[1fr_340px]')}>
        <div className="space-y-4">
          <Card className={cn('items-center text-center', review ? 'py-5' : 'py-10')}>
            <CardContent className="flex w-full flex-col items-center">
              <div className="relative grid place-items-center">
                {stage === 'idle' && (
                  <span aria-hidden className="absolute size-[120px] animate-ring rounded-full bg-signal motion-reduce:hidden" />
                )}
                <button
                  type="button"
                  onClick={listening ? stop : start}
                  disabled={busy}
                  aria-label={listening ? 'Stop recording' : review ? 'Record again' : 'Start recording'}
                  className={cn(
                    'relative grid place-items-center rounded-full transition-[background-color,width,height] duration-200 disabled:opacity-80',
                    review ? 'size-14' : 'size-[120px]',
                    listening ? 'bg-destructive text-white' : 'bg-signal text-signal-foreground',
                  )}
                >
                  {busy ? (
                    <Loader2 className="size-10 animate-spin" aria-hidden />
                  ) : listening ? (
                    <Square className="size-9 fill-current" aria-hidden />
                  ) : (
                    <Mic className={review ? 'size-6' : 'size-12'} strokeWidth={2.2} aria-hidden />
                  )}
                </button>
              </div>

              <div className="mt-4 flex h-8 items-end justify-center gap-1" aria-hidden>
                {Array.from({ length: BARS }).map((_, i) => (
                  <span
                    key={i}
                    ref={(el) => {
                      barRefs.current[i] = el
                    }}
                    className={cn('h-8 w-1.5 origin-bottom rounded-full bg-destructive transition-opacity', listening ? 'opacity-100' : 'opacity-0')}
                    style={{ transform: 'scaleY(0.12)' }}
                  />
                ))}
              </div>
              {listening && (
                <p className="mt-1 flex items-center gap-2 font-mono text-lg font-semibold">
                  <span className="size-2.5 rounded-full bg-destructive" aria-hidden /> {fmtClock(seconds)}
                </p>
              )}
              <p role="status" aria-live="polite" className="mt-2 text-lg font-semibold">
                {status}
              </p>
              {listening && live && (
                <p lang="hi" className="mt-1 max-w-lg rounded-md bg-muted px-3 py-2 text-base">{live}</p>
              )}
              {stage === 'idle' && !typing && (
                <p className="mt-1 text-sm text-muted-foreground">Try “do kilo cheeni aur ek litre tel”. Hindi and English both work.</p>
              )}

              {!listening && !busy && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button variant="outline" onClick={() => setTyping((t) => !t)} aria-expanded={typing}>
                    <Keyboard aria-hidden /> Type instead
                  </Button>
                  {review && (
                    <Button variant="ghost" onClick={reset}>
                      <RotateCcw aria-hidden /> Start over
                    </Button>
                  )}
                </div>
              )}

              {typing && !listening && !busy && (
                <div className="mt-4 w-full max-w-lg space-y-2 text-left">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    placeholder="2 kg sugar, 1 litre oil, 3 packets biscuits"
                    aria-label="Bill in words"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Using Wispr Flow? Click in this box, hold its dictation key and speak. Your words land here, then press Read bill.
                  </p>
                  <Button onClick={() => parseText()} disabled={!text.trim()}>
                    Read bill
                  </Button>
                </div>
              )}

              {error && (
                <div className="mt-4 w-full max-w-lg text-left">
                  <ErrorPanel message={error} onRetry={start} />
                </div>
              )}
            </CardContent>
          </Card>

          {review && transcript && (
            <Card className="gap-1 py-4">
              <CardContent>
                <p className="text-sm font-medium text-muted-foreground">What Wispr heard</p>
                <blockquote className="mt-1 rounded-md bg-muted px-3 py-2 text-base">{transcript}</blockquote>
              </CardContent>
            </Card>
          )}

          {review && (
            <Card className="gap-0 py-0">
              <CardHeader className="flex-row items-center justify-between border-b py-4">
                <CardTitle className="text-base">Items</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRows((c) => [...c, { id: rowSeq++, name: '', quantity: 1, unit: 'kg', price: '', priceFromSheet: false, inStock: false }])}
                >
                  <Plus aria-hidden /> Add item
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {rows.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No items were found. Add one by hand, or record again.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {rows.map((r, i) => (
                      <li key={r.id} className="animate-post px-4 py-3" style={{ animationDelay: `${i * 70}ms` }}>
                        <div className="flex items-center gap-2">
                          <Input value={r.name} onChange={(e) => patch(r.id, 'name', e.target.value)} aria-label="Item name" className="font-semibold" />
                          <Button variant="ghost" size="icon" aria-label={`Remove ${r.name || 'item'}`} onClick={() => setRows((c) => c.filter((x) => x.id !== r.id))}>
                            <Trash2 aria-hidden />
                          </Button>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2">
                          <Input
                            type="number"
                            min={0}
                            step="any"
                            inputMode="decimal"
                            value={r.quantity}
                            onChange={(e) => patch(r.id, 'quantity', e.target.value)}
                            className="w-20 text-right"
                            aria-label={`${r.name} quantity`}
                          />
                          <Input value={r.unit} onChange={(e) => patch(r.id, 'unit', e.target.value)} className="w-20" aria-label={`${r.name} unit`} />
                          <span className="text-muted-foreground" aria-hidden>×</span>
                          <span className="text-sm text-muted-foreground">{sym}</span>
                          <Input
                            type="number"
                            min={0}
                            step="any"
                            inputMode="decimal"
                            value={r.price}
                            onChange={(e) => patch(r.id, 'price', e.target.value)}
                            className="w-24 text-right"
                            placeholder="Price"
                            aria-label={`${r.name} price`}
                          />
                          {!r.inStock && (
                            <Badge variant="secondary" className="rounded-sm bg-warning-soft font-semibold text-warning">
                              Not in stock
                            </Badge>
                          )}
                          {r.price === '' && (
                            <Badge variant="secondary" className="rounded-sm bg-warning-soft font-semibold text-warning">
                              No price yet
                            </Badge>
                          )}
                          {r.priceFromSheet && (
                            <Badge variant="secondary" className="rounded-sm bg-info-soft font-semibold text-primary dark:text-signal">
                              Price from sheet
                            </Badge>
                          )}
                          <p className="ml-auto text-lg font-bold">{inr(rowTotal(r), sym)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {review && (
          <div className="lg:sticky lg:top-20 lg:self-start">
            <BillSummary
              idPrefix="voice"
              sym={sym}
              totals={totals}
              partyName={partyName}
              partyPhone={partyPhone}
              onParty={(n, p) => {
                setPartyName(n)
                setPartyPhone(p)
              }}
              gstApplied={gstApplied}
              gstRate={gstRate}
              onGst={setGstApplied}
              discountPercent={discountPercent}
              onDiscount={setDiscountPercent}
              defaultDiscount={settings?.defaultDiscountPercent || 0}
              saving={saveMut.isPending}
              onSave={save}
              saveLabel="Save sale"
            />
          </div>
        )}
      </div>

      {review && <BillSaveBar sym={sym} total={totals.total} saving={saveMut.isPending} onSave={save} label="Save sale" />}
    </div>
  )
}
