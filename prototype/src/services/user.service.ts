import type { SavedPlace, VisitedPlace, Itinerary, ItineraryItem, UserProfile, TravelStats, Recommendation } from '@/types/dashboard.types'
import { mapService } from './map.service'

class UserService {
  private savedPlaces: SavedPlace[] = []
  private visitedPlaces: VisitedPlace[] = []
  private itineraries: Itinerary[] = []
  private userProfile: UserProfile = {
    fullName: 'User',
    email: 'user@example.com',
    joinDate: new Date(),
    achievements: [
      {
        id: '1',
        title: 'First Explorer',
        description: 'Visit your first heritage site',
        icon: '🏛️',
        unlockedAt: new Date(),
      },
      {
        id: '2',
        title: 'Foodie',
        description: 'Try 5 local dishes',
        icon: '🍛',
      },
      {
        id: '3',
        title: 'Hidden Gem Hunter',
        description: 'Discover 3 hidden gems',
        icon: '💎',
      },
    ],
  }

  // Saved Places
  getSavedPlaces(): SavedPlace[] {
    return this.savedPlaces
  }

  savePlace(placeId: string, notes?: string): void {
    if (!this.savedPlaces.find(sp => sp.placeId === placeId)) {
      this.savedPlaces.push({
        placeId,
        savedAt: new Date(),
        notes,
      })
    }
  }

  unsavePlace(placeId: string): void {
    this.savedPlaces = this.savedPlaces.filter(sp => sp.placeId !== placeId)
  }

  isPlaceSaved(placeId: string): boolean {
    return this.savedPlaces.some(sp => sp.placeId === placeId)
  }

  // Visited Places
  getVisitedPlaces(): VisitedPlace[] {
    return this.visitedPlaces.sort((a, b) => b.visitedAt.getTime() - a.visitedAt.getTime())
  }

  markPlaceVisited(placeId: string, rating?: number, notes?: string): void {
    if (!this.visitedPlaces.find(vp => vp.placeId === placeId)) {
      this.visitedPlaces.push({
        placeId,
        visitedAt: new Date(),
        rating,
        notes,
      })
    }
  }

  isPlaceVisited(placeId: string): boolean {
    return this.visitedPlaces.some(vp => vp.placeId === placeId)
  }

  // Itinerary
  getItineraries(): Itinerary[] {
    return this.itineraries
  }

  createItinerary(name: string, placeIds: string[]): Itinerary {
    const items: ItineraryItem[] = placeIds.map((placeId, index) => ({
      placeId,
      order: index,
      estimatedTime: '1 hour',
    }))

    const itinerary: Itinerary = {
      id: Date.now().toString(),
      name,
      items,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalDistance: '15 km',
      estimatedDuration: `${placeIds.length} hours`,
    }

    this.itineraries.push(itinerary)
    return itinerary
  }

  updateItinerary(itineraryId: string, updates: Partial<Itinerary>): Itinerary | null {
    const index = this.itineraries.findIndex(i => i.id === itineraryId)
    if (index !== -1) {
      this.itineraries[index] = { ...this.itineraries[index], ...updates, updatedAt: new Date() }
      return this.itineraries[index]
    }
    return null
  }

  deleteItinerary(itineraryId: string): void {
    this.itineraries = this.itineraries.filter(i => i.id !== itineraryId)
  }

  addPlaceToItinerary(itineraryId: string, placeId: string): void {
    const itinerary = this.itineraries.find(i => i.id === itineraryId)
    if (itinerary) {
      const maxOrder = Math.max(...itinerary.items.map(item => item.order), -1)
      itinerary.items.push({
        placeId,
        order: maxOrder + 1,
        estimatedTime: '1 hour',
      })
      itinerary.updatedAt = new Date()
    }
  }

  removePlaceFromItinerary(itineraryId: string, placeId: string): void {
    const itinerary = this.itineraries.find(i => i.id === itineraryId)
    if (itinerary) {
      itinerary.items = itinerary.items.filter(item => item.placeId !== placeId)
      itinerary.items.forEach((item, index) => item.order = index)
      itinerary.updatedAt = new Date()
    }
  }

  reorderItineraryItems(itineraryId: string, items: ItineraryItem[]): void {
    const itinerary = this.itineraries.find(i => i.id === itineraryId)
    if (itinerary) {
      itinerary.items = items.map((item, index) => ({ ...item, order: index }))
      itinerary.updatedAt = new Date()
    }
  }

  // User Profile
  getUserProfile(): UserProfile {
    return this.userProfile
  }

  updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    this.userProfile = { ...this.userProfile, ...updates }
    return this.userProfile
  }

  // Travel Statistics
  getTravelStats(): TravelStats {
    const allPlaces = mapService.getPlaces()
    const visitedPlaceIds = this.visitedPlaces.map(vp => vp.placeId)
    
    const heritageVisited = allPlaces
      .filter(p => p.category === 'heritage' && visitedPlaceIds.includes(p.id))
      .length
    
    const foodVisited = allPlaces
      .filter(p => p.category === 'food' && visitedPlaceIds.includes(p.id))
      .length
    
    const hiddenGemsVisited = allPlaces
      .filter(p => p.category === 'hidden' && visitedPlaceIds.includes(p.id))
      .length

    return {
      totalPlacesVisited: this.visitedPlaces.length,
      heritageVisited,
      foodVisited,
      hiddenGemsVisited,
      totalExplorationTime: `${this.visitedPlaces.length * 2} hours`,
      weeklyProgress: [2, 3, 1, 4, 2, 3, 2],
      monthlyProgress: [8, 12, 15, 10],
    }
  }

  // Recommendations
  getNextRecommendations(): Recommendation[] {
    const visitedPlaceIds = this.visitedPlaces.map(vp => vp.placeId)
    const savedPlaceIds = this.savedPlaces.map(sp => sp.placeId)
    
    const allPlaces = mapService.getPlaces()
    const unvisitedPlaces = allPlaces.filter(p => 
      !visitedPlaceIds.includes(p.id) && !savedPlaceIds.includes(p.id)
    )

    return unvisitedPlaces.slice(0, 3).map(place => ({
      placeId: place.id,
      reason: `Based on your interest in ${place.category} places`,
      score: Math.floor(Math.random() * 20) + 80,
    }))
  }
}

export const userService = new UserService()
