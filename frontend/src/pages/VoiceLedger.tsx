import React, { useState } from 'react'
import { Card } from '../components/Card'

export const VoiceLedger: React.FC = () => {
  const [status] = useState('Ready')
  return (
    <div style={{ maxWidth: 600 }}>
      <h1>Voice Ledger</h1>
      <Card>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <button style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', border: 'none' }}>🎤</button>
          <div style={{ marginTop: 12 }}>{status}</div>
        </div>
      </Card>
    </div>
  )
}
