import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export const Input: React.FC<Props> = ({ label, error, ...rest }) => {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: 'block', marginBottom: 4 }}>{label}</label>}
      <input {...rest} style={{ width: '100%', padding: 8, border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`, borderRadius: 4 }} />
      {error && <div style={{ color: 'var(--color-danger)', fontSize: 12 }}>{error}</div>}
    </div>
  )
}
