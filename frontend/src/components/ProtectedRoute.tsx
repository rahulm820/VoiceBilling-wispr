import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'

export const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
    )
  }
  if (!token) return <Navigate to="/auth" replace />
  return <>{children}</>
}
