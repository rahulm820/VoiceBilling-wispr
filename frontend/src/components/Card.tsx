import React from 'react'

export const Card: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div style={{ background: 'var(--color-card)', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: 16 }}>{children}</div>
}
