import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { isAdminEmail } from '@/lib/admin'
import { ROUTES } from '@/constants/routes'

export function AdminRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="route-loading">
        <div className="spinner" />
      </div>
    )
  }

  if (!user || !isAdminEmail(user.email)) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  return <Outlet />
}
