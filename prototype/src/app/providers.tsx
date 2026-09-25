import { useEffect, type ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { MapProvider } from '@/contexts/MapContext'
import { mapService } from '@/services/map.service'
import { foodService } from '@/services/food.service'

type AppProvidersProps = {
  children: ReactNode
}

const LEGACY_STORAGE_KEYS = [
  'ayna-admin-hidden-gems',
  'ayna-admin-hidden-gems-seed-version',
  'ayna-admin-food',
  'ayna-admin-food-seed-version',
  'ayna-admin-places',
  'ayna-admin-places-seed-version',
]

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        for (const key of LEGACY_STORAGE_KEYS) {
          window.localStorage.removeItem(key)
        }
      }
    } catch {
      /* ignore storage access restrictions */
    }

    void mapService.fetchAllPlaces()
    void foodService.fetchFood()
  }, [])


  return (
    <BrowserRouter>
      <AuthProvider>
        <MapProvider>
          {children}
        </MapProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
