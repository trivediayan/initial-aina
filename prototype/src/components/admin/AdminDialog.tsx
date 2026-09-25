import { useEffect } from 'react'
import './AdminDialog.css'

interface AdminDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function AdminDialog({ isOpen, onClose, title, children, size = 'md' }: AdminDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  useEffect(() => {
    if (!isOpen) return

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="admin-dialog-overlay" onClick={handleOverlayClick}>
      <div className={`admin-dialog admin-dialog-${size}`}>
        <div className="dialog-header">
          <h2 className="dialog-title">{title}</h2>
          <button className="dialog-close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="dialog-content">
          {children}
        </div>
      </div>
    </div>
  )
}
