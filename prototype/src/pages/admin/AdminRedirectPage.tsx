import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export function AdminRedirectPage() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate(ROUTES.adminDashboard, { replace: true })
  }, [navigate])

  return null
}
