import React from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { Insights } from './pages/Insights'
import { Ledger } from './pages/Ledger'
import { Stock } from './pages/Stock'
import { PriceSheet } from './pages/PriceSheet'
import { Settings } from './pages/Settings'
import { Auth } from './pages/Auth'

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
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
          <NavLink to="/auth" style={{ color: '#fff', textDecoration: 'none' }}>Logout</NavLink>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Layout><Insights /></Layout>} />
      <Route path="/ledger/*" element={<Layout><Ledger /></Layout>} />
      <Route path="/stock/*" element={<Layout><Stock /></Layout>} />
      <Route path="/price-sheet" element={<Layout><PriceSheet /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
    </Routes>
  )
}

export default App
