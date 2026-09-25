import type { Place, PlaceCategory, PlaceLayer } from '@/types/dashboard.types'
import { supabase } from '@/lib/supabase'
import { apiRequest } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'

const PLACES_UPDATED_EVENT = 'ayna:places-updated'

function notifyPlacesUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PLACES_UPDATED_EVENT))
  }
}

export function mapRowToPlace(row: Record<string, unknown>): Place {
  const coordinates = row.coordinates as Record<string, unknown> | unknown[] | undefined
  let lat = 22.3072
  let lng = 73.1812

  if (typeof row.latitude === 'number') {
    lat = row.latitude
  } else if (typeof row.lat === 'number') {
    lat = row.lat
  } else if (Array.isArray(coordinates) && coordinates.length >= 2) {
    lat = Number(coordinates[0]) || 22.3072
  } else if (typeof coordinates === 'object' && coordinates !== null) {
    const coordObj = coordinates as Record<string, unknown>
    lat = Number(coordObj.latitude ?? coordObj.lat ?? 22.3072)
  }

  if (typeof row.longitude === 'number') {
    lng = row.longitude
  } else if (typeof row.lng === 'number') {
    lng = row.lng
  } else if (typeof row.lon === 'number') {
    lng = row.lon
  } else if (Array.isArray(coordinates) && coordinates.length >= 2) {
    lng = Number(coordinates[1]) || 73.1812
  } else if (typeof coordinates === 'object' && coordinates !== null) {
    const coordObj = coordinates as Record<string, unknown>
    lng = Number(coordObj.longitude ?? coordObj.lng ?? coordObj.lon ?? 73.1812)
  }

  const imageUrl =
    (typeof row.image_url === 'string' && row.image_url.trim().length > 0 ? row.image_url.trim() : undefined) ||
    (typeof row.image === 'string' && row.image.trim().length > 0 ? row.image.trim() : undefined) ||
    (Array.isArray(row.images) && typeof row.images[0] === 'string' ? row.images[0] : undefined)

  const tags = Array.isArray(row.tags) ? (row.tags as string[]) : []
  const bestFor = Array.isArray(row.best_for)
    ? (row.best_for as string[])
    : Array.isArray(row.interesting_facts)
      ? (row.interesting_facts as string[])
      : []

  const visitMinutes = typeof row.visit_time_minutes === 'number' ? row.visit_time_minutes : undefined
  const explorationTime =
    visitMinutes ? `${visitMinutes} mins` : (typeof row.estimated_exploration_time === 'string' ? row.estimated_exploration_time : undefined)

  const name = String(row.name || '')
  const description = String(row.description || '')
  const category = String(row.category || 'Heritage')
  const layer = (row.layer as PlaceLayer) || undefined

  return {
    id: String(row.id),
    name,
    city: typeof row.city === 'string' ? row.city : 'Vadodara',
    district: typeof row.district === 'string' ? row.district : null,
    state: typeof row.state === 'string' ? row.state : 'Gujarat',
    country: typeof row.country === 'string' ? row.country : 'India',
    latitude: lat,
    longitude: lng,
    category,
    description,
    tags,
    layer,
    historical_information: typeof row.historical_information === 'string' ? row.historical_information : undefined,
    best_time_to_visit: typeof row.best_time_to_visit === 'string' ? row.best_time_to_visit : null,
    estimated_visit_duration_minutes:
      typeof row.estimated_visit_duration_minutes === 'number' ? row.estimated_visit_duration_minutes : undefined,
    accessibility: typeof row.accessibility === 'string' ? row.accessibility : undefined,
    image_url: imageUrl,
    source_urls: Array.isArray(row.source_urls) ? (row.source_urls as string[]) : [],
    historical_period: typeof row.historical_period === 'string' ? row.historical_period : (typeof row.history === 'string' ? row.history : undefined),
    architectural_style: typeof row.architectural_style === 'string' ? row.architectural_style : (typeof row.architecture === 'string' ? row.architecture : undefined),
    visit_time_minutes: visitMinutes,
    why_interesting: typeof row.why_interesting === 'string' ? row.why_interesting : (typeof row.cultural_significance === 'string' ? row.cultural_significance : undefined),
    best_for: bestFor,
    opening_hours: typeof row.opening_hours === 'string' ? row.opening_hours : (typeof row.openingHours === 'string' ? row.openingHours : undefined),
    entry_fee: typeof row.entry_fee === 'string' ? row.entry_fee : undefined,
    access_status: typeof row.access_status === 'string' ? row.access_status : undefined,
    itinerary_eligible: typeof row.itinerary_eligible === 'boolean' ? row.itinerary_eligible : true,
    eligibility_status: typeof row.eligibility_status === 'string' ? row.eligibility_status : undefined,
    hidden_gem: Boolean(row.hidden_gem || layer === 'hidden_gems'),
    source: typeof row.source === 'string' ? row.source : undefined,
    last_verified: typeof row.last_verified === 'string' ? row.last_verified : undefined,
    created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
    updated_at: typeof row.updated_at === 'string' ? row.updated_at : undefined,

    // UI convenience properties
    coordinates: [lat, lng],
    rating: typeof row.rating === 'number' ? row.rating : 4.8,
    image: imageUrl,
    history: typeof row.historical_period === 'string' ? row.historical_period : (typeof row.history === 'string' ? row.history : undefined),
    historicalSignificance: typeof row.historical_information === 'string' ? row.historical_information : (typeof row.historical_significance === 'string' ? row.historical_significance : undefined),
    architecture: typeof row.architectural_style === 'string' ? row.architectural_style : (typeof row.architecture === 'string' ? row.architecture : undefined),
    culturalSignificance: typeof row.why_interesting === 'string' ? row.why_interesting : (typeof row.cultural_significance === 'string' ? row.cultural_significance : undefined),
    interestingFacts: bestFor,
    historicalImages: Array.isArray(row.historical_images) ? (row.historical_images as string[]) : (imageUrl ? [imageUrl] : []),
    address: typeof row.address === 'string' ? row.address : (row.city ? `${name}, ${row.city}` : name),
    estimatedExplorationTime: explorationTime,
    bestTime: typeof row.best_time_to_visit === 'string' ? row.best_time_to_visit : (typeof row.best_time === 'string' ? row.best_time : undefined),
    openingHours: typeof row.opening_hours === 'string' ? row.opening_hours : (typeof row.openingHours === 'string' ? row.openingHours : undefined),
    thingsToSee: bestFor,
    gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : (imageUrl ? [imageUrl] : []),
  }
}

// Canonical in-memory place store (populated only by live backend/Supabase data)
let placeStore: Place[] = []
const layerCache: Partial<Record<PlaceLayer, Place[]>> = {}

function mergeIntoPlaceStore(places: Place[]): void {
  const map = new Map<string, Place>()
  for (const existing of placeStore) {
    map.set(existing.id, existing)
  }
  for (const item of places) {
    map.set(item.id, item)
    if (item.layer) {
      if (!layerCache[item.layer]) layerCache[item.layer] = []
      const currentLayerList = layerCache[item.layer]!
      const idx = currentLayerList.findIndex((p) => p.id === item.id)
      if (idx >= 0) {
        currentLayerList[idx] = item
      } else {
        currentLayerList.push(item)
      }
    }
  }
  placeStore = Array.from(map.values())
  notifyPlacesUpdated()
}

export const mapService = {
  /**
   * Fetch places strictly for an authoritative layer:
   * heritage, spiritual, art, or hidden_gems.
   * Calls GET /api/v1/places?layer={layer} (or queries Supabase with layer filter).
   */
  async fetchPlacesByLayer(layer: PlaceLayer): Promise<Place[]> {
    // 1. Try Backend API client first
    const apiRes = await apiRequest<{ places?: Record<string, unknown>[]; count?: number } | Record<string, unknown>[]>({
      path: API_ENDPOINTS.places(layer),
    })

    if (apiRes.ok && apiRes.data) {
      const rawList = Array.isArray(apiRes.data)
        ? apiRes.data
        : Array.isArray(apiRes.data.places)
          ? apiRes.data.places
          : []
      if (rawList.length > 0) {
        const places = rawList.map(mapRowToPlace)
        layerCache[layer] = places
        mergeIntoPlaceStore(places)
        return places
      }
    }

    // 2. Query Supabase directly
    if (supabase) {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('layer', layer)
        .order('name', { ascending: true })

      if (!error && data) {
        const places = (data as Record<string, unknown>[]).map(mapRowToPlace)
        layerCache[layer] = places
        mergeIntoPlaceStore(places)
        return places
      } else if (error) {
        console.error(`Failed to fetch ${layer} places from Supabase:`, error.message)
      }
    }

    // Return cached layer items if available
    return layerCache[layer] || placeStore.filter((p) => p.layer === layer)
  },

  /**
   * Fetch all 25 canonical places.
   */
  async fetchAllPlaces(): Promise<Place[]> {
    // 1. Try Backend API
    const apiRes = await apiRequest<{ places?: Record<string, unknown>[]; count?: number } | Record<string, unknown>[]>({
      path: API_ENDPOINTS.places(),
    })

    if (apiRes.ok && apiRes.data) {
      const rawList = Array.isArray(apiRes.data)
        ? apiRes.data
        : Array.isArray(apiRes.data.places)
          ? apiRes.data.places
          : []
      if (rawList.length > 0) {
        const places = rawList.map(mapRowToPlace)
        placeStore = places
        for (const p of places) {
          if (p.layer) {
            if (!layerCache[p.layer]) layerCache[p.layer] = []
            if (!layerCache[p.layer]!.some((x) => x.id === p.id)) {
              layerCache[p.layer]!.push(p)
            }
          }
        }
        notifyPlacesUpdated()
        return places
      }
    }

    // 2. Query Supabase directly
    if (supabase) {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .order('name', { ascending: true })

      if (!error && data) {
        const places = (data as Record<string, unknown>[]).map(mapRowToPlace)
        placeStore = places
        for (const p of places) {
          if (p.layer) {
            if (!layerCache[p.layer]) layerCache[p.layer] = []
            if (!layerCache[p.layer]!.some((x) => x.id === p.id)) {
              layerCache[p.layer]!.push(p)
            }
          }
        }
        notifyPlacesUpdated()
        return places
      } else if (error) {
        console.error('Failed to fetch places from Supabase:', error.message)
      }
    }

    return placeStore
  },

  /**
   * Fetch a single place record by ID.
   */
  async fetchPlaceById(id: string): Promise<Place | null> {
    const existing = placeStore.find((p) => p.id === id)
    if (existing) return existing

    // 1. Try backend API
    const apiRes = await apiRequest<Record<string, unknown>>({
      path: API_ENDPOINTS.placeDetail(id),
    })

    if (apiRes.ok && apiRes.data && apiRes.data.id) {
      const place = mapRowToPlace(apiRes.data)
      mergeIntoPlaceStore([place])
      return place
    }

    // 2. Try Supabase
    if (supabase) {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (!error && data) {
        const place = mapRowToPlace(data as Record<string, unknown>)
        mergeIntoPlaceStore([place])
        return place
      }
    }

    return null
  },

  /**
   * Synchronously get places from the memory cache for a given category/layer.
   */
  getPlaces: (categoryOrLayer?: PlaceCategory | PlaceLayer | string): Place[] => {
    if (!categoryOrLayer || categoryOrLayer === 'all') {
      return placeStore
    }
    if (categoryOrLayer === 'hidden' || categoryOrLayer === 'hidden_gems') {
      return placeStore.filter((place) => place.layer === 'hidden_gems')
    }
    if (['heritage', 'spiritual', 'art'].includes(categoryOrLayer)) {
      return placeStore.filter((place) => place.layer === categoryOrLayer)
    }
    return placeStore.filter(
      (place) => place.layer === categoryOrLayer || place.category.toLowerCase() === categoryOrLayer.toLowerCase(),
    )
  },

  getPlaceById: (id: string): Place | undefined => {
    return placeStore.find((place) => place.id === id)
  },

  searchPlaces: (query: string): Place[] => {
    const lowerQuery = query.toLowerCase()
    return placeStore.filter(
      (place) =>
        place.name.toLowerCase().includes(lowerQuery) ||
        place.description.toLowerCase().includes(lowerQuery) ||
        place.historical_period?.toLowerCase().includes(lowerQuery) ||
        place.architectural_style?.toLowerCase().includes(lowerQuery) ||
        place.category.toLowerCase().includes(lowerQuery),
    )
  },

  getNearbyPlaces: (placeId: string, category?: PlaceCategory): Place[] => {
    const currentPlace = placeStore.find((p) => p.id === placeId)
    if (!currentPlace) return []

    const nearby = placeStore
      .filter((p) => p.id !== placeId)
      .filter((p) => {
        if (category && category !== 'all') {
          if (category === 'hidden') return p.layer === 'hidden_gems'
          return p.layer === category
        }
        return true
      })
      .slice(0, 3)

    return nearby
  },

  createPlace: async (place: Place): Promise<Place> => {
    if (supabase) {
      const { error } = await supabase.from('places').insert({
        id: place.id,
        name: place.name,
        category: place.category,
        latitude: place.latitude ?? place.coordinates[0],
        longitude: place.longitude ?? place.coordinates[1],
        description: place.description,
        rating: place.rating,
        image_url: place.image_url ?? place.image,
        historical_period: place.historical_period ?? place.history,
        architectural_style: place.architectural_style ?? place.architecture,
        why_interesting: place.why_interesting ?? place.culturalSignificance,
        best_for: place.best_for ?? place.interestingFacts,
        address: place.address,
        opening_hours: place.opening_hours ?? place.openingHours,
        best_time_to_visit: place.best_time_to_visit ?? place.bestTime,
        layer: place.layer || 'heritage',
      })
      if (error) throw new Error(`Failed to save place: ${error.message}`)
    }
    mergeIntoPlaceStore([place])
    return place
  },

  updatePlace: async (id: string, updates: Partial<Place>): Promise<Place | undefined> => {
    const index = placeStore.findIndex((place) => place.id === id)
    if (index === -1) return undefined
    const updated = { ...placeStore[index], ...updates }
    if (supabase) {
      const { error } = await supabase
        .from('places')
        .update({
          name: updated.name,
          category: updated.category,
          latitude: updated.latitude ?? updated.coordinates[0],
          longitude: updated.longitude ?? updated.coordinates[1],
          description: updated.description,
          rating: updated.rating,
          image_url: updated.image_url ?? updated.image,
          historical_period: updated.historical_period ?? updated.history,
          architectural_style: updated.architectural_style ?? updated.architecture,
          why_interesting: updated.why_interesting ?? updated.culturalSignificance,
          best_for: updated.best_for ?? updated.interestingFacts,
          address: updated.address,
          opening_hours: updated.opening_hours ?? updated.openingHours,
          best_time_to_visit: updated.best_time_to_visit ?? updated.bestTime,
        })
        .eq('id', id)
      if (error) throw new Error(`Failed to update place: ${error.message}`)
    }
    placeStore[index] = updated
    notifyPlacesUpdated()
    return updated
  },

  deletePlace: async (id: string): Promise<boolean> => {
    const nextPlaces = placeStore.filter((place) => place.id !== id)
    if (nextPlaces.length === placeStore.length) return false
    if (supabase) {
      const { error } = await supabase.from('places').delete().eq('id', id)
      if (error) throw new Error(`Failed to delete place: ${error.message}`)
    }
    placeStore = nextPlaces
    notifyPlacesUpdated()
    return true
  },
}
