import React from 'react'

export const EmptyState: React.FC<{ title: string, subtitle?: string }> = ({ title, subtitle }) => {
  return <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-muted)' }}>
    <div style={{ fontWeight: 600 }}>{title}</div>
    {subtitle && <div>{subtitle}</div>}
  </div>
}
