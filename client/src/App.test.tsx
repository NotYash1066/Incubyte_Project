import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import App from './App'

const mockVehicles = [
  { id: 1, make: 'Toyota', model: 'Camry', year: 2023, category: 'Sedan', price: 25000, quantity: 5 },
  { id: 2, make: 'Honda', model: 'Civic', year: 2024, category: 'Sedan', price: 22000, quantity: 0 },
]

const server = setupServer(
  http.get('http://localhost:3001/api/vehicles', () => {
    return HttpResponse.json(mockVehicles)
  }),
  http.post('http://localhost:3001/api/vehicles/:id/purchase', () => {
    return HttpResponse.json({ success: true })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
  window.history.pushState({}, '', '/')
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
})
