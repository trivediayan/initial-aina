import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import './LoginPage.css'

export function RegisterPage() {
  const { register, resendVerification, loading, error } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleResendVerification = async () => {
    setFormError('')
    setSuccessMessage('')
    if (!email) {
      setFormError('Enter your email first')
      return
    }
    try {
      await resendVerification(email)
      setSuccessMessage('Verification email sent again. Check Inbox and Spam.')
    } catch {
      // Error is handled by auth context.
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSuccessMessage('')
    
    if (!fullName || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters')
      return
    }

    try {
      await register({
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
      })
      setSuccessMessage('Account created. Check your email and verify your address before signing in.')
    } catch (err) {
      // Error is handled by auth context
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join AINA and start your cultural journey</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {(error || formError) && (
            <div className="auth-error">
              {formError || error}
            </div>
          )}
          {successMessage && <div className="auth-success">{successMessage}</div>}

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <button type="button" className="auth-link-button" onClick={handleResendVerification} disabled={loading}>
            Resend verification email
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to={ROUTES.login} className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
