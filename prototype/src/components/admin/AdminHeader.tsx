import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import './AdminHeader.css'

interface AdminHeaderProps {
  title: string
  onMobileMenuToggle?: () => void
  onMobileMenuClose?: () => void
}

export function AdminHeader({ title, onMobileMenuToggle, onMobileMenuClose }: AdminHeaderProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate(ROUTES.home)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="admin-header">
      <div className="header-left">
        <button
          className="mobile-menu-toggle"
          onClick={onMobileMenuToggle}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-right">
        <div className="user-menu-container">
          <button
            className="user-menu-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user?.full_name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="user-name">{user?.full_name || 'Admin'}</span>
            <span className="dropdown-arrow">▼</span>
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-item dropdown-user-info">
                <div className="dropdown-avatar">
                  {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="dropdown-user-details">
                  <span className="dropdown-name">{user?.full_name || 'Admin'}</span>
                  <span className="dropdown-email">{user?.email || ''}</span>
                </div>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={() => navigate(ROUTES.profile)}>
                👤 View Profile
              </button>
              <button className="dropdown-item" onClick={() => {
                navigate(ROUTES.dashboard)
                onMobileMenuClose?.()
              }}>
                🏠 Back to App
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
