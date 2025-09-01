import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './login-form'

// Mock fetch
global.fetch = jest.fn()

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login form', () => {
    render(<LoginForm />)
    
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('should show demo users info', () => {
    render(<LoginForm />)
    
    expect(screen.getByText('admin@test.com / 123456')).toBeInTheDocument()
    expect(screen.getByText('agente@test.com / 123456')).toBeInTheDocument()
  })
})
