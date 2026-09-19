import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import {
  Compass,
  Utensils,
  Landmark,
  Gem,
  Bookmark,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Footprints,
  Shield,
} from 'lucide-react'
import { isAdminEmail } from '@/lib/admin'
import './Sidebar.css'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  exact?: boolean
}

const navItems: NavItem[] = [
  { id: 'explore', label: 'Explore', icon: <Compass size={18} strokeWidth={1.75} />, path: ROUTES.dashboard, exact: true },
  { id: 'food', label: 'Food', icon: <Utensils size={18} strokeWidth={1.75} />, path: ROUTES.food },
  { id: 'hidden', label: 'Hidden Gems', icon: <Gem size={18} strokeWidth={1.75} />, path: ROUTES.hiddenGems },
  { id: 'saved', label: 'Saved', icon: <Bookmark size={18} strokeWidth={1.75} />, path: ROUTES.saved },
  { id: 'visited', label: 'Explored', icon: <Footprints size={18} strokeWidth={1.75} />, path: ROUTES.visited },
  { id: 'profile', label: 'Profile', icon: <User size={18} strokeWidth={1.75} />, path: ROUTES.profile },
]

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (item: NavItem) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  const handleNavClick = (path: string) => {
    navigate(path)
    onMobileClose()
  }

  const handleNavPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`)
    event.currentTarget.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate(ROUTES.home)
    } catch (e) {
      console.error('Logout failed:', e)
    }
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileClose} />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => handleNavClick(ROUTES.dashboard)}>
            <div className="logo-icon-wrap">
              <img src="/ayna-logo.png" alt="Ayna" />
            </div>
            {!collapsed && <span className="logo-text">Aina</span>}
          </div>

          {/* Desktop collapse toggle */}
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Mobile close */}
          <button className="sidebar-mobile-close" onClick={onMobileClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive(item) ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
              onPointerMove={handleNavPointerMove}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
              {isActive(item) && <span className="nav-active-dot" />}
            </button>
          ))}
          <div className="sidebar-nav-group">
            <div className={`sidebar-nav-group-label ${location.pathname.startsWith('/places/') ? 'active' : ''}`}>
              <span className="nav-icon"><Landmark size={18} strokeWidth={1.75} /></span>
              {!collapsed && <span className="nav-label">Places</span>}
            </div>
            {!collapsed && (
              <div className="sidebar-nav-children">
                {[
                  { label: 'Heritage', path: ROUTES.placesHeritage },
                  { label: 'Spiritual', path: ROUTES.placesSpiritual },
                  { label: 'Art', path: ROUTES.placesArt },
                ].map((item) => (
                  <button
                    key={item.path}
                    className={`sidebar-nav-child ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.path)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {isAdminEmail(user?.email) && (
            <button
              className={`sidebar-nav-item ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
              onClick={() => handleNavClick(ROUTES.adminDashboard)}
              onPointerMove={handleNavPointerMove}
              title={collapsed ? 'Admin' : undefined}
            >
              <span className="nav-icon"><Shield size={18} strokeWidth={1.75} /></span>
              {!collapsed && <span className="nav-label">Admin</span>}
            </button>
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className={`sidebar-user ${collapsed ? 'collapsed' : ''}`}>
            <div className="user-avatar">{initials}</div>
            {!collapsed && (
              <div className="user-info">
                <span className="user-name">{user?.full_name || 'User'}</span>
                <span className="user-email">{user?.email || ''}</span>
              </div>
            )}
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={16} strokeWidth={1.8} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="mobile-menu-btn" onClick={onClick} aria-label="Open menu">
      <Menu size={20} />
    </button>
  )
}
