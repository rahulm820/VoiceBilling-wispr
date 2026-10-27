import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
}

export const Button: React.FC<Props> = ({ variant = 'primary', loading, children, disabled, ...rest }) => {
  const style: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 4,
    border: 'none',
    background: variant === 'primary' ? 'var(--color-primary)' : variant === 'danger' ? 'var(--color-danger)' : '#eee',
    color: variant === 'secondary' ? '#333' : '#fff',
    opacity: disabled || loading ? 0.7 : 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer'
  }
  return <button style={style} disabled={disabled || loading} {...rest}>{loading ? 'Loading...' : children}</button>
}
