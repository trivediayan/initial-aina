import { useNavigate } from 'react-router-dom'
import { useMap } from '@/contexts/MapContext'
import { ROUTES } from '@/constants/routes'
import type { MapItem } from '@/services/catalog.service'

export function useInternalNavigate() {
  const navigate = useNavigate()
  const { navigateToPlace } = useMap()

  return (item: Pick<MapItem, 'mapId' | 'coordinates' | 'name' | 'description' | 'category' | 'image'>) => {
    navigateToPlace({
      mapId: item.mapId,
      coordinates: item.coordinates,
      name: item.name,
      description: item.description,
      category: item.category,
      image: item.image,
    })
    navigate(ROUTES.dashboard)
  }
}
