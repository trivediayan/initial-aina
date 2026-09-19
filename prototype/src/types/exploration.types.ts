// Exploration types for user activity tracking

export interface ExplorationRecord {
  placeId: string
  placeName: string
  category: string
  exploredAt: string // ISO date string
}

export interface AchievementDef {
  id: string
  title: string
  description: string
  icon: string // lucide icon name
  category: string | null // null = any category
  required: number
  badgeColor: string
  badgeBg: string
}

export interface AchievementProgress {
  def: AchievementDef
  current: number
  isUnlocked: boolean
  unlockedAt?: string
}

export interface Badge {
  id: string
  title: string
  icon: string
  color: string
  bg: string
  unlockedAt: string
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Explore your first place in Vadodara',
    icon: 'MapPin',
    category: null,
    required: 1,
    badgeColor: '#A0522D',
    badgeBg: '#FAF0E8',
  },
  {
    id: 'heritage-explorer',
    title: 'Heritage Explorer',
    description: 'Explore 5 heritage places',
    icon: 'Landmark',
    category: 'heritage',
    required: 5,
    badgeColor: '#7B4F2E',
    badgeBg: '#FEF3E8',
  },
  {
    id: 'food-explorer',
    title: 'Food Explorer',
    description: 'Explore 5 food spots',
    icon: 'UtensilsCrossed',
    category: 'food',
    required: 5,
    badgeColor: '#B7770D',
    badgeBg: '#FEF9E7',
  },
  {
    id: 'hidden-gem-hunter',
    title: 'Hidden Gem Hunter',
    description: 'Discover 3 hidden gems',
    icon: 'Gem',
    category: 'hidden',
    required: 3,
    badgeColor: '#1E7A50',
    badgeBg: '#E8F5F0',
  },
  {
    id: 'spiritual-explorer',
    title: 'Spiritual Explorer',
    description: 'Visit 5 spiritual places',
    icon: 'Flame',
    category: 'spiritual',
    required: 5,
    badgeColor: '#7B2D8B',
    badgeBg: '#F3EAF8',
  },
  {
    id: 'art-explorer',
    title: 'Art Explorer',
    description: 'Explore 5 art & culture places',
    icon: 'Palette',
    category: 'art',
    required: 5,
    badgeColor: '#1E5BAD',
    badgeBg: '#E8F2FE',
  },
  {
    id: 'vadodara-explorer',
    title: 'Vadodara Explorer',
    description: 'Explore 10 unique places in Vadodara',
    icon: 'Trophy',
    category: null,
    required: 10,
    badgeColor: '#C5973A',
    badgeBg: '#FDF6E8',
  },
]
