export interface NavItem {
  id: string
  label: string
  icon: string
  path: string
}

export interface Place {
  id: string
  name: string
  category: PlaceCategory
  coordinates: [number, number]
  description: string
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
  description: string
  culturalInformation: string
  whyHidden: string
  distance: string
  explorationTime: string
  bestTime: string
  nearbyPlaces: string[]
  coordinates: [number, number]
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
