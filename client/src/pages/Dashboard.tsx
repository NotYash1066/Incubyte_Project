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

const CATEGORIES = ['SEDAN', 'SUV', 'TRUCK', 'COUPE', 'VAN'] as const

const CATEGORY_LABELS: Record<string, string> = {
  SEDAN: 'Sedan',
  SUV: 'SUV',
  TRUCK: 'Truck',
  COUPE: 'Coupe',
  VAN: 'Van',
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
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

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

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

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse stagger-{i}">
                <div className="h-5 bg-surface-tertiary rounded w-3/4 mb-3" />
                <div className="h-4 bg-surface-tertiary rounded w-1/3 mb-4" />
                <div className="h-6 bg-surface-tertiary rounded w-1/2 mb-3" />
                <div className="h-4 bg-surface-tertiary rounded w-1/4 mb-4" />
                <div className="h-10 bg-surface-tertiary rounded-lg mt-auto" />
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-3 rounded-lg bg-danger-light border border-danger-border px-4 py-3 text-sm text-danger max-w-xl mx-auto">
            <svg className="w-5 h-5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p className="font-medium">Failed to load vehicles</p>
              <p className="text-danger/80 mt-0.5">{error}</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feedback toast */}
        {feedback && (
          <div
            className={`mb-6 flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-[var(--shadow-card)] animate-slide-in-right ${
              feedback.type === 'success'
                ? 'bg-success-light border-success-border text-success'
                : 'bg-danger-light border-danger-border text-danger'
            }`}
          >
            {feedback.type === 'success' ? (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* ── Search Form ── */}
        <form onSubmit={handleSearch} className="card p-4 sm:p-6 mb-8 animate-fade-in-up">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div>
              <label className="input-label">Make</label>
              <input
                type="text"
                placeholder="Make"
                value={searchFilters.make}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, make: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="input-label">Model</label>
              <input
                type="text"
                placeholder="Model"
                value={searchFilters.model}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, model: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="input-label">Category</label>
              <select
                value={searchFilters.category}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, category: e.target.value }))}
                className="input"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Min Price</label>
              <input
                type="number"
                placeholder="$0"
                min="0"
                value={searchFilters.minPrice}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="input-label">Max Price</label>
              <input
                type="number"
                placeholder="$Any"
                min="0"
                value={searchFilters.maxPrice}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                className="input"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-xs text-text-muted">
              {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} found
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={handleClear} className="btn-ghost text-sm">
                Clear
              </button>
              <button type="submit" className="btn-primary text-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search
              </button>
            </div>
          </div>
        </form>

        {/* ── Vehicle Grid ── */}
        {vehicles.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-tertiary mb-4">
              <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2" />
                <circle cx="7" cy="15" r="2" />
                <circle cx="17" cy="15" r="2" />
                <path d="M5 9l2-4h10l2 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">No vehicles found</h3>
            <p className="text-sm text-text-muted mb-6">Try adjusting your search filters or clear them to see all vehicles.</p>
            <button type="button" onClick={handleClear} className="btn-secondary text-sm">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v, idx) => (
              <div
                key={v.id}
                className="card-hover flex flex-col p-6 animate-fade-in-up"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-text-primary truncate">
                      {v.make} {v.model}
                    </h3>
                    <p className="text-sm text-text-muted mt-0.5">{v.year}</p>
                  </div>
                  <span className="badge-blue shrink-0">
                    {CATEGORY_LABELS[v.category] || v.category}
                  </span>
                </div>

                {/* Price */}
                <p className="mt-4 text-2xl font-bold text-text-primary">
                  {formatPrice(v.price)}
                </p>

                {/* Stock */}
                <p className="mt-1.5">
                  {v.quantity > 0 ? (
                    <span className="badge-green">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {v.quantity} in stock
                    </span>
                  ) : (
                    <span className="badge-red">Out of stock</span>
                  )}
                </p>

                {/* Buy button */}
                <div className="mt-auto pt-5">
                  <button
                    onClick={() => handlePurchase(v.id)}
                    disabled={v.quantity === 0 || purchasing === v.id}
                    className="btn-primary w-full"
                  >
                    {purchasing === v.id ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                        </svg>
                        Purchasing…
                      </span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
Buy
                      </>
                    )}
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
