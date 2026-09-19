import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar, MobileMenuButton } from '@/components/dashboard/Sidebar'
import { MessageCircle } from 'lucide-react'
import { Chat } from '@/components/dashboard/Chat'
import '@/styles/animations.css'
import './AppLayout.css'

interface AppLayoutProps {
  children: ReactNode
  fullWidthContent?: boolean  // for map page (no internal padding)
}

export function AppLayout({ children, fullWidthContent = false }: AppLayoutProps) {
  const { pathname } = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    setChatOpen(pathname.startsWith('/place/'))
  }, [pathname])

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content area */}
      <div className="app-main">
        {/* Mobile top bar */}
        <header className="app-mobile-header">
          <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />
          <div className="mobile-header-logo">
            <img src="/ayna-logo.png" alt="Ayna" />
            <span>Aina</span>
          </div>
          <span className="mobile-header-spacer" aria-hidden="true" />
        </header>

        {/* Page content */}
        <div className={`app-content ${fullWidthContent ? 'full-width' : ''}`}>
          <div className="page-fade-in">
            {children}
          </div>
        </div>
      </div>

      {/* Chat panel */}
      <div className={`chat-overlay-container ${chatOpen ? 'open' : ''}`}>
        <div className={`chat-panel-wrapper ${chatOpen ? 'open' : ''}`}>
          <Chat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
        </div>
      </div>

      {/* Chat FAB */}
      {!chatOpen && (
        <button
          className="chat-fab"
          onClick={() => setChatOpen(true)}
          aria-label="Ask AINA"
        >
          <MessageCircle size={22} strokeWidth={1.8} />
          <span className="chat-fab-label">Ask AINA</span>
        </button>
      )}
    </div>
  )
}
