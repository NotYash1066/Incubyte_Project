import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import App from './App'

const mockVehicles = [
  { id: 1, make: 'Toyota', model: 'Camry', year: 2023, category: 'Sedan', price: 25000, quantity: 5 },
  { id: 2, make: 'Honda', model: 'Civic', year: 2024, category: 'Sedan', price: 22000, quantity: 0 },
]

let vehicles: Array<Record<string, unknown>> = [...mockVehicles]

const server = setupServer(
  http.get('http://localhost:3001/api/vehicles', () => {
    return HttpResponse.json(vehicles)
  }),
  http.post('http://localhost:3001/api/vehicles/:id/purchase', () => {
    return HttpResponse.json({ success: true })
  }),
  http.post('http://localhost:3001/api/vehicles', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const newVehicle = {
      id: vehicles.length + 1,
      make: body.make,
      model: body.model,
      year: Number(body.year),
      category: body.category,
      price: Number(body.price),
      quantity: Number(body.quantity),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    vehicles.push(newVehicle)
    return HttpResponse.json(newVehicle, { status: 201 })
  }),
  http.put('http://localhost:3001/api/vehicles/:id', async ({ params, request }) => {
    const id = Number(params.id)
    const body = (await request.json()) as Record<string, unknown>
    const idx = vehicles.findIndex((v) => v.id === id)
    if (idx !== -1) {
      vehicles[idx] = { ...vehicles[idx], ...body }
    }
    return HttpResponse.json(vehicles[idx] || {})
  }),
  http.delete('http://localhost:3001/api/vehicles/:id', ({ params }) => {
    const id = Number(params.id)
    vehicles = vehicles.filter((v) => v.id !== id)
    return new HttpResponse(null, { status: 204 })
  }),
  http.post('http://localhost:3001/api/vehicles/:id/restock', async ({ params, request }) => {
    const id = Number(params.id)
    const body = (await request.json()) as Record<string, unknown>
    const vehicle = vehicles.find((v) => v.id === id)
    if (vehicle) {
      vehicle.quantity = Number(vehicle.quantity) + Number(body.quantity)
    }
    return HttpResponse.json({ success: true })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
  window.history.pushState({}, '', '/')
  vehicles = [...mockVehicles]
})
afterAll(() => server.close())

describe('App', () => {
  describe('authentication', () => {
    it('redirects to login when not authenticated', () => {
      render(<App />)
      expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    })

    it('navigates to register page via link', async () => {
      const user = userEvent.setup()
      render(<App />)
      await user.click(screen.getByRole('link', { name: 'Create one' }))
      expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument()
    })

    it('navigates to login page from register', async () => {
      const user = userEvent.setup()
      render(<App />)
      await user.click(screen.getByRole('link', { name: 'Create one' }))
      await user.click(screen.getByRole('link', { name: 'Sign in' }))
      expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    })
  })

  describe('dashboard', () => {
    it('renders vehicles when authenticated', async () => {
      localStorage.setItem('token', 'fake-token')
      localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@test.com', name: 'Test User', role: 'USER' }))
      render(<App />)
      expect(await screen.findByText('Toyota Camry')).toBeInTheDocument()
      expect(screen.getByText('Honda Civic')).toBeInTheDocument()
    })

    it('shows price and stock quantity for each vehicle', async () => {
      localStorage.setItem('token', 'fake-token')
      localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@test.com', name: 'Test User', role: 'USER' }))
      render(<App />)
      expect(await screen.findByText('$25,000.00')).toBeInTheDocument()
      expect(screen.getByText('5 in stock')).toBeInTheDocument()
      expect(screen.getByText('Out of stock')).toBeInTheDocument()
    })

    it('disables buy button for out-of-stock vehicles', async () => {
      localStorage.setItem('token', 'fake-token')
      localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@test.com', name: 'Test User', role: 'USER' }))
      render(<App />)
      await screen.findByText('Honda Civic')
      const buyButtons = screen.getAllByRole('button', { name: 'Buy' })
      expect(buyButtons[1]).toBeDisabled()
    })

    it('handles buy button click successfully', async () => {
      const user = userEvent.setup()
      localStorage.setItem('token', 'fake-token')
      localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@test.com', name: 'Test User', role: 'USER' }))
      render(<App />)
      await screen.findByText('Toyota Camry')
      await user.click(screen.getAllByRole('button', { name: 'Buy' })[0])
      expect(await screen.findByText('Purchase successful!')).toBeInTheDocument()
    })

    it('redirects unauthenticated users to login', () => {
      render(<App />)
      expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    })
  })

  describe('admin', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'fake-token')
      localStorage.setItem('user', JSON.stringify({ id: 1, email: 'admin@test.com', name: 'Admin User', role: 'ADMIN' }))
      window.history.pushState({}, '', '/admin')
    })

    it('renders admin page when authenticated as ADMIN', async () => {
      render(<App />)
      expect(await screen.findByText('Vehicle Management')).toBeInTheDocument()
      expect(screen.getByText('Toyota')).toBeInTheDocument()
      expect(screen.getByText('Honda')).toBeInTheDocument()
    })

    it('adds a new vehicle via the add form', async () => {
      const user = userEvent.setup()
      render(<App />)
      expect(await screen.findByText('Vehicle Management')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /add vehicle/i }))
      expect(screen.getByText('Add New Vehicle')).toBeInTheDocument()

      await user.type(screen.getByPlaceholderText('Make'), 'Tesla')
      await user.type(screen.getByPlaceholderText('Model'), 'Model 3')
      await user.type(screen.getByPlaceholderText('Year'), '2024')
      await user.selectOptions(screen.getByRole('combobox'), 'SUV')
      await user.type(screen.getByPlaceholderText('Price'), '45000')

      await user.click(screen.getByRole('button', { name: /^save$/i }))

      expect(await screen.findByText('Vehicle added successfully')).toBeInTheDocument()
      expect(screen.getByText('Tesla')).toBeInTheDocument()
      expect(screen.getByText('Model 3')).toBeInTheDocument()
    })

    it('deletes a vehicle and removes it from the list', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      const user = userEvent.setup()
      render(<App />)
      expect(await screen.findByText('Vehicle Management')).toBeInTheDocument()

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      await user.click(deleteButtons[0])

      expect(await screen.findByText('Vehicle deleted successfully')).toBeInTheDocument()
      expect(screen.queryByText('Toyota')).not.toBeInTheDocument()
      expect(screen.getByText('Honda')).toBeInTheDocument()
    })
  })
})
