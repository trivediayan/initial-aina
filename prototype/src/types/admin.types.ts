export interface AdminStats {
  totalUsers: number
  totalPlaces: number
  heritagePlaces: number
  foodPlaces: number
  hiddenGems: number
  totalVisits: number
  popularPlaces: number
  savedPlaces: number
  chatbotQuestions: number
}

export interface AdminPlace {
  id: string
  name: string
  category: string
  description: string
  history?: string
  culturalSignificance?: string
  architecture?: string
  latitude: number
  longitude: number
  images: string[]
  openingHours?: string
  bestTime?: string
  estimatedExplorationTime?: string
  rating: number
  status: 'active' | 'inactive' | 'pending'
  createdAt: Date
  updatedAt: Date
}

export interface AdminFood {
  id: string
  name: string
  foodType: string
  location: string
  priceRange: string
  specialty: string
  openingHours: string
  images: string[]
  coordinates: [number, number]
  status: 'active' | 'inactive' | 'pending'
  createdAt: Date
  updatedAt: Date
}

export interface AdminHiddenGem {
  id: string
  name: string
  description: string
  culturalInformation: string
  whyHidden: string
  coordinates: [number, number]
  images: string[]
  bestTime: string
  explorationTime: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: Date
  updatedAt: Date
}

export interface AdminCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  placeCount: number
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export interface AdminImage {
  id: string
  url: string
  placeId: string
  placeName: string
  type: 'hero' | 'gallery' | 'thumbnail'
  status: 'active' | 'inactive'
  uploadedAt: Date
}

export interface OpeningHours {
  id: string
  placeId: string
  day: string
  openTime: string
  closeTime: string
  isClosed: boolean
}

export interface AdminUser {
  id: string
  fullName: string
  email: string
  profilePhoto?: string
  placesVisited: number
  savedPlaces: number
  itineraryCount: number
  status: 'active' | 'inactive' | 'suspended'
  joinedAt: Date
  lastActive: Date
}

export interface AdminNavItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface FilterState {
  search: string
  category?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DialogState {
  isOpen: boolean
  type: 'create' | 'edit' | 'delete' | 'view' | null
  data?: any
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}
