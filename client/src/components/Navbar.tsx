import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface NavbarProps {
  onLogoutClick?: () => void
}

export default function Navbar({ onLogoutClick }: NavbarProps = {}) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  function handleLogout() {
    if (onLogoutClick) {
      onLogoutClick()
    } else {
      logout()
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand + Dashboard link */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-white text-xs font-bold transition-transform duration-200 group-hover:scale-105">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2" />
                  <circle cx="7" cy="15" r="2" />
                  <circle cx="17" cy="15" r="2" />
                  <path d="M5 9l2-4h10l2 4" />
                </svg>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-text-primary">Dealership</span>
                <span className="text-[11px] font-medium text-text-muted tracking-wide">Inventory</span>
              </div>
            </Link>

            {/* Dashboard nav link */}
            <Link
              to="/"
              className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ml-2 ${
                isActive('/')
                  ? 'bg-accent-light text-accent'
                  : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-3">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  isActive('/admin')
                    ? 'bg-accent-light text-accent'
                    : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                <span>Manage</span>
              </Link>
            )}

            <div className="flex items-center gap-3 pl-3 border-l border-border">
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-surface-tertiary text-text-secondary text-xs font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium text-text-primary">{user?.name}</span>
                  <span className="text-[11px] text-text-muted capitalize">{user?.role}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-text-secondary hover:bg-danger-light hover:text-danger transition-all duration-150"
                aria-label="Logout"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
