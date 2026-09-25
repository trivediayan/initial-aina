import type { PlaceCategory } from '@/types/dashboard.types'
import { mapService } from '@/services/map.service'
import { foodService } from '@/services/food.service'

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
  const places = mapService.getPlaces()
  const placeItems: MapItem[] = places.map((place) => {
    let cat: Exclude<PlaceCategory, 'all'> = 'heritage'
    let kind: MapItemKind = 'place'

    if (place.layer === 'hidden_gems') {
      cat = 'hidden'
      kind = 'gem'
    } else if (place.layer === 'spiritual') {
      cat = 'spiritual'
    } else if (place.layer === 'art') {
      cat = 'art'
    } else {
      cat = 'heritage'
    }

    return {
      mapId: toMapId(kind, place.id),
      sourceId: place.id,
      kind,
      name: place.name,
      category: cat,
      coordinates: place.coordinates,
      description: place.description,
      image: place.image_url || place.image,
      rating: place.rating,
    }
  })

  const foodItems: MapItem[] = foodService.getFood().map((item) => ({
    mapId: toMapId('food', item.id),
    sourceId: item.id,
    kind: 'food',
    name: item.name,
    category: 'food',
    coordinates: item.coordinates,
    description: item.specialty,
    image: item.image_url || item.image,
  }))

  return [...placeItems, ...foodItems]
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
