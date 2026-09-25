import type { Food } from '@/types/dashboard.types'
import { supabase } from '@/lib/supabase'
import { apiRequest } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'

const FOOD_UPDATED_EVENT = 'ayna:food-updated'

function notifyFoodUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(FOOD_UPDATED_EVENT))
  }
}

export function mapRowToFood(row: Record<string, unknown>): Food {
  const specificPlace = String(row.specific_place || row.name || 'Vadodara')
  const specialty = String(row.food_specialty || row.specialty || '')
  const name =
    specialty && specificPlace && !specificPlace.includes(specialty)
      ? `${specificPlace} (${specialty})`
      : specificPlace || specialty

  const imageUrl =
    (typeof row.image_url === 'string' && row.image_url.trim().length > 0 ? row.image_url.trim() : undefined) ||
    (typeof row.image === 'string' && row.image.trim().length > 0 ? row.image.trim() : undefined) ||
    (Array.isArray(row.images) && typeof row.images[0] === 'string' ? row.images[0] : '') ||
    ''

  const category = typeof row.category === 'string' ? row.category : 'Street Food'
  const foodType = typeof row.foodType === 'string' ? row.foodType : category
  const city = typeof row.city === 'string' ? row.city : 'Vadodara'
  const location = city && !specificPlace.includes(city) ? `${specificPlace}, ${city}` : specificPlace
  const priceRange =
    typeof row.starting_price_text === 'string'
      ? row.starting_price_text
      : typeof row.priceRange === 'string'
        ? row.priceRange
        : typeof row.starting_price_amount === 'number'
          ? `₹${row.starting_price_amount} onwards`
          : '₹50 onwards'

  const openingHours =
    typeof row.opening_hours === 'string'
      ? row.opening_hours
      : typeof row.openingHours === 'string'
        ? row.openingHours
        : '8:00 AM–9:00 PM'

  const whyAINARecommends =
    typeof row.why_it_represents === 'string'
      ? row.why_it_represents
      : typeof row.whyAINARecommends === 'string'
        ? row.whyAINARecommends
        : typeof row.local_story_legacy === 'string'
          ? row.local_story_legacy
          : ''

  const shortDesc =
    typeof row.short_description === 'string'
      ? row.short_description
      : typeof row.specialty === 'string'
        ? row.specialty
        : specialty

  const coordinates: [number, number] = Array.isArray(row.coordinates) && row.coordinates.length >= 2
    ? [Number(row.coordinates[0]), Number(row.coordinates[1])]
    : [22.3072, 73.1812]

  return {
    id: String(row.id),
    item_number: typeof row.item_number === 'number' ? row.item_number : undefined,
    food_specialty: specialty,
    specific_place: specificPlace,
    city,
    state: typeof row.state === 'string' ? row.state : 'Gujarat',
    country: typeof row.country === 'string' ? row.country : 'India',
    starting_price_text: priceRange,
    starting_price_amount: typeof row.starting_price_amount === 'number' ? row.starting_price_amount : undefined,
    opening_hours: openingHours,
    short_description: shortDesc,
    why_it_represents: whyAINARecommends,
    local_story_legacy: typeof row.local_story_legacy === 'string' ? row.local_story_legacy : undefined,
    category,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    image_url: imageUrl,
    source_url: typeof row.source_url === 'string' ? row.source_url : null,
    layer: 'food',
    created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
    updated_at: typeof row.updated_at === 'string' ? row.updated_at : undefined,

    // UI convenience properties
    name,
    image: imageUrl,
    foodType,
    location,
    distance: typeof row.distance === 'string' ? row.distance : 'Vadodara',
    specialty: shortDesc,
    priceRange,
    openingHours,
    whyAINARecommends,
    coordinates,
  }
}

// Memory store for food items (populated by live backend / Supabase)
let foodStore: Food[] = []

export const foodService = {
  /**
   * Fetch food strictly from the canonical backend.
   * No Supabase fallback, mock data, or stale in-memory fallback is allowed.
   */
  async fetchFood(): Promise<Food[]> {
    const apiRes = await apiRequest<{ food?: Record<string, unknown>[]; count?: number } | Record<string, unknown>[]>({
      path: API_ENDPOINTS.food,
    })

    if (!apiRes.ok || !apiRes.data) {
      throw new Error(apiRes.message || 'Failed to load food from the canonical backend.')
    }

    const rawList = Array.isArray(apiRes.data)
      ? apiRes.data
      : Array.isArray(apiRes.data.food)
        ? apiRes.data.food
        : []

    if (rawList.length === 0) {
      throw new Error('Canonical backend returned no food records.')
    }

    const items = rawList.map(mapRowToFood)
    foodStore = items
    notifyFoodUpdated()
    return items
  },

  /**
   * Fetch a single food item by ID.
   */
  async fetchFoodById(id: string): Promise<Food | null> {
    const existing = foodStore.find((f) => f.id === id)
    if (existing) return existing

    // 1. Try backend API
    const apiRes = await apiRequest<Record<string, unknown>>({
      path: API_ENDPOINTS.foodDetail(id),
    })

    if (apiRes.ok && apiRes.data && apiRes.data.id) {
      const item = mapRowToFood(apiRes.data)
      const idx = foodStore.findIndex((f) => f.id === item.id)
      if (idx >= 0) foodStore[idx] = item
      else foodStore.push(item)
      notifyFoodUpdated()
      return item
    }

    // 2. Try Supabase
    if (supabase) {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (!error && data) {
        const item = mapRowToFood(data as Record<string, unknown>)
        const idx = foodStore.findIndex((f) => f.id === item.id)
        if (idx >= 0) foodStore[idx] = item
        else foodStore.push(item)
        notifyFoodUpdated()
        return item
      }
    }

    return null
  },

  /**
   * Synchronous accessor for in-memory food store.
   */
  getFood: (): Food[] => {
    return foodStore
  },

  getFoodById: (id: string): Food | undefined => {
    return foodStore.find((food) => food.id === id)
  },

  createFood: (food: Food): Food => {
    foodStore = [...foodStore, food]
    notifyFoodUpdated()
    return food
  },

  updateFood: (id: string, updates: Partial<Food>): Food | undefined => {
    const index = foodStore.findIndex((food) => food.id === id)
    if (index === -1) return undefined
    const updated = { ...foodStore[index], ...updates }
    foodStore = foodStore.map((food, foodIndex) => (foodIndex === index ? updated : food))
    notifyFoodUpdated()
    return updated
  },

  deleteFood: (id: string): boolean => {
    const nextFood = foodStore.filter((food) => food.id !== id)
    if (nextFood.length === foodStore.length) return false
    foodStore = nextFood
    notifyFoodUpdated()
    return true
  },

  searchFood: (query: string): Food[] => {
    const lowerQuery = query.toLowerCase()
    return foodStore.filter(
      (food) =>
        food.name.toLowerCase().includes(lowerQuery) ||
        food.foodType.toLowerCase().includes(lowerQuery) ||
        food.specialty.toLowerCase().includes(lowerQuery) ||
        food.location.toLowerCase().includes(lowerQuery) ||
        (food.food_specialty && food.food_specialty.toLowerCase().includes(lowerQuery)) ||
        (food.specific_place && food.specific_place.toLowerCase().includes(lowerQuery)),
    )
  },

  getFoodByLocation: (location: string): Food[] => {
    return foodStore.filter((food) => food.location.toLowerCase().includes(location.toLowerCase()))
  },
}
