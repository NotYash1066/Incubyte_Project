import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function NotFound() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4">
      <div className="text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-surface-tertiary mb-6">
          <svg className="w-10 h-10 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-text-muted mb-2">404</h1>
        <p className="text-lg text-text-secondary mb-8">Page not found</p>
        <Link
          to={user ? '/' : '/login'}
          className="btn-primary inline-flex"
        >
          {user ? (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Go to Dashboard
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Go to Login
            </>
          )}
        </Link>
      </div>
    </div>
  )
}
