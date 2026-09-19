import type {
  AdminStats,
  AdminPlace,
  AdminFood,
  AdminHiddenGem,
  AdminCategory,
  AdminImage,
  OpeningHours,
  AdminUser,
  PaginationState,
  FilterState,
} from '@/types/admin.types'
import { mapService } from './map.service'
import { foodService } from './food.service'
import { hiddenGemsService } from './hiddenGems.service'
import { userService } from './user.service'
import type { User } from '@/types/auth.types'
import { supabase } from '@/lib/supabase'

function createPlaceId(): string {
  const cryptoApi = globalThis.crypto
  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID()
  }

  if (typeof cryptoApi?.getRandomValues === 'function') {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  const time = Date.now().toString(16).padStart(12, '0')
  return `${time.slice(0, 8)}-${time.slice(8)}-4${Math.random().toString(16).slice(2, 5)}-8${Math.random().toString(16).slice(2, 5)}-${Math.random().toString(16).slice(2).padEnd(12, '0').slice(0, 12)}`
}

class AdminService {
  getStats(currentUser?: User): AdminStats {
    const places = mapService.getPlaces()
    const food = foodService.getFood()
    const gems = hiddenGemsService.getHiddenGems()
    const visited = userService.getVisitedPlaces()
    const saved = userService.getSavedPlaces()

    return {
      totalUsers: currentUser ? 1 : 0,
      totalPlaces: places.length,
      heritagePlaces: places.filter(p => p.category === 'heritage').length,
      foodPlaces: food.length,
      hiddenGems: gems.length,
      totalVisits: visited.length,
      popularPlaces: 0,
      savedPlaces: saved.length,
      chatbotQuestions: 0,
    }
  }

  // Places Management
  getPlaces(filter?: FilterState, pagination?: PaginationState): { data: AdminPlace[]; total: number } {
    const places = mapService.getPlaces()
    let filtered = [...places]

    if (filter?.search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        p.description.toLowerCase().includes(filter.search.toLowerCase())
      )
    }

    if (filter?.category && filter.category !== 'all') {
      filtered = filtered.filter(p => p.category === filter.category)
    }

    const total = filtered.length
    const start = pagination ? (pagination.page - 1) * pagination.pageSize : 0
    const end = pagination ? start + pagination.pageSize : filtered.length
    const paginated = filtered.slice(start, end)

    const adminPlaces: AdminPlace[] = paginated.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      history: p.history,
      culturalSignificance: p.culturalSignificance,
      architecture: p.architecture,
      latitude: p.coordinates[0],
      longitude: p.coordinates[1],
      images: p.image ? [p.image] : [],
      openingHours: p.openingHours,
      bestTime: p.bestTime,
      estimatedExplorationTime: p.estimatedExplorationTime,
      rating: p.rating,
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
    }))

    return { data: adminPlaces, total }
  }

  getPlaceById(id: string): AdminPlace | null {
    const place = mapService.getPlaceById(id)
    if (!place) return null

    return {
      id: place.id,
      name: place.name,
      category: place.category,
      description: place.description,
      history: place.history,
      culturalSignificance: place.culturalSignificance,
      architecture: place.architecture,
      latitude: place.coordinates[0],
      longitude: place.coordinates[1],
      images: place.image ? [place.image] : [],
      openingHours: place.openingHours,
      bestTime: place.bestTime,
      estimatedExplorationTime: place.estimatedExplorationTime,
      rating: place.rating,
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
    }
  }

  async createPlace(place: Omit<AdminPlace, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminPlace> {
    const newPlace: AdminPlace = {
      ...place,
      id: createPlaceId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await mapService.createPlace({
      id: newPlace.id,
      name: newPlace.name,
      category: newPlace.category as AdminPlace['category'] as any,
      description: newPlace.description,
      history: newPlace.history,
      culturalSignificance: newPlace.culturalSignificance,
      architecture: newPlace.architecture,
      coordinates: [newPlace.latitude, newPlace.longitude],
      image: newPlace.images[0],
      openingHours: newPlace.openingHours,
      bestTime: newPlace.bestTime,
      estimatedExplorationTime: newPlace.estimatedExplorationTime,
      rating: newPlace.rating,
    })
    return newPlace
  }

  async updatePlace(id: string, updates: Partial<AdminPlace>): Promise<AdminPlace | null> {
    const existing = this.getPlaceById(id)
    if (!existing) return null

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    }
    await mapService.updatePlace(id, {
      name: updated.name,
      category: updated.category as AdminPlace['category'] as any,
      description: updated.description,
      history: updated.history,
      culturalSignificance: updated.culturalSignificance,
      architecture: updated.architecture,
      coordinates: [updated.latitude, updated.longitude],
      image: updated.images[0],
      openingHours: updated.openingHours,
      bestTime: updated.bestTime,
      estimatedExplorationTime: updated.estimatedExplorationTime,
      rating: updated.rating,
    })
    return updated
  }

  async deletePlace(id: string): Promise<boolean> {
    return mapService.deletePlace(id)
  }

  // Food Management
  getFoodItems(filter?: FilterState, pagination?: PaginationState): { data: AdminFood[]; total: number } {
    const food = foodService.getFood()
    let filtered = [...food]

    if (filter?.search) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        f.specialty.toLowerCase().includes(filter.search.toLowerCase())
      )
    }

    const total = filtered.length
    const start = pagination ? (pagination.page - 1) * pagination.pageSize : 0
    const end = pagination ? start + pagination.pageSize : filtered.length
    const paginated = filtered.slice(start, end)

    const adminFood: AdminFood[] = paginated.map(f => ({
      id: f.id,
      name: f.name,
      foodType: f.foodType,
      location: f.location,
      priceRange: f.priceRange,
      specialty: f.specialty,
      openingHours: f.openingHours,
      images: [f.image],
      coordinates: f.coordinates,
      status: 'active',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
    }))

    return { data: adminFood, total }
  }

  getFoodById(id: string): AdminFood | null {
    const food = foodService.getFood().find(f => f.id === id)
    if (!food) return null

    return {
      id: food.id,
      name: food.name,
      foodType: food.foodType,
      location: food.location,
      priceRange: food.priceRange,
      specialty: food.specialty,
      openingHours: food.openingHours,
      images: [food.image],
      coordinates: food.coordinates,
      status: 'active',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
    }
  }

  createFood(food: Omit<AdminFood, 'id' | 'createdAt' | 'updatedAt'>): AdminFood {
    const newFood: AdminFood = {
      ...food,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    foodService.createFood({
      id: newFood.id,
      name: newFood.name,
      foodType: newFood.foodType,
      location: newFood.location,
      distance: 'Nearby',
      specialty: newFood.specialty,
      priceRange: newFood.priceRange,
      openingHours: newFood.openingHours,
      whyAINARecommends: 'Added from admin dashboard',
      image: newFood.images[0] || 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
      coordinates: newFood.coordinates ?? [22.3076, 73.1812],
    })

    return newFood
  }

  updateFood(id: string, updates: Partial<AdminFood>): AdminFood | null {
    const existing = this.getFoodById(id)
    if (!existing) return null

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    }

    foodService.updateFood(id, {
      name: updated.name,
      foodType: updated.foodType,
      location: updated.location,
      specialty: updated.specialty,
      priceRange: updated.priceRange,
      openingHours: updated.openingHours,
      image: updated.images[0],
      coordinates: updated.coordinates,
    })

    return updated
  }

  deleteFood(id: string): boolean {
    return foodService.deleteFood(id)
  }

  // Hidden Gems Management
  getHiddenGems(filter?: FilterState, pagination?: PaginationState): { data: AdminHiddenGem[]; total: number } {
    const gems = hiddenGemsService.getHiddenGems()
    let filtered = [...gems]

    if (filter?.search) {
      filtered = filtered.filter(g =>
        g.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        g.description.toLowerCase().includes(filter.search.toLowerCase())
      )
    }

    const total = filtered.length
    const start = pagination ? (pagination.page - 1) * pagination.pageSize : 0
    const end = pagination ? start + pagination.pageSize : filtered.length
    const paginated = filtered.slice(start, end)

    const adminGems: AdminHiddenGem[] = paginated.map(g => ({
      id: g.id,
      name: g.name,
      description: g.description,
      culturalInformation: g.culturalInformation,
      whyHidden: g.whyHidden,
      coordinates: g.coordinates,
      images: [g.image],
      bestTime: g.bestTime,
      explorationTime: g.explorationTime,
      status: 'active',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date(),
    }))

    return { data: adminGems, total }
  }

  getHiddenGemById(id: string): AdminHiddenGem | null {
    const gem = hiddenGemsService.getHiddenGems().find(g => g.id === id)
    if (!gem) return null

    return {
      id: gem.id,
      name: gem.name,
      description: gem.description,
      culturalInformation: gem.culturalInformation,
      whyHidden: gem.whyHidden,
      coordinates: gem.coordinates,
      images: [gem.image],
      bestTime: gem.bestTime,
      explorationTime: gem.explorationTime,
      status: 'active',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date(),
    }
  }

  createHiddenGem(gem: Omit<AdminHiddenGem, 'id' | 'createdAt' | 'updatedAt'>): AdminHiddenGem {
    const newGem: AdminHiddenGem = {
      ...gem,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    hiddenGemsService.createHiddenGem({
      id: newGem.id,
      name: newGem.name,
      description: newGem.description,
      culturalInformation: newGem.culturalInformation,
      whyHidden: newGem.whyHidden,
      image: newGem.images[0] || 'https://images.unsplash.com/photo-1580441712339-7210b84b017c?w=800',
      distance: 'Nearby',
      explorationTime: newGem.explorationTime || '1 hour',
      bestTime: newGem.bestTime || 'Any time',
      nearbyPlaces: [],
      coordinates: newGem.coordinates ?? [22.3076, 73.1812],
    })

    return newGem
  }

  updateHiddenGem(id: string, updates: Partial<AdminHiddenGem>): AdminHiddenGem | null {
    const existing = this.getHiddenGemById(id)
    if (!existing) return null

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    }

    hiddenGemsService.updateHiddenGem(id, {
      name: updated.name,
      description: updated.description,
      culturalInformation: updated.culturalInformation,
      whyHidden: updated.whyHidden,
      image: updated.images[0],
      explorationTime: updated.explorationTime,
      bestTime: updated.bestTime,
      coordinates: updated.coordinates,
    })

    return updated
  }

  deleteHiddenGem(id: string): boolean {
    return hiddenGemsService.deleteHiddenGem(id)
  }

  // Categories Management
  getCategories(): AdminCategory[] {
    return [
      {
        id: '1',
        name: 'Heritage',
        description: 'Historical and cultural heritage sites',
        icon: '🏛️',
        color: '#B43A26',
        placeCount: 12,
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Food',
        description: 'Local cuisine and dining experiences',
        icon: '🍛',
        color: '#C99532',
        placeCount: 8,
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'Hidden Gems',
        description: 'Lesser-known treasures and secrets',
        icon: '💎',
        color: '#3E6B5B',
        placeCount: 6,
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      {
        id: '4',
        name: 'Architecture',
        description: 'Architectural marvels and buildings',
        icon: '🏗️',
        color: '#8C241C',
        placeCount: 5,
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      {
        id: '5',
        name: 'Spiritual',
        description: 'Temples, mosques, and spiritual sites',
        icon: '🕉️',
        color: '#76655D',
        placeCount: 7,
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      {
        id: '6',
        name: 'Art & Culture',
        description: 'Art galleries and cultural centers',
        icon: '🎨',
        color: '#D5B5AE',
        placeCount: 4,
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
    ]
  }

  // Images Management
  getImages(filter?: FilterState, pagination?: PaginationState): { data: AdminImage[]; total: number } {
    const places = mapService.getPlaces()
    const images: AdminImage[] = places.flatMap(p => 
      p.image ? [{
        id: `${p.id}-1`,
        url: p.image,
        placeId: p.id,
        placeName: p.name,
        type: 'hero',
        status: 'active',
        uploadedAt: new Date('2024-01-15'),
      }] : []
    )

    let filtered = [...images]
    if (filter?.search) {
      filtered = filtered.filter(img =>
        img.placeName.toLowerCase().includes(filter.search.toLowerCase())
      )
    }

    const total = filtered.length
    const start = pagination ? (pagination.page - 1) * pagination.pageSize : 0
    const end = pagination ? start + pagination.pageSize : filtered.length
    const paginated = filtered.slice(start, end)

    return { data: paginated, total }
  }

  // Opening Hours Management
  getOpeningHours(placeId: string): OpeningHours[] {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return days.map(day => ({
      id: `${placeId}-${day}`,
      placeId,
      day,
      openTime: '09:00',
      closeTime: '17:00',
      isClosed: day === 'Monday',
    }))
  }

  updateOpeningHours(hours: OpeningHours): OpeningHours {
    return hours
  }

  // Users Management
  async getUsers(filter?: FilterState, pagination?: PaginationState, currentUser?: User): Promise<{ data: AdminUser[]; total: number }> {
    let users: AdminUser[] = []

    if (supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at, last_active, status')
        .order('created_at', { ascending: false })

      if (!error && data) {
        users = data.map((profile) => ({
          id: profile.id,
          fullName: profile.full_name || profile.email,
          email: profile.email,
          placesVisited: 0,
          savedPlaces: 0,
          itineraryCount: 0,
          status: profile.status || 'active',
          joinedAt: new Date(profile.created_at),
          lastActive: new Date(profile.last_active || profile.created_at),
        }))
      }
    }

    if (users.length === 0 && currentUser) {
      users = [{
        id: currentUser.id,
        fullName: currentUser.full_name || currentUser.email,
        email: currentUser.email,
        placesVisited: userService.getVisitedPlaces().length,
        savedPlaces: userService.getSavedPlaces().length,
        itineraryCount: userService.getItineraries().length,
        status: 'active',
        joinedAt: new Date(),
        lastActive: new Date(),
      }]
    }

    if (filter?.search) {
      const query = filter.search.toLowerCase()
      users = users.filter((user) =>
        user.fullName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
      )
    }

    if (filter?.status) {
      users = users.filter((user) => user.status === filter.status)
    }

    const total = users.length
    const start = pagination ? (pagination.page - 1) * pagination.pageSize : 0
    const end = pagination ? start + pagination.pageSize : users.length
    return { data: users.slice(start, end), total }
  }

  async getUserById(id: string): Promise<AdminUser | null> {
    const users = await this.getUsers()
    return users.data.find(u => u.id === id) || null
  }

  async updateUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser | null> {
    const existing = await this.getUserById(id)
    if (!existing) return null

    return {
      ...existing,
      ...updates,
    }
  }

  deleteUser(_id: string): boolean {
    return true
  }
}

export const adminService = new AdminService()
