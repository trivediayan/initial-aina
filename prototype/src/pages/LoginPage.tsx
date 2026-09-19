import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import './LoginPage.css'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    
    if (!email || !password) {
      setFormError('Please fill in all fields')
      return
    }

    try {
      await login({ email, password })
      navigate(ROUTES.welcome)
    } catch (err) {
      // Error is handled by auth context
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue your journey with AINA</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {(error || formError) && (
            <div className="auth-error">
              {formError || error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-actions">
            <Link to={ROUTES.forgotPassword} className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to={ROUTES.register} className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
