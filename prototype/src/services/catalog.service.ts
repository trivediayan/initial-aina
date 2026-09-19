import type { PlaceCategory } from '@/types/dashboard.types'
import { mapService } from '@/services/map.service'
import { foodService } from '@/services/food.service'
import { hiddenGemsService } from '@/services/hiddenGems.service'

export type MapItemKind = 'place' | 'food' | 'gem'

export interface MapItem {
  mapId: string
  sourceId: string
  kind: MapItemKind
  name: string
  category: Exclude<PlaceCategory, 'all'>
  coordinates: [number, number]
  description: string
  image?: string
  rating?: number
}

export function toMapId(kind: MapItemKind, sourceId: string): string {
  return `${kind}:${sourceId}`
}

export function toDetailPath(kind: MapItemKind, sourceId: string): string {
  return `/place/${kind}-${encodeURIComponent(sourceId)}`
}

export function getAllMapItems(): MapItem[] {
  const places: MapItem[] = mapService.getPlaces().map((place) => ({
    mapId: toMapId('place', place.id),
    sourceId: place.id,
    kind: 'place',
    name: place.name,
    category: place.category === 'all' ? 'heritage' : place.category,
    coordinates: place.coordinates,
    description: place.description,
    image: place.image,
    rating: place.rating,
  }))

  const food: MapItem[] = foodService.getFood().map((item) => ({
    mapId: toMapId('food', item.id),
    sourceId: item.id,
    kind: 'food',
    name: item.name,
    category: 'food',
    coordinates: item.coordinates,
    description: item.specialty,
    image: item.image,
  }))

  const gems: MapItem[] = hiddenGemsService.getHiddenGems().map((gem) => ({
    mapId: toMapId('gem', gem.id),
    sourceId: gem.id,
    kind: 'gem',
    name: gem.name,
    category: 'hidden',
    coordinates: gem.coordinates,
    description: gem.description,
    image: gem.image,
  }))

  return [...places, ...food, ...gems]
}

export function getMapItems(category: PlaceCategory = 'all'): MapItem[] {
  const items = getAllMapItems()
  if (!category || category === 'all') return items
  return items.filter((item) => item.category === category)
}

export function getMapItemById(mapId: string): MapItem | undefined {
  return getAllMapItems().find((item) => item.mapId === mapId)
}

export function searchMapItems(query: string): MapItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return getAllMapItems()
  return getAllMapItems().filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q),
  )
}
