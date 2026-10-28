import React, { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { transcribeLedger, transcribeText } from '../services/wispr'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { useSettings } from '../hooks/useSettings'
import { useNavigate } from 'react-router-dom'
import { createLedger } from '../api/ledger'
import { useQueryClient } from '@tanstack/react-query'

export const VoiceLedger: React.FC = () => {
  const [status, setStatus] = useState('Ready')
  const [transcript, setTranscript] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [recording, setRecording] = useState(false)
  const [textMode, setTextMode] = useState(false)
  const [text, setText] = useState('')
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const { settings } = useSettings()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [partyName, setPartyName] = useState('')
  const [partyPhone, setPartyPhone] = useState('')

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setStatus('Transcribing with Wispr')
        try {
          const res = await transcribeLedger(blob)
          setTranscript(res.transcript || '')
          setItems(res.items || [])
          setStatus('Review')
        } catch (e: any) {
          setStatus('Error: ' + e.message)
        }
      }
      mr.start()
      setRecording(true)
      setStatus('Listening')
    } catch (e: any) {
      setStatus('Mic error: ' + e.message)
    }
  }

  const stop = () => {
    mediaRef.current?.stop()
    setRecording(false)
  }

  const parseText = async () => {
    setStatus('Transcribing with Wispr')
    try {
      const res = await transcribeText(text)
      setTranscript(res.transcript || text)
      setItems(res.items || [])
      setStatus('Review')
      setTextMode(false)
    } catch (e: any) {
      setStatus('Error: ' + e.message)
    }
  }

  const updateItem = (idx: number, key: string, value: any) => {
    const copy = [...items]
    copy[idx][key] = value
    setItems(copy)
  }

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))

  const subtotal = items.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 0), 0)
  const gstApplied = settings?.gstOnByDefault ?? true
  const gstRate = settings?.defaultGstRate || 18
  const gstAmount = gstApplied ? (subtotal * gstRate) / 100 : 0
  const discountPercent = settings?.discountOnByDefault ? (settings?.defaultDiscountPercent || 0) : 0
  const discountAmount = discountPercent ? (subtotal * discountPercent) / 100 : 0
  const total = subtotal + gstAmount - discountAmount

  const saveMut = useMutation({
    mutationFn: createLedger,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ledger'] })
      qc.invalidateQueries({ queryKey: ['stock'] })
      qc.invalidateQueries({ queryKey: ['insights'] })
      navigate('/ledger')
    }
  })

  const save = async () => {
    if (!partyName) { alert('Party name required'); return }
    if (items.length === 0) { alert('No items'); return }
    await saveMut.mutateAsync({
      type: 'sale',
      partyName,
      partyPhone,
      entryNumber: 'L-' + Date.now(),
      date: new Date().toISOString(),
      items: items.map(i => ({ name: i.name, quantity: Number(i.quantity), unit: i.unit, unitPrice: Number(i.price), total: Number(i.price) * Number(i.quantity) })),
      subtotal,
      gstApplied,
      gstRate,
      gstAmount,
      discountPercent,
      discountAmount,
      total,
    })
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <h1>Voice Ledger</h1>
      <Card>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <button onClick={recording ? stop : start} style={{ width: 80, height: 80, borderRadius: '50%', background: recording ? 'var(--color-danger)' : 'var(--color-primary)', color: '#fff', border: 'none', fontSize: 32 }}>🎤</button>
          <div style={{ marginTop: 12 }}>{status}</div>
          <Button variant="secondary" onClick={() => setTextMode(!textMode)} style={{ marginTop: 8 }}>Type instead</Button>
        </div>
      </Card>
      {textMode && (
        <Card>
          <textarea value={text} onChange={e => setText(e.target.value)} style={{ width: '100%', height: 80 }} />
          <Button onClick={parseText}>Parse</Button>
        </Card>
      )}
      {transcript && (
        <Card>
          <div style={{ fontWeight: 600 }}>Transcript</div>
          <div>{transcript}</div>
        </Card>
      )}
      {items.length > 0 && (
        <Card>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Items</div>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <input value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} style={{ padding: 8 }} />
              <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} style={{ width: 80, padding: 8 }} />
              <input value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)} style={{ width: 60, padding: 8 }} />
              <input type="number" value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)} style={{ width: 100, padding: 8 }} />
              <Button variant="danger" onClick={() => removeItem(idx)}>Remove</Button>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <input placeholder="Party name" value={partyName} onChange={e => setPartyName(e.target.value)} style={{ padding: 8, marginRight: 8 }} />
            <input placeholder="Phone" value={partyPhone} onChange={e => setPartyPhone(e.target.value)} style={{ padding: 8 }} />
          </div>
          <div style={{ marginTop: 12 }}>
            <div>Subtotal: ₹{subtotal.toFixed(2)}</div>
            {gstApplied && <div>GST: ₹{gstAmount.toFixed(2)}</div>}
            {discountPercent > 0 && <div>Discount: -₹{discountAmount.toFixed(2)}</div>}
            <div style={{ fontWeight: 600 }}>Total: ₹{total.toFixed(2)}</div>
          </div>
          <Button onClick={save} loading={saveMut.isPending} style={{ marginTop: 12 }}>Save Ledger</Button>
        </Card>
      )}
    </div>
  )
}
