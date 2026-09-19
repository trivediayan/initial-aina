import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { hydratePlacesFromSupabase } from '@/services/map.service'

export interface FocusedPlace {
  mapId: string
  coordinates: [number, number]
  name: string
  description?: string
  category?: string
  image?: string
}

interface MapContextType {
  focusedPlace: FocusedPlace | null
  navigateToPlace: (place: FocusedPlace) => void
  clearFocusedPlace: () => void
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export function MapProvider({ children }: { children: ReactNode }) {
  const [focusedPlace, setFocusedPlace] = useState<FocusedPlace | null>(null)

  useEffect(() => {
    void hydratePlacesFromSupabase()
  }, [])

  const navigateToPlace = useCallback((place: FocusedPlace) => {
    setFocusedPlace(place)
  }, [])

  const clearFocusedPlace = useCallback(() => {
    setFocusedPlace(null)
  }, [])

  return (
    <MapContext.Provider value={{ focusedPlace, navigateToPlace, clearFocusedPlace }}>
      {children}
    </MapContext.Provider>
  )
}

export function useMap() {
  const context = useContext(MapContext)
  if (!context) {
    throw new Error('useMap must be used within a MapProvider')
  }
  return context
}
