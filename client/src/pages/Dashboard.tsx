import { useState, useEffect } from 'react'
import { apiRequest } from '../lib/api'
import Navbar from '../components/Navbar'

interface Vehicle {
  id: number
  make: string
  model: string
  year: number
  category: string
  price: number
  quantity: number
}

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [purchasing, setPurchasing] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function fetchVehicles() {
    try {
      setLoading(true)
      setError('')
      const data = await apiRequest<Vehicle[]>('/vehicles')
      setVehicles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  async function handlePurchase(vehicleId: number) {
    setPurchasing(vehicleId)
    setFeedback(null)
    try {
      await apiRequest(`/vehicles/${vehicleId}/purchase`, {
        method: 'POST',
        body: JSON.stringify({ quantity: 1 }),
      })
      setFeedback({ type: 'success', message: 'Purchase successful!' })
      await fetchVehicles()
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Purchase failed' })
    } finally {
      setPurchasing(null)
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2 border border-red-200">
            {error}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {feedback && (
          <div
            className={`mb-6 text-sm rounded-md px-3 py-2 border ${
              feedback.type === 'success'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {vehicles.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No vehicles available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {v.make} {v.model}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{v.year}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    {v.category}
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold text-gray-900">{formatPrice(v.price)}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {v.quantity > 0 ? `${v.quantity} in stock` : 'Out of stock'}
                </p>
                <div className="mt-auto pt-4">
                  <button
                    onClick={() => handlePurchase(v.id)}
                    disabled={v.quantity === 0 || purchasing === v.id}
                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {purchasing === v.id ? 'Purchasing...' : 'Buy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
