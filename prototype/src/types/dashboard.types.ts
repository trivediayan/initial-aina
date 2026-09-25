export interface NavItem {
  id: string
  label: string
  icon: string
  path: string
}

export type PlaceLayer = 'heritage' | 'spiritual' | 'art' | 'hidden_gems'

export interface Place {
  id: string
  name: string
  city?: string
  district?: string | null
  state?: string
  country?: string
  latitude?: number
  longitude?: number
  category: string
  description: string
  tags?: string[]
  layer?: PlaceLayer
  historical_information?: string
  best_time_to_visit?: string | null
  estimated_visit_duration_minutes?: number
  accessibility?: string
  image_url?: string
  source_urls?: string[]
  historical_period?: string
  architectural_style?: string
  visit_time_minutes?: number
  why_interesting?: string
  best_for?: string[]
  opening_hours?: string
  entry_fee?: string
  access_status?: string
  itinerary_eligible?: boolean
  eligibility_status?: string
  hidden_gem?: boolean
  source?: string
  last_verified?: string
  created_at?: string
  updated_at?: string

  // UI convenience aliases
  coordinates: [number, number]
  rating: number
  image?: string
  history?: string
  historicalSignificance?: string
  architecture?: string
  culturalSignificance?: string
  interestingFacts?: string[]
  historicalImages?: string[]
  address?: string
  estimatedExplorationTime?: string
  bestTime?: string
  openingHours?: string
  thingsToSee?: string[]
  gallery?: string[]
}

export type PlaceCategory = 
  | 'all'
  | 'heritage'
  | 'architecture'
  | 'spiritual'
  | 'art'
  | 'food'
  | 'hidden'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
  error?: string
}

export interface QuickSuggestion {
  id: string
  text: string
  icon: string
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatStatus {
  isTyping: boolean
  error: string | null
  isConnected: boolean
}

export interface ChatbotContext {
  currentLocation?: {
    latitude: number
    longitude: number
    address: string
  }
  selectedPlace?: {
    id: string
    name: string
    category: string
  }
  nearbyPlaces?: string[]
  currentItinerary?: {
    id: string
    name: string
    places: string[]
  }
  savedPlaces?: string[]
  visitedPlaces?: string[]
  userPreferences?: {
    interests: string[]
    language: string
    accessibility: string[]
  }
}

export interface Food {
  id: string
  item_number?: number
  food_specialty?: string
  specific_place?: string
  city?: string
  state?: string
  country?: string
  starting_price_text?: string
  starting_price_amount?: number
  opening_hours?: string
  short_description?: string
  why_it_represents?: string
  local_story_legacy?: string
  category?: string
  tags?: string[]
  image_url?: string
  source_url?: string | null
  layer?: 'food'
  created_at?: string
  updated_at?: string

  // UI convenience aliases
  name: string
  image: string
  foodType: string
  location: string
  distance: string
  specialty: string
  priceRange: string
  openingHours: string
  whyAINARecommends: string
  coordinates: [number, number]
}

export interface HiddenGem {
  id: string
  name: string
  image: string
  image_url?: string
  description: string
  culturalInformation: string
  why_interesting?: string
  whyHidden: string
  distance: string
  explorationTime: string
  visit_time_minutes?: number
  bestTime: string
  best_time_to_visit?: string | null
  nearbyPlaces: string[]
  coordinates: [number, number]
  layer?: 'hidden_gems'
  category?: string
}

export interface SavedPlace {
  placeId: string
  savedAt: Date
  notes?: string
}

export interface VisitedPlace {
  placeId: string
  visitedAt: Date
  rating?: number
  notes?: string
}

export interface ItineraryItem {
  placeId: string
  order: number
  estimatedTime: string
}

export interface Itinerary {
  id: string
  name: string
  items: ItineraryItem[]
  createdAt: Date
  updatedAt: Date
  totalDistance: string
  estimatedDuration: string
}

export interface UserProfile {
  fullName: string
  email: string
  profilePhoto?: string
  joinDate: Date
  achievements: Achievement[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: Date
}

export interface TravelStats {
  totalPlacesVisited: number
  heritageVisited: number
  foodVisited: number
  hiddenGemsVisited: number
  totalExplorationTime: string
  weeklyProgress: number[]
  monthlyProgress: number[]
}

export interface Recommendation {
  placeId: string
  reason: string
  score: number
}
