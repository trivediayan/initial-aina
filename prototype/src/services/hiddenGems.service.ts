import type { HiddenGem, Place } from '@/types/dashboard.types'
import { mapService } from './map.service'

const HIDDEN_GEMS_UPDATED_EVENT = 'ayna:hidden-gems-updated'

function notifyHiddenGemsUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(HIDDEN_GEMS_UPDATED_EVENT))
  }
}

export function placeToHiddenGem(place: Place): HiddenGem {
  const imageUrl = place.image_url || place.image || ''
  const culturalInfo =
    place.why_interesting || place.culturalSignificance || place.historical_period || place.description
  const whyHidden =
    place.why_interesting ||
    place.culturalSignificance ||
    'A quieter Vadodara landmark off the main tourist path.'
  const explorationTime = place.visit_time_minutes
    ? `${place.visit_time_minutes} mins`
    : place.estimatedExplorationTime || '30-45 minutes'

  return {
    id: place.id,
    name: place.name,
    image: imageUrl,
    image_url: imageUrl,
    description: place.description,
    culturalInformation: culturalInfo,
    why_interesting: place.why_interesting,
    whyHidden,
    distance: place.city || 'Vadodara',
    explorationTime,
    visit_time_minutes: place.visit_time_minutes,
    bestTime: place.best_time_to_visit || place.bestTime || 'Any time',
    best_time_to_visit: place.best_time_to_visit,
    nearbyPlaces: place.best_for || [],
    coordinates: place.coordinates,
    layer: 'hidden_gems',
    category: place.category,
  }
}

export const hiddenGemsService = {
  /**
   * Asynchronously fetch all 9 hidden gems using the backend layer=hidden_gems endpoint.
   */
  async fetchHiddenGems(): Promise<HiddenGem[]> {
    const places = await mapService.fetchPlacesByLayer('hidden_gems')
    const gems = places.map(placeToHiddenGem)
    notifyHiddenGemsUpdated()
    return gems
  },

  /**
   * Synchronous accessor for hidden gems.
   */
  getHiddenGems: (): HiddenGem[] => {
    const places = mapService.getPlaces('hidden_gems')
    return places.map(placeToHiddenGem)
  },

  getHiddenGemById: (id: string): HiddenGem | undefined => {
    const place = mapService.getPlaceById(id)
    if (!place || place.layer !== 'hidden_gems') return undefined
    return placeToHiddenGem(place)
  },

  searchHiddenGems: (query: string): HiddenGem[] => {
    const lowerQuery = query.toLowerCase()
    return hiddenGemsService.getHiddenGems().filter(
      (gem) =>
        gem.name.toLowerCase().includes(lowerQuery) ||
        gem.description.toLowerCase().includes(lowerQuery) ||
        gem.culturalInformation.toLowerCase().includes(lowerQuery),
    )
  },

  getNearbyHiddenGems: (): HiddenGem[] => {
    return hiddenGemsService.getHiddenGems().slice(0, 3)
  },

  createHiddenGem: (gem: HiddenGem): HiddenGem => {
    void mapService.createPlace({
      id: gem.id,
      name: gem.name,
      category: gem.category || 'Hidden Gem',
      description: gem.description,
      coordinates: gem.coordinates,
      rating: 4.8,
      image: gem.image,
      image_url: gem.image_url || gem.image,
      why_interesting: gem.whyHidden,
      culturalSignificance: gem.culturalInformation,
      estimatedExplorationTime: gem.explorationTime,
      bestTime: gem.bestTime,
      layer: 'hidden_gems',
      hidden_gem: true,
    })
    notifyHiddenGemsUpdated()
    return gem
  },

  updateHiddenGem: (id: string, updates: Partial<HiddenGem>): HiddenGem | undefined => {
    const existing = hiddenGemsService.getHiddenGemById(id)
    if (!existing) return undefined
    const updated = { ...existing, ...updates }
    void mapService.updatePlace(id, {
      name: updated.name,
      description: updated.description,
      image: updated.image,
      image_url: updated.image_url || updated.image,
      why_interesting: updated.whyHidden,
      culturalSignificance: updated.culturalInformation,
      estimatedExplorationTime: updated.explorationTime,
      bestTime: updated.bestTime,
    })
    notifyHiddenGemsUpdated()
    return updated
  },

  deleteHiddenGem: (id: string): boolean => {
    void mapService.deletePlace(id)
    notifyHiddenGemsUpdated()
    return true
  },
}
