import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
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

interface FormData {
  make: string
  model: string
  year: string
  category: string
  price: string
  quantity: string
}

const CATEGORIES = ['SEDAN', 'SUV', 'TRUCK', 'COUPE', 'VAN']

const CATEGORY_LABELS: Record<string, string> = {
  SEDAN: 'Sedan',
  SUV: 'SUV',
  TRUCK: 'Truck',
  COUPE: 'Coupe',
  VAN: 'Van',
}

const emptyForm: FormData = {
  make: '',
  model: '',
  year: '',
  category: 'SEDAN',
  price: '',
  quantity: '0',
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export default function Admin() {
  const { user } = useAuth()

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<FormData>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<FormData>(emptyForm)
  const [restockingId, setRestockingId] = useState<number | null>(null)
  const [restockQty, setRestockQty] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

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

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  function showFeedback(type: 'success' | 'error', message: string) {
    setFeedback({ type, message })
  }

  function handleAddFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setAddForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleEditFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function startEdit(v: Vehicle) {
    setEditingId(v.id)
    setEditForm({
      make: v.make,
      model: v.model,
      year: String(v.year),
      category: v.category,
      price: String(v.price),
      quantity: String(v.quantity),
    })
    setRestockingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(emptyForm)
  }

  async function handleAdd() {
    setSubmitting(true)
    try {
      await apiRequest('/vehicles', {
        method: 'POST',
        body: JSON.stringify({
          make: addForm.make,
          model: addForm.model,
          year: Number(addForm.year),
          category: addForm.category,
          price: Number(addForm.price),
          quantity: Number(addForm.quantity),
        }),
      })
      setShowAddForm(false)
      setAddForm(emptyForm)
      showFeedback('success', 'Vehicle added successfully')
      await fetchVehicles()
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to add vehicle')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(id: number) {
    setSubmitting(true)
    try {
      await apiRequest(`/vehicles/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          make: editForm.make,
          model: editForm.model,
          year: Number(editForm.year),
          category: editForm.category,
          price: Number(editForm.price),
          quantity: Number(editForm.quantity),
        }),
      })
      setEditingId(null)
      setEditForm(emptyForm)
      showFeedback('success', 'Vehicle updated successfully')
      await fetchVehicles()
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to update vehicle')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return
    setSubmitting(true)
    try {
      await apiRequest(`/vehicles/${id}`, { method: 'DELETE' })
      showFeedback('success', 'Vehicle deleted successfully')
      await fetchVehicles()
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to delete vehicle')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRestock(id: number) {
    if (!restockQty || Number(restockQty) <= 0) return
    setSubmitting(true)
    try {
      await apiRequest(`/vehicles/${id}/restock`, {
        method: 'POST',
        body: JSON.stringify({ quantity: Number(restockQty) }),
      })
      setRestockingId(null)
      setRestockQty('')
      showFeedback('success', 'Vehicle restocked successfully')
      await fetchVehicles()
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to restock vehicle')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 bg-surface-tertiary rounded w-64 mb-6 animate-pulse" />
          <div className="card divide-y divide-border animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4">
                <div className="h-4 bg-surface-tertiary rounded flex-1" />
                <div className="h-4 bg-surface-tertiary rounded flex-1" />
                <div className="h-4 bg-surface-tertiary rounded w-20" />
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
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Vehicle Management</h1>
            <p className="text-sm text-text-muted mt-1">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowAddForm((prev) => !prev)
              setEditingId(null)
              setRestockingId(null)
            }}
            className="btn-primary"
          >
            {showAddForm ? (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Vehicle
              </>
            )}
          </button>
        </div>

        {/* ── Add Form ── */}
        {showAddForm && (
          <div className="card p-6 mb-8 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-text-primary mb-5">Add New Vehicle</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <div>
                <label htmlFor="add-make" className="input-label">Make</label>
                <input id="add-make" name="make" placeholder="Make" value={addForm.make} onChange={handleAddFormChange} className="input" />
              </div>
              <div>
                <label htmlFor="add-model" className="input-label">Model</label>
                <input id="add-model" name="model" placeholder="Model" value={addForm.model} onChange={handleAddFormChange} className="input" />
              </div>
              <div>
                <label htmlFor="add-year" className="input-label">Year</label>
                <input id="add-year" name="year" type="number" placeholder="Year" value={addForm.year} onChange={handleAddFormChange} className="input" />
              </div>
              <div>
                <label htmlFor="add-category" className="input-label">Category</label>
                <select id="add-category" name="category" value={addForm.category} onChange={handleAddFormChange} className="input">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="add-price" className="input-label">Price</label>
                <input id="add-price" name="price" type="number" placeholder="Price" value={addForm.price} onChange={handleAddFormChange} className="input" />
              </div>
              <div>
                <label htmlFor="add-quantity" className="input-label">Quantity</label>
                <input id="add-quantity" name="quantity" type="number" placeholder="1" value={addForm.quantity} onChange={handleAddFormChange} className="input" />
              </div>
            </div>
            <div className="flex gap-2 mt-6 pt-5 border-t border-border">
              <button type="button" onClick={handleAdd} disabled={submitting || !addForm.make || !addForm.model || !addForm.year || !addForm.price} className="btn-primary">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                    </svg>
                    Saving…
                  </span>
                ) : 'Save'}
              </button>
              <button type="button" onClick={() => { setShowAddForm(false); setAddForm(emptyForm) }} disabled={submitting} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Vehicle Table ── */}
        {vehicles.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-tertiary mb-4">
              <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">No vehicles yet</h3>
            <p className="text-sm text-text-muted">Add your first vehicle to get started.</p>
          </div>
        ) : (
          <div className="card overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-tertiary/50">
                    {['Make', 'Model', 'Year', 'Category', 'Price', 'Stock', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 sm:px-6 py-3.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {vehicles.map((v) => (
                    <tr key={v.id} className="transition-colors duration-150 hover:bg-surface-tertiary/40">
                      {editingId === v.id ? (
                        <>
                          <td className="px-4 sm:px-6 py-3"><input name="make" value={editForm.make} onChange={handleEditFormChange} className="input py-1.5 text-xs" /></td>
                          <td className="px-4 sm:px-6 py-3"><input name="model" value={editForm.model} onChange={handleEditFormChange} className="input py-1.5 text-xs" /></td>
                          <td className="px-4 sm:px-6 py-3"><input name="year" type="number" value={editForm.year} onChange={handleEditFormChange} className="input py-1.5 text-xs w-20" /></td>
                          <td className="px-4 sm:px-6 py-3">
                            <select name="category" value={editForm.category} onChange={handleEditFormChange} className="input py-1.5 text-xs">
                              {CATEGORIES.map((c) => (<option key={c} value={c}>{CATEGORY_LABELS[c]}</option>))}
                            </select>
                          </td>
                          <td className="px-4 sm:px-6 py-3"><input name="price" type="number" value={editForm.price} onChange={handleEditFormChange} className="input py-1.5 text-xs w-24" /></td>
                          <td className="px-4 sm:px-6 py-3"><input name="quantity" type="number" value={editForm.quantity} onChange={handleEditFormChange} className="input py-1.5 text-xs w-16" /></td>
                          <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => handleEdit(v.id)} disabled={submitting} className="btn-primary text-xs px-3 py-1.5">Save</button>
                              <button type="button" onClick={cancelEdit} disabled={submitting} className="btn-ghost text-xs px-3 py-1.5">Cancel</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 sm:px-6 py-4 font-medium text-text-primary whitespace-nowrap">{v.make}</td>
                          <td className="px-4 sm:px-6 py-4 text-text-primary whitespace-nowrap">{v.model}</td>
                          <td className="px-4 sm:px-6 py-4 text-text-secondary whitespace-nowrap">{v.year}</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap"><span className="badge-blue">{CATEGORY_LABELS[v.category] || v.category}</span></td>
                          <td className="px-4 sm:px-6 py-4 font-semibold text-text-primary whitespace-nowrap">{formatPrice(v.price)}</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            {v.quantity > 0 ? (
                              <span className="badge-green">{v.quantity}</span>
                            ) : (
                              <span className="badge-red">0</span>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <button type="button" onClick={() => startEdit(v)} disabled={submitting} className="btn-ghost text-xs px-2.5 py-1.5">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit
                              </button>
                              <button type="button" onClick={() => handleDelete(v.id)} disabled={submitting} className="btn-ghost text-xs px-2.5 py-1.5 text-danger hover:bg-danger-light hover:text-danger">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                                Delete
                              </button>
                              {restockingId === v.id ? (
                                <span className="inline-flex items-center gap-1 ml-1">
                                  <input
                                    type="number"
                                    value={restockQty}
                                    onChange={(e) => setRestockQty(e.target.value)}
                                    placeholder="Qty"
                                    className="input w-14 py-1 text-xs"
                                    autoFocus
                                  />
                                  <button type="button" onClick={() => handleRestock(v.id)} disabled={submitting || !restockQty || Number(restockQty) <= 0} className="btn-primary text-xs px-2 py-1">
                                    Confirm
                                  </button>
                                  <button type="button" onClick={() => { setRestockingId(null); setRestockQty('') }} className="btn-ghost text-xs px-2 py-1">
                                    ×
                                  </button>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => { setRestockingId(v.id); setRestockQty('') }}
                                  disabled={submitting}
                                  className="btn-ghost text-xs px-2.5 py-1.5 text-success hover:bg-success-light"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                  Restock
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
