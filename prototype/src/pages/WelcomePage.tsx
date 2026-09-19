import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import './WelcomePage.css'

export function WelcomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showSecondText, setShowSecondText] = useState(false)
  const [showFullName, setShowFullName] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowSecondText(true)
    }, 1500)

    const timer2 = setTimeout(() => {
      setShowFullName(true)
    }, 2500)

    const timer3 = setTimeout(() => {
      navigate(ROUTES.dashboard)
    }, 4500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [navigate])

  return (
    <main className="welcome-page">
      <div className="welcome-container">
        <div className="welcome-text-container">
          <h1 className="welcome-title">
            <span className="welcome-aina">Welcome to AINA</span>
          </h1>
          {showSecondText && (
            <p className={`welcome-subtitle ${showFullName ? 'visible' : ''}`}>
              Welcome to AINA, <span className="welcome-name">{user?.full_name || 'Traveler'}</span>
            </p>
          )}
        </div>
        <div className="welcome-decoration">
          <div className="gold-circle"></div>
          <div className="gold-circle gold-circle-2"></div>
          <div className="gold-circle gold-circle-3"></div>
        </div>
      </div>
    </main>
  )
}
