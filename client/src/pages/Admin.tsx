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

const emptyForm: FormData = {
  make: '',
  model: '',
  year: '',
  category: 'SEDAN',
  price: '',
  quantity: '0',
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

  if (!user || user.role !== 'ADMIN') {
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

  function showFeedback(type: 'success' | 'error', message: string) {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 5000)
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

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
          <button
            type="button"
            onClick={() => {
              setShowAddForm((prev) => !prev)
              setEditingId(null)
              setRestockingId(null)
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {showAddForm ? 'Cancel' : 'Add Vehicle'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Vehicle</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                <input
                  name="make"
                  placeholder="Make"
                  value={addForm.make}
                  onChange={handleAddFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  name="model"
                  placeholder="Model"
                  value={addForm.model}
                  onChange={handleAddFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  name="year"
                  type="number"
                  placeholder="Year"
                  value={addForm.year}
                  onChange={handleAddFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={addForm.category}
                  onChange={handleAddFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  name="price"
                  type="number"
                  placeholder="Price"
                  value={addForm.price}
                  onChange={handleAddFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  placeholder="Quantity"
                  value={addForm.quantity}
                  onChange={handleAddFormChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={handleAdd}
                disabled={submitting || !addForm.make || !addForm.model || !addForm.year || !addForm.price}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setAddForm(emptyForm)
                }}
                disabled={submitting}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {vehicles.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No vehicles available.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Make', 'Model', 'Year', 'Category', 'Price', 'Qty', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    {editingId === v.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            name="make"
                            value={editForm.make}
                            onChange={handleEditFormChange}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            name="model"
                            value={editForm.model}
                            onChange={handleEditFormChange}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            name="year"
                            type="number"
                            value={editForm.year}
                            onChange={handleEditFormChange}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            name="category"
                            value={editForm.category}
                            onChange={handleEditFormChange}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            name="price"
                            type="number"
                            value={editForm.price}
                            onChange={handleEditFormChange}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            name="quantity"
                            type="number"
                            value={editForm.quantity}
                            onChange={handleEditFormChange}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleEdit(v.id)}
                            disabled={submitting}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 mr-3"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={submitting}
                            className="text-sm font-medium text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.make}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.model}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.year}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(v.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(v)}
                              disabled={submitting}
                              className="font-medium text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(v.id)}
                              disabled={submitting}
                              className="font-medium text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                            {restockingId === v.id ? (
                              <span className="inline-flex items-center gap-1">
                                <input
                                  type="number"
                                  value={restockQty}
                                  onChange={(e) => setRestockQty(e.target.value)}
                                  placeholder="Qty"
                                  className="w-16 border border-gray-300 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRestock(v.id)}
                                  disabled={submitting || !restockQty || Number(restockQty) <= 0}
                                  className="font-medium text-green-600 hover:text-green-800 text-xs"
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRestockingId(null)
                                    setRestockQty('')
                                  }}
                                  className="font-medium text-gray-500 hover:text-gray-700 text-xs"
                                >
                                  Cancel
                                </button>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setRestockingId(v.id)
                                  setRestockQty('')
                                }}
                                disabled={submitting}
                                className="font-medium text-green-600 hover:text-green-800"
                              >
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
        )}
      </main>
    </div>
  )
}
