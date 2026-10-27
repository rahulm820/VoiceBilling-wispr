import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!token) return <Navigate to="/auth" replace />
  return <>{children}</>
}
