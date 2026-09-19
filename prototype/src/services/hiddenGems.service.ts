import type { HiddenGem } from '@/types/dashboard.types'

export const mockHiddenGems: HiddenGem[] = [
  {
    id: '1',
    name: 'Nyay Mandir',
    image: 'https://images.unsplash.com/photo-1580441712339-7210b84b017c?w=800',
    description: 'A magnificent Gothic-style building that houses the district court',
    culturalInformation: 'Built in 1896, this architectural marvel represents the judicial heritage of Vadodara',
    whyHidden: 'Many visitors focus on palaces and miss this stunning example of Gothic architecture',
    distance: '1.2 km',
    explorationTime: '30-45 minutes',
    bestTime: 'October to March',
    nearbyPlaces: ['Laxmi Vilas Palace', 'Kirti Mandir'],
    coordinates: [22.3112, 73.1745],
  },
  {
    id: '2',
    name: 'Khanderao Market',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
    description: 'Historic market building with stunning Indo-Saracenic architecture',
    culturalInformation: 'Built in 1906, this market was named after Maharaja Khanderao Gaekwad',
    whyHidden: 'Often overlooked as just a commercial building, but its architecture is extraordinary',
    distance: '0.8 km',
    explorationTime: '20-30 minutes',
    bestTime: 'Morning hours',
    nearbyPlaces: ['Sayaji Baug', 'Baroda Museum'],
    coordinates: [22.3078, 73.1798],
  },
  {
    id: '3',
    name: 'Sankheda Painted Houses',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    description: 'Traditional houses with vibrant painted walls depicting folk art',
    culturalInformation: 'These houses showcase the unique Sankheda painting tradition of Gujarat',
    whyHidden: 'Located in old city areas, these artistic houses are often missed by tourists',
    distance: '3.5 km',
    explorationTime: '1-2 hours',
    bestTime: 'Winter months',
    nearbyPlaces: ['Old City Market', 'Mandvi Gate'],
    coordinates: [22.3156, 73.1889],
  },
  {
    id: '4',
    name: 'Dabhoi Fort',
    image: 'https://images.unsplash.com/photo-1590669683217-78c00a3d6c50?w=800',
    description: 'Ancient fort with remarkable architectural features and historical significance',
    culturalInformation: 'Built in the 13th century, this fort is one of the finest examples of military architecture',
    whyHidden: 'Located 30km from Vadodara, this fort remains relatively undiscovered by mainstream tourists',
    distance: '30 km',
    explorationTime: '2-3 hours',
    bestTime: 'October to March',
    nearbyPlaces: ['Champaner', 'Pavagadh'],
    coordinates: [22.1833, 73.4333],
  },
  {
    id: '5',
    name: 'Makarpura Palace',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
    description: 'A smaller but elegant palace with Italian Renaissance influence',
    culturalInformation: 'Built as a summer retreat, this palace showcases European architectural influences',
    whyHidden: 'Less famous than Laxmi Vilas Palace, but equally beautiful and less crowded',
    distance: '5.2 km',
    explorationTime: '1 hour',
    bestTime: 'All year round',
    nearbyPlaces: ['Vadodara Railway Station', 'Airport'],
    coordinates: [22.2890, 73.1256],
  },
  {
    id: '6',
    name: 'Chhani Lake',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    description: 'Serene lake surrounded by lush greenery, perfect for peaceful walks',
    culturalInformation: 'A natural lake that has been part of Vadodara\'s landscape for centuries',
    whyHidden: 'Away from the main tourist circuit, offering tranquility away from the crowds',
    distance: '4.8 km',
    explorationTime: '1-2 hours',
    bestTime: 'Sunset hours',
    nearbyPlaces: ['Chhani Village', 'Agricultural University'],
    coordinates: [22.3456, 73.1234],
  },
]

const HIDDEN_GEMS_STORAGE_KEY = 'ayna-admin-hidden-gems'
const HIDDEN_GEMS_SEED_VERSION_KEY = 'ayna-admin-hidden-gems-seed-version'
const HIDDEN_GEMS_UPDATED_EVENT = 'ayna:hidden-gems-updated'

function notifyHiddenGemsUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(HIDDEN_GEMS_UPDATED_EVENT))
  }
}

function loadHiddenGemsStore(): HiddenGem[] {
  if (typeof window === 'undefined') return [...mockHiddenGems]

  try {
    const seedVersion = window.localStorage.getItem(HIDDEN_GEMS_SEED_VERSION_KEY)
    if (seedVersion !== '2') {
      window.localStorage.setItem(HIDDEN_GEMS_SEED_VERSION_KEY, '2')
      window.localStorage.setItem(HIDDEN_GEMS_STORAGE_KEY, JSON.stringify(mockHiddenGems))
      return [...mockHiddenGems]
    }

    const stored = window.localStorage.getItem(HIDDEN_GEMS_STORAGE_KEY)
    if (!stored) {
      window.localStorage.setItem(HIDDEN_GEMS_STORAGE_KEY, JSON.stringify(mockHiddenGems))
      return [...mockHiddenGems]
    }

    const parsed = JSON.parse(stored) as HiddenGem[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.setItem(HIDDEN_GEMS_STORAGE_KEY, JSON.stringify(mockHiddenGems))
      return [...mockHiddenGems]
    }

    return parsed
  } catch {
    return [...mockHiddenGems]
  }
}

let hiddenGemsStore = loadHiddenGemsStore()

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === HIDDEN_GEMS_STORAGE_KEY) {
      try {
        const stored = window.localStorage.getItem(HIDDEN_GEMS_STORAGE_KEY)
        hiddenGemsStore = stored ? (JSON.parse(stored) as HiddenGem[]) : []
      } catch {
        hiddenGemsStore = []
      }
      notifyHiddenGemsUpdated()
    }
  })
}

function persistHiddenGemsStore(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(HIDDEN_GEMS_STORAGE_KEY, JSON.stringify(hiddenGemsStore))
  }
  notifyHiddenGemsUpdated()
}

export const hiddenGemsService = {
  getHiddenGems: (): HiddenGem[] => {
    hiddenGemsStore = loadHiddenGemsStore()
    return hiddenGemsStore
  },

  getHiddenGemById: (id: string): HiddenGem | undefined => {
    hiddenGemsStore = loadHiddenGemsStore()
    return hiddenGemsStore.find(gem => gem.id === id)
  },

  createHiddenGem: (gem: HiddenGem): HiddenGem => {
    hiddenGemsStore = [...hiddenGemsStore, gem]
    persistHiddenGemsStore()
    return gem
  },

  updateHiddenGem: (id: string, updates: Partial<HiddenGem>): HiddenGem | undefined => {
    const index = hiddenGemsStore.findIndex(gem => gem.id === id)
    if (index === -1) return undefined
    const updated = { ...hiddenGemsStore[index], ...updates }
    hiddenGemsStore = hiddenGemsStore.map((gem, gemIndex) => gemIndex === index ? updated : gem)
    persistHiddenGemsStore()
    return updated
  },

  deleteHiddenGem: (id: string): boolean => {
    const nextGems = hiddenGemsStore.filter(gem => gem.id !== id)
    if (nextGems.length === hiddenGemsStore.length) return false
    hiddenGemsStore = nextGems
    persistHiddenGemsStore()
    return true
  },

  searchHiddenGems: (query: string): HiddenGem[] => {
    const lowerQuery = query.toLowerCase()
    return hiddenGemsStore.filter(gem => 
      gem.name.toLowerCase().includes(lowerQuery) ||
      gem.description.toLowerCase().includes(lowerQuery) ||
      gem.culturalInformation.toLowerCase().includes(lowerQuery)
    )
  },

  getNearbyHiddenGems: (): HiddenGem[] => {
    return hiddenGemsStore.slice(0, 3)
  },
}
