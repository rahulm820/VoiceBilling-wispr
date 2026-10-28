import React from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { Insights } from './pages/Insights'
import { Ledger } from './pages/Ledger'
import { Stock } from './pages/Stock'
import { PriceSheet } from './pages/PriceSheet'
import { Settings } from './pages/Settings'
import { AuthPage } from './pages/AuthPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import { ManualLedger } from './pages/ManualLedger'
import { LedgerDetails } from './pages/LedgerDetails'
import { VoiceLedger } from './pages/VoiceLedger'
import { GlobalVoice } from './components/GlobalVoice'

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { logout } = useAuth()
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: 'var(--color-primary)', color: '#fff', padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 24 }}>SmartLedger</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <NavLink to="/" style={{ color: '#fff', textDecoration: 'none' }}>Insights</NavLink>
          <NavLink to="/ledger" style={{ color: '#fff', textDecoration: 'none' }}>Ledger</NavLink>
          <NavLink to="/stock" style={{ color: '#fff', textDecoration: 'none' }}>Stock</NavLink>
          <NavLink to="/price-sheet" style={{ color: '#fff', textDecoration: 'none' }}>Price Sheet</NavLink>
          <NavLink to="/settings" style={{ color: '#fff', textDecoration: 'none' }}>Settings</NavLink>
          <button onClick={logout} style={{ textAlign: 'left', background: 'none', border: 'none', color: '#fff', padding: 0 }}>Logout</button>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
      <GlobalVoice />
    </div>
  )
}

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<ProtectedRoute><Layout><Insights /></Layout></ProtectedRoute>} />
      <Route path="/ledger" element={<ProtectedRoute><Layout><Ledger /></Layout></ProtectedRoute>} />
      <Route path="/ledger/manual" element={<ProtectedRoute><Layout><ManualLedger /></Layout></ProtectedRoute>} />
      <Route path="/ledger/voice" element={<ProtectedRoute><Layout><VoiceLedger /></Layout></ProtectedRoute>} />
      <Route path="/ledger/:id" element={<ProtectedRoute><Layout><LedgerDetails /></Layout></ProtectedRoute>} />
      <Route path="/stock/*" element={<ProtectedRoute><Layout><Stock /></Layout></ProtectedRoute>} />
      <Route path="/price-sheet" element={<ProtectedRoute><Layout><PriceSheet /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
    </Routes>
  )
}

export default App
