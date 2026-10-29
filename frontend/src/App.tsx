import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage } from '@/pages/AuthPage'
import { Insights } from '@/pages/Insights'
import { Ledger } from '@/pages/Ledger'
import { LedgerDetails } from '@/pages/LedgerDetails'
import { ManualLedger } from '@/pages/ManualLedger'
import { VoiceLedger } from '@/pages/VoiceLedger'
import { Stock } from '@/pages/Stock'
import { PriceSheet } from '@/pages/PriceSheet'
import { Settings } from '@/pages/Settings'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppShell } from '@/components/AppShell'

const App: React.FC = () => (
  <Routes>
    <Route path="/auth" element={<AuthPage />} />
    <Route
      element={
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<Navigate to="/insights" replace />} />
      <Route path="/insights" element={<Insights />} />
      <Route path="/ledger" element={<Ledger />} />
      <Route path="/ledger/voice" element={<VoiceLedger />} />
      <Route path="/ledger/manual" element={<ManualLedger />} />
      <Route path="/ledger/:id" element={<LedgerDetails />} />
      <Route path="/stock" element={<Stock />} />
      <Route path="/price-sheet" element={<PriceSheet />} />
      <Route path="/settings" element={<Settings />} />
    </Route>
    <Route path="*" element={<Navigate to="/insights" replace />} />
  </Routes>
)

export default App
