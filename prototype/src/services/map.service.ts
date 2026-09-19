import type { Place, PlaceCategory } from '@/types/dashboard.types'
import { supabase } from '@/lib/supabase'

export const mockPlaces: Place[] = [
  {
    id: '1',
    name: 'Laxmi Vilas Palace',
    category: 'heritage',
    coordinates: [22.3174, 73.1656],
    description: 'One of the largest private residences in the world, built by Maharaja Sayajirao Gaekwad III',
    rating: 4.8,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Lakshmi_Vilas_Palace.jpg/1280px-Lakshmi_Vilas_Palace.jpg',
    history: 'Built between 1878 and 1890, this magnificent palace was commissioned by Maharaja Sayajirao Gaekwad III and designed by Major Charles Mant.',
    historicalSignificance: 'The palace represents the grandeur of the Gaekwad dynasty and showcases Indo-Saracenic architecture.',
    architecture: 'Indo-Saracenic style with elements of Rajput, Mughal, and European architecture. Features include ornate domes, arches, and intricate carvings.',
    culturalSignificance: 'Served as the royal residence and continues to be a symbol of Vadodara\'s cultural heritage.',
    interestingFacts: [
      'Four times the size of Buckingham Palace',
      'Features a collection of paintings by Raja Ravi Varma',
      'Houses the Maharaja Fateh Singh Museum',
      'Still partially occupied by the royal family'
    ],
    historicalImages: ['https://images.unsplash.com/photo-1590669683217-78c00a3d6c50?w=800'],
    address: 'Race Course Road, Vadodara, Gujarat 390001',
    estimatedExplorationTime: '2-3 hours',
    bestTime: 'October to March',
    openingHours: '9:00 AM - 5:00 PM (Closed on Mondays)',
    thingsToSee: [
      'Darbar Hall with its grand chandeliers',
      'Maharaja Fateh Singh Museum',
      'Palace gardens and fountains',
      'Royal collection of artifacts'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
      'https://images.unsplash.com/photo-1590669683217-78c00a3d6c50?w=800'
    ]
  },
  {
    id: '2',
    name: 'Sayaji Baug',
    category: 'heritage',
    coordinates: [22.3076, 73.1812],
    description: 'A sprawling garden complex built by Maharaja Sayajirao Gaekwad III in 1879',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80&auto=format&fit=crop',
    history: 'Established in 1879 by Maharaja Sayajirao Gaekwad III, it was originally called Kamati Baug.',
    historicalSignificance: 'One of the oldest public gardens in Gujarat, representing the royal commitment to public welfare.',
    architecture: 'Victorian garden design with Indian elements, featuring manicured lawns and flower beds.',
    culturalSignificance: 'A popular recreational space for Vadodara residents and a venue for cultural events.',
    interestingFacts: [
      'Contains over 100 species of plants',
      'Houses the Baroda Museum and Picture Gallery',
      'Features a toy train that runs through the garden',
      'Spread over 100 acres'
    ],
    address: 'Sayaji Baug, Vadodara, Gujarat 390001',
    estimatedExplorationTime: '1-2 hours',
    bestTime: 'November to February',
    openingHours: '5:00 AM - 9:00 PM',
    thingsToSee: [
      'Baroda Museum and Picture Gallery',
      'Toy train ride',
      'Flower clock',
      'Zoo within the garden'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
    ]
  },
  {
    id: '3',
    name: 'EME Temple',
    category: 'spiritual',
    coordinates: [22.2996, 73.1503],
    description: 'A unique temple dedicated to the Indian Army, built in the shape of a geodesic dome',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1609766858260-64a8f6d593cb?w=800',
    history: 'Built in 1966 by the Indian Army\'s Electrical and Mechanical Engineering (EME) corps.',
    historicalSignificance: 'Represents the fusion of modern architecture with spiritual devotion.',
    architecture: 'Geodesic dome structure covered with aluminum sheets, designed to resemble a lotus.',
    culturalSignificance: 'A symbol of secularism and respect for all religions within the armed forces.',
    interestingFacts: [
      'Built entirely by army personnel',
      'Features symbols from all major religions',
      'No traditional temple priest',
      'Managed by the Indian Army'
    ],
    address: 'EME Temple, Fatehgunj, Vadodara, Gujarat 390002',
    estimatedExplorationTime: '30-45 minutes',
    bestTime: 'All year round',
    openingHours: '6:00 AM - 8:00 PM',
    thingsToSee: [
      'Unique geodesic dome architecture',
      'Symbols of major religions',
      'Peaceful meditation area',
      'Army memorial'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1609766858260-64a8f6d593cb?w=800'
    ]
  },
  {
    id: '4',
    name: 'Kirti Mandir',
    category: 'spiritual',
    coordinates: [22.3124, 73.1756],
    description: 'A memorial temple dedicated to Maharaja Sayajirao Gaekwad III',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
    history: 'Built in 1936 as a memorial to Maharaja Sayajirao Gaekwad III.',
    historicalSignificance: 'Commemorates the visionary ruler who modernized Vadodara.',
    architecture: 'Traditional Hindu temple architecture with marble carvings and shikhara.',
    culturalSignificance: 'A place of worship and a monument to the royal legacy of Vadodara.',
    interestingFacts: [
      'Contains paintings of the Gaekwad dynasty',
      'Features intricate marble work',
      'Built entirely in white marble',
      'Houses the royal family\'s memorial'
    ],
    address: 'Kirti Mandir, Vadodara, Gujarat 390001',
    estimatedExplorationTime: '30-45 minutes',
    bestTime: 'October to March',
    openingHours: '6:00 AM - 9:00 PM',
    thingsToSee: [
      'Marble carvings and sculptures',
      'Paintings of royal family',
      'Peaceful prayer hall',
      'Royal memorial'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800'
    ]
  },
  {
    id: '5',
    name: 'Baroda Museum and Picture Gallery',
    category: 'art',
    coordinates: [22.3089, 73.1808],
    description: 'A treasure trove of art, artifacts, and historical collections',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1577017029454-2ea44e62f2a2?w=800',
    history: 'Established in 1894 by Maharaja Sayajirao Gaekwad III.',
    historicalSignificance: 'One of the oldest museums in Gujarat, preserving the region\'s cultural heritage.',
    architecture: 'Indo-Saracenic style with large galleries and natural lighting.',
    culturalSignificance: 'Showcases Gujarat\'s artistic heritage and the royal collection.',
    interestingFacts: [
      'Contains Egyptian mummy',
      'Houses Raja Ravi Varma paintings',
      'Features Japanese art collection',
      'Has a skeleton of a blue whale'
    ],
    address: 'Sayaji Baug, Vadodara, Gujarat 390001',
    estimatedExplorationTime: '1-2 hours',
    bestTime: 'All year round',
    openingHours: '10:00 AM - 5:00 PM (Closed on Mondays)',
    thingsToSee: [
      'Egyptian mummy',
      'Raja Ravi Varma paintings',
      'Japanese art collection',
      'Archaeological artifacts'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1577017029454-2ea44e62f2a2?w=800'
    ]
  },
  {
    id: '6',
    name: 'Sursagar Lake',
    category: 'heritage',
    coordinates: [22.3025, 73.1776],
    description: 'A historic lake built by Shri Sursinhji Takhtasinhji Gohil',
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1477587458883-47145f3a7e28?w=1200&q=80&auto=format&fit=crop',
    history: 'Built in the 18th century, this lake has been a center of cultural and recreational activities.',
    historicalSignificance: 'Represents the water management and urban planning of historical Vadodara.',
    architecture: 'Traditional reservoir design with surrounding gardens and walkways.',
    culturalSignificance: 'A popular spot for evening walks and cultural events.',
    interestingFacts: [
      'Named after poet Shri Sursinhji',
      'Features a musical fountain',
      'Surrounded by landscaped gardens',
      'Home to various bird species'
    ],
    address: 'Sursagar Lake, Vadodara, Gujarat 390001',
    estimatedExplorationTime: '30-45 minutes',
    bestTime: 'October to March',
    openingHours: '6:00 AM - 9:00 PM',
    thingsToSee: [
      'Musical fountain',
      'Walkway around the lake',
      'Gardens and seating areas',
      'Evening lighting'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
    ]
  },
  {
    id: '7',
    name: 'Nazarbaug Palace',
    category: 'architecture',
    coordinates: [22.3145, 73.1762],
    description: 'A historic palace known for its architectural beauty and royal collections',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
    history: 'Built in the late 19th century by Maharaja Sayajirao Gaekwad III.',
    historicalSignificance: 'Showcases the architectural prowess and artistic sensibilities of the Gaekwad dynasty.',
    architecture: 'Indo-European style with ornate balconies, arches, and decorative elements.',
    culturalSignificance: 'Former royal residence and now a museum housing royal artifacts.',
    interestingFacts: [
      'Features royal collection of jewelry',
      'Houses antique weapons',
      'Contains vintage photographs',
      'Named after the royal Nazar (gift) tradition'
    ],
    address: 'Nazarbaug Palace, Vadodara, Gujarat 390001',
    estimatedExplorationTime: '1 hour',
    bestTime: 'October to March',
    openingHours: '10:00 AM - 5:00 PM (Closed on Sundays)',
    thingsToSee: [
      'Royal jewelry collection',
      'Antique weapons',
      'Vintage photographs',
      'Architectural details'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800'
    ]
  },
  {
    id: '8',
    name: 'Champaner-Pavagadh Archaeological Park',
    category: 'heritage',
    coordinates: [22.4833, 73.5167],
    description: 'UNESCO World Heritage site with ancient ruins and temples',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1580441712339-7210b84b017c?w=800',
    history: 'Ancient capital of Gujarat, dating back to the 8th century.',
    historicalSignificance: 'UNESCO World Heritage site representing pre-Mughal Islamic architecture.',
    architecture: 'Blend of Hindu and Islamic architectural styles with intricate carvings.',
    culturalSignificance: 'Sacred pilgrimage site and important archaeological discovery.',
    interestingFacts: [
      'UNESCO World Heritage site',
      'Contains over 100 monuments',
      'Features Kalika Mata Temple',
      'Includes ancient water systems'
    ],
    address: 'Champaner, Gujarat 391230',
    estimatedExplorationTime: '3-4 hours',
    bestTime: 'October to March',
    openingHours: '6:00 AM - 6:00 PM',
    thingsToSee: [
      'Kalika Mata Temple',
      'Jama Masjid',
      'Ancient fortifications',
      'Royal gardens'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1580441712339-7210b84b017c?w=800'
    ]
  },
]

const PLACES_UPDATED_EVENT = 'ayna:places-updated'

type PlaceRow = {
  id: string
  name: string
  category: string
  description: string
  coordinates: unknown
  image?: string
  image_url?: string
  latitude?: number
  longitude?: number
  rating?: number
  history?: string
  historical_significance?: string
  architecture?: string
  cultural_significance?: string
  interesting_facts?: string[]
  historical_images?: string[]
  address?: string
  estimated_exploration_time?: string
  best_time?: string
  opening_hours?: string
  things_to_see?: string[]
  gallery?: string[]
  historical_period?: string
  architectural_style?: string
  why_interesting?: string
  best_for?: string[]
  best_time_to_visit?: string
}

function normalizeCategory(category: string): Place['category'] {
  const value = category.trim().toLowerCase()
  if (['heritage', 'architecture', 'spiritual', 'art', 'food', 'hidden'].includes(value)) {
    return value as Place['category']
  }
  if (value.includes('food') || value.includes('restaurant') || value.includes('cafe')) {
    return 'food'
  }
  if (value.includes('hidden') || value.includes('gem')) {
    return 'hidden'
  }
  if (value.includes('temple') || value.includes('shrine') || value.includes('mosque')) {
    return 'spiritual'
  }
  if (value.includes('museum') || value.includes('gallery') || value.includes('art')) {
    return 'art'
  }
  return 'heritage'
}

function notifyPlacesUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PLACES_UPDATED_EVENT))
  }
}

function toCoordinates(row: PlaceRow): [number, number] {
  if (Array.isArray(row.coordinates) && row.coordinates.length >= 2) {
    return [Number(row.coordinates[0]), Number(row.coordinates[1])]
  }

  if (typeof row.coordinates === 'object' && row.coordinates !== null) {
    const coordinates = row.coordinates as Record<string, unknown>
    const latitude = coordinates.latitude ?? coordinates.lat
    const longitude = coordinates.longitude ?? coordinates.lng ?? coordinates.lon
    return [Number(latitude), Number(longitude)]
  }

  return [Number(row.latitude), Number(row.longitude)]
}

let placeStore: Place[] = [...mockPlaces]

function persistPlaces(): void {
  notifyPlacesUpdated()
}

function toPlace(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    category: normalizeCategory(row.category),
    coordinates: toCoordinates(row),
    description: row.description,
    rating: Number(row.rating ?? 0),
    image: row.image ?? row.image_url,
    history: row.history ?? row.historical_period,
    historicalSignificance: row.historical_significance,
    architecture: row.architecture ?? row.architectural_style,
    culturalSignificance: row.cultural_significance ?? row.why_interesting,
    interestingFacts: row.interesting_facts ?? row.best_for,
    historicalImages: row.historical_images,
    address: row.address,
    estimatedExplorationTime: row.estimated_exploration_time,
    openingHours: row.opening_hours,
    bestTime: row.best_time ?? row.best_time_to_visit,
    thingsToSee: row.things_to_see,
    gallery: row.gallery,
  }
}

function toPlaceRow(place: Place): Record<string, unknown> {
  return {
    id: place.id,
    name: place.name,
    category: place.category,
    latitude: place.coordinates[0],
    longitude: place.coordinates[1],
    description: place.description,
    rating: place.rating,
    image_url: place.image,
    historical_period: place.history,
    architectural_style: place.architecture,
    why_interesting: place.culturalSignificance,
    best_for: place.interestingFacts,
    address: place.address,
    estimated_exploration_time: place.estimatedExplorationTime,
    opening_hours: place.openingHours,
    best_time_to_visit: place.bestTime,
  }
}

export async function hydratePlacesFromSupabase(): Promise<void> {
  if (!supabase) return

  const { data, error } = await supabase
    .from('places')
    .select('*')
    .order('created_at', { ascending: true })

  if (error || !data) {
    console.error('Failed to load places from Supabase:', error?.message)
    return
  }

  placeStore = (data as PlaceRow[]).map(toPlace)
  notifyPlacesUpdated()
}

export const mapService = {
  getPlaces: (category?: PlaceCategory): Place[] => {
    if (!category || category === 'all') {
      return placeStore
    }
    return placeStore.filter(place => place.category === category)
  },

  getPlaceById: (id: string): Place | undefined => {
    return placeStore.find(place => place.id === id)
  },

  searchPlaces: (query: string): Place[] => {
    const lowerQuery = query.toLowerCase()
    return placeStore.filter(place => 
      place.name.toLowerCase().includes(lowerQuery) ||
      place.description.toLowerCase().includes(lowerQuery) ||
      place.history?.toLowerCase().includes(lowerQuery) ||
      place.architecture?.toLowerCase().includes(lowerQuery)
    )
  },

  getNearbyPlaces: (placeId: string, category?: PlaceCategory): Place[] => {
    const currentPlace = placeStore.find(p => p.id === placeId)
    if (!currentPlace) return []
    
    const nearby = placeStore
      .filter(p => p.id !== placeId)
      .filter(p => {
        if (category && category !== 'all') {
          return p.category === category
        }
        return true
      })
      .slice(0, 3)
    
    return nearby
  },

  createPlace: async (place: Place): Promise<Place> => {
    if (supabase) {
      const { error } = await supabase.from('places').insert(toPlaceRow(place))
      if (error) throw new Error(`Failed to save place: ${error.message}`)
    }
    placeStore = [...placeStore, place]
    persistPlaces()
    return place
  },

  updatePlace: async (id: string, updates: Partial<Place>): Promise<Place | undefined> => {
    const index = placeStore.findIndex(place => place.id === id)
    if (index === -1) return undefined
    const updated = { ...placeStore[index], ...updates }
    if (supabase) {
      const { error } = await supabase.from('places').update(toPlaceRow(updated)).eq('id', id)
      if (error) throw new Error(`Failed to update place: ${error.message}`)
    }
    placeStore = placeStore.map((place, placeIndex) => placeIndex === index ? updated : place)
    persistPlaces()
    return updated
  },

  deletePlace: async (id: string): Promise<boolean> => {
    const nextPlaces = placeStore.filter(place => place.id !== id)
    if (nextPlaces.length === placeStore.length) return false
    if (supabase) {
      const { error } = await supabase.from('places').delete().eq('id', id)
      if (error) throw new Error(`Failed to delete place: ${error.message}`)
    }
    placeStore = nextPlaces
    persistPlaces()
    return true
  },
}
