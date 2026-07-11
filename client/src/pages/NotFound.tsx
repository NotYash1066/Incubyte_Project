import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function NotFound() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-lg text-gray-600 mb-6">Page not found</p>
        <Link
          to={user ? '/' : '/login'}
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {user ? 'Go to Dashboard' : 'Go to Login'}
        </Link>
      </div>
    </div>
  )
}
