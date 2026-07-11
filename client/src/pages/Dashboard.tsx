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
  const [searchFilters, setSearchFilters] = useState({
    make: '',
    model: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  })

  async function fetchVehicles(filters?: typeof searchFilters) {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams()
      const f = filters ?? searchFilters
      if (f.make) params.set('make', f.make)
      if (f.model) params.set('model', f.model)
      if (f.category) params.set('category', f.category)
      if (f.minPrice) params.set('minPrice', f.minPrice)
      if (f.maxPrice) params.set('maxPrice', f.maxPrice)
      const qs = params.toString()
      const data = await apiRequest<Vehicle[]>(`/vehicles/search${qs ? `?${qs}` : ''}`)
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

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    await fetchVehicles(searchFilters)
  }

  function handleClear() {
    const cleared = { make: '', model: '', category: '', minPrice: '', maxPrice: '' }
    setSearchFilters(cleared)
    fetchVehicles(cleared)
  }

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

        <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Make</label>
            <input
              type="text"
              placeholder="Make"
              value={searchFilters.make}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, make: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Model</label>
            <input
              type="text"
              placeholder="Model"
              value={searchFilters.model}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, model: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full sm:w-auto min-w-[140px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select
              value={searchFilters.category}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="SEDAN">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="TRUCK">Truck</option>
              <option value="COUPE">Coupe</option>
              <option value="VAN">Van</option>
            </select>
          </div>
          <div className="w-full sm:w-auto min-w-[120px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Min Price</label>
            <input
              type="number"
              placeholder="Min $"
              min="0"
              value={searchFilters.minPrice}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, minPrice: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full sm:w-auto min-w-[120px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Max Price</label>
            <input
              type="number"
              placeholder="Max $"
              min="0"
              value={searchFilters.maxPrice}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Clear
            </button>
          </div>
        </form>

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
