import React from 'react'

export const Modal: React.FC<React.PropsWithChildren<{ open: boolean, onClose: () => void, title: string }>> = ({ open, onClose, title, children }) => {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 20, width: '90%', maxWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3>{title}</h3>
          <button onClick={onClose}>X</button>
        </div>
        {children}
      </div>
    </div>
  )
}
