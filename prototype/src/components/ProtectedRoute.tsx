import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'var(--aina-background)'
      }}>
        <div style={{ color: 'var(--aina-text-secondary)' }}>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={ROUTES.login} replace />
  }

  return <>{children}</>
}
