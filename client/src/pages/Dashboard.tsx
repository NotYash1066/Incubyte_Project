import { useState, useEffect, useRef } from 'react'
import { apiRequest } from '../lib/api'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'

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
  const [purchasing, setPurchasing] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [searchFilters, setSearchFilters] = useState({
    make: '',
    model: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  })

  // ── Purchase confirmation modal ──
  const [purchaseTarget, setPurchaseTarget] = useState<Vehicle | null>(null)

  // ── Celebration state ──
  const [celebratedId, setCelebratedId] = useState<number | null>(null)
  const celebrationTimer = useRef<ReturnType<typeof setTimeout>>()

  // ── Debounce timer ──
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>()

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

  // Cleanup celebration timer
  useEffect(() => {
    return () => {
      if (celebrationTimer.current) clearTimeout(celebrationTimer.current)
    }
  }, [])

  // ── Debounced search: auto-search after 300ms idle ──
  useEffect(() => {
    // Don't debounce the initial mount
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      fetchVehicles(searchFilters)
    }, 300)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilters.make, searchFilters.model, searchFilters.category, searchFilters.minPrice, searchFilters.maxPrice])

  function handleClear() {
    const cleared = { make: '', model: '', category: '', minPrice: '', maxPrice: '' }
    setSearchFilters(cleared)
    fetchVehicles(cleared)
  }

  async function handlePurchase(vehicleId: number) {
    setPurchasing(true)
    setFeedback(null)
    try {
      await apiRequest(`/vehicles/${vehicleId}/purchase`, {
        method: 'POST',
        body: JSON.stringify({ quantity: 1 }),
      })
      setPurchaseTarget(null)
      setCelebratedId(vehicleId)
      // Clear celebration after animation
      celebrationTimer.current = setTimeout(() => setCelebratedId(null), 2000)
      setFeedback({ type: 'success', message: 'Purchase successful!' })
      await fetchVehicles()
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Purchase failed' })
    } finally {
      setPurchasing(false)
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
              <div key={i} className="card p-6 animate-pulse">
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
            role="alert"
            aria-live="polite"
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
        <div className="card p-4 sm:p-6 mb-8 animate-fade-in-up">
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
            <div className="flex items-center gap-3">
              <p className="text-xs text-text-muted">
                {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} found
              </p>
              {/* Low-stock indicator */}
              {vehicles.some(v => v.quantity > 0 && v.quantity <= 3) && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Low stock items
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={handleClear} className="btn-ghost text-sm">
                Clear
              </button>
              <button type="button" onClick={() => fetchVehicles(searchFilters)} className="btn-primary text-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search
              </button>
            </div>
          </div>
        </div>

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
                className={`card-hover flex flex-col p-6 animate-fade-in-up ${
                  celebratedId === v.id ? 'animate-celebrate-pulse' : ''
                }`}
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
                  <div className="flex items-center gap-1.5 shrink-0">
                    {v.quantity > 0 && v.quantity <= 3 && (
                      <span className="badge-amber text-[10px] px-1.5 py-0.5" title="Low stock">
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </span>
                    )}
                    <span className="badge-blue shrink-0">
                      {CATEGORY_LABELS[v.category] || v.category}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <p className="mt-4 text-2xl font-bold text-text-primary">
                  {formatPrice(v.price)}
                </p>

                {/* Stock */}
                <p className="mt-1.5">
                  {v.quantity > 0 ? (
                    v.quantity <= 3 ? (
                      <span className="badge-amber">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Only {v.quantity} left
                      </span>
                    ) : (
                      <span className="badge-green">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {v.quantity} in stock
                      </span>
                    )
                  ) : (
                    <span className="badge-red">Out of stock</span>
                  )}
                </p>

                {/* Buy button */}
                <div className="mt-auto pt-5">
                  <button
                    onClick={() => setPurchaseTarget(v)}
                    disabled={v.quantity === 0}
                    className="btn-primary w-full"
                  >
                    {celebratedId === v.id ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-check-stroke" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Purchased!
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

      {/* ── Purchase Confirmation Modal ── */}
      <Modal
        open={purchaseTarget !== null}
        onClose={() => { if (!purchasing) setPurchaseTarget(null) }}
        title="Confirm purchase"
        confirmLabel="Purchase"
        loading={purchasing}
        disabled={purchasing}
        onConfirm={() => purchaseTarget && handlePurchase(purchaseTarget.id)}
      >
        <p>
          Purchase <strong>{purchaseTarget?.make} {purchaseTarget?.model}</strong> ({purchaseTarget?.year}) for{' '}
          <strong>{purchaseTarget ? formatPrice(purchaseTarget.price) : ''}</strong>?
        </p>
        {purchaseTarget && purchaseTarget.quantity <= 3 && purchaseTarget.quantity > 0 && (
          <p className="mt-2 text-amber-600 flex items-center gap-1.5">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Only {purchaseTarget.quantity} left in stock
          </p>
        )}
      </Modal>
    </div>
  )
}
