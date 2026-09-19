import { Outlet, useLocation } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ROUTES } from '@/constants/routes'

export function AppShell() {
  const { pathname } = useLocation()
  const fullWidth = pathname === ROUTES.dashboard

  return (
    <AppLayout fullWidthContent={fullWidth}>
      <Outlet />
    </AppLayout>
  )
}
