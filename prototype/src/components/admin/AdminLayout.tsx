import { useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import './AdminLayout.css'

interface AdminLayoutProps {
  title: string
  children: React.ReactNode
}

export function AdminLayout({ title, children }: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="admin-layout">
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        onToggle={toggleSidebar}
        onMobileClose={toggleMobileMenu}
      />
      <div className={`admin-main-content ${isSidebarCollapsed ? 'expanded' : ''}`}>
        <AdminHeader
          title={title}
          onMobileMenuToggle={toggleMobileMenu}
          onMobileMenuClose={toggleMobileMenu}
        />
        <main className="admin-content">
          {children}
        </main>
      </div>
      {isMobileMenuOpen && (
        <div
          className="admin-overlay"
          onClick={toggleMobileMenu}
        />
      )}
    </div>
  )
}
