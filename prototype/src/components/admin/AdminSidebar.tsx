import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Landmark, Clock, Users, ChevronLeft, ChevronRight, ArrowLeft,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import './AdminSidebar.css'

const adminNavItems: { id: string; label: string; path: string; icon: typeof Landmark }[] = [
  { id: 'dashboard', label: 'Dashboard', path: ROUTES.adminDashboard, icon: LayoutDashboard },
  { id: 'places', label: 'Places', path: ROUTES.adminPlaces, icon: Landmark },
  { id: 'opening-hours', label: 'Opening Hours', path: ROUTES.adminOpeningHours, icon: Clock },
  { id: 'users', label: 'Users', path: ROUTES.adminUsers, icon: Users },
]

interface AdminSidebarProps {
  isCollapsed?: boolean
  isMobileOpen?: boolean
  onToggle?: () => void
  onMobileClose?: () => void
}

export function AdminSidebar({ isCollapsed = false, isMobileOpen = false, onToggle, onMobileClose }: AdminSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavClick = (path: string) => {
    navigate(path)
    onMobileClose?.()
  }

  const handleBackToApp = () => {
    navigate(ROUTES.dashboard)
  }

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="admin-sidebar-header">
        <div className="admin-logo">
          <span className="logo-icon"><Landmark size={18} /></span>
          {!isCollapsed && <span className="logo-text">Aina Admin</span>}
        </div>
        <button className="toggle-button" onClick={onToggle} title="Toggle sidebar" type="button">
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="admin-sidebar-nav">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
            <button
              key={item.id}
              className={`admin-nav-item ${active ? 'active' : ''}`}
              onClick={() => handleNavClick(item.path)}
              title={isCollapsed ? item.label : undefined}
              type="button"
            >
              <span className="nav-icon"><Icon size={17} strokeWidth={1.75} /></span>
              {!isCollapsed && (
                <span className="nav-label">{item.label}</span>
              )}
            </button>
            )
          })}
      </nav>

      <div className="admin-sidebar-footer">
        <button
          className="back-to-app-button"
          onClick={handleBackToApp}
          title="Back to main app"
        >
          <span className="back-icon"><ArrowLeft size={16} /></span>
          {!isCollapsed && <span>Back to App</span>}
        </button>
      </div>
    </aside>
  )
}
