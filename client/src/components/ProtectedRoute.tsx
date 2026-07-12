import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { ReactNode } from 'react'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
        <div className="flex flex-col items-center gap-4">
          {/* Brand skeleton */}
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/20">
            <div className="flex items-center justify-center w-6 h-6">
              <svg className="w-6 h-6 text-accent/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2" />
                <circle cx="7" cy="15" r="2" />
                <circle cx="17" cy="15" r="2" />
                <path d="M5 9l2-4h10l2 4" />
              </svg>
            </div>
          </div>
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
