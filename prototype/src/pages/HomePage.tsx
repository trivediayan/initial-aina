import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import './HomePage.css'

export function HomePage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && !loading) {
      navigate(ROUTES.dashboard)
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="route-loading">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <main className="home-page">
      <div className="home-container">
        <div className="home-content">
          <h1 className="home-title">Welcome to AINA</h1>
          <p className="home-subtitle">Your Cultural Discovery Companion</p>
          
          <div className="home-actions">
            <Link to={ROUTES.login} className="home-button primary">
              Sign In
            </Link>
            <Link to={ROUTES.register} className="home-button secondary">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
