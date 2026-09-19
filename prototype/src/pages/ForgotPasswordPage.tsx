import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import './LoginPage.css'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { resetPassword, loading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSuccess(false)
    
    if (!email) {
      setFormError('Please enter your email')
      return
    }

    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err) {
      // Error is handled by auth context
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Enter your email to receive a password reset link</p>
        </div>

        {success ? (
          <div className="auth-success">
            <p>Password reset email sent! Check your inbox for instructions.</p>
            <button
              onClick={() => navigate(ROUTES.login)}
              className="auth-button"
              style={{ marginTop: '1rem' }}
            >
              Back to Login
            </button>
          </div>
        ) : (
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

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link to={ROUTES.login} className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
