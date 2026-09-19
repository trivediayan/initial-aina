import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { MapProvider } from '@/contexts/MapContext'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
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
