import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-gray-900">
            Dealership Inventory
          </Link>
          <div className="flex items-center gap-4">
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Admin
              </Link>
            )}
            <span className="text-sm text-gray-600">
              {user?.name} ({user?.role?.toLowerCase()})
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
