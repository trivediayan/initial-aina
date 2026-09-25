/**
 * Verified backend API endpoints for AINA.
 */
export const API_ENDPOINTS = {
  places: (layer?: string) => (layer ? `/places?layer=${encodeURIComponent(layer)}` : '/places'),
  placesHeritage: '/places?layer=heritage',
  placesSpiritual: '/places?layer=spiritual',
  placesArt: '/places?layer=art',
  placesHiddenGems: '/places?layer=hidden_gems',
  placeDetail: (id: string) => `/places/${encodeURIComponent(id)}`,
  food: '/food',
  foodDetail: (id: string) => `/food/${encodeURIComponent(id)}`,
} as const

export const S2_ENDPOINTS = {
  chat: '/chat',
} as const

export const S3_ENDPOINTS = API_ENDPOINTS

