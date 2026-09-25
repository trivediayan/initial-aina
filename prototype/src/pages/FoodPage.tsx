import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Route, Wallet, Clock, Sparkles, Navigation, Check, Search } from 'lucide-react'
import { foodService } from '@/services/food.service'
import { explorationService } from '@/services/exploration.service'
import { useAuth } from '@/contexts/AuthContext'
import { useInternalNavigate } from '@/hooks/useInternalNavigate'
import { toDetailPath, toMapId } from '@/services/catalog.service'
import { SmartImage } from '@/components/ui/SmartImage'
import type { Food } from '@/types/dashboard.types'
import './FoodPage.css'

export function FoodPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const goToMap = useInternalNavigate()
  const [foodItems, setFoodItems] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFoodType, setSelectedFoodType] = useState<string>('all')
  const [exploredTick, setExploredTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    foodService
      .fetchFood()
      .then((data) => {
        if (!cancelled) {
          setFoodItems(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load food items.')
          setLoading(false)
        }
      })

    const syncFood = () => {
      if (!cancelled) {
        setFoodItems(foodService.getFood())
      }
    }
    window.addEventListener('ayna:food-updated', syncFood)

    return () => {
      cancelled = true
      window.removeEventListener('ayna:food-updated', syncFood)
    }
  }, [])

  const foodTypes = ['all', ...Array.from(new Set(foodItems.map((f) => f.foodType).filter(Boolean)))]

  const filteredFood = useMemo(() => {
    return foodItems.filter((food) => {
      const haystack = `${food.name} ${food.specialty} ${food.location} ${food.foodType}`.toLowerCase()
      const matchesSearch = !searchQuery.trim() || haystack.includes(searchQuery.toLowerCase())
      const matchesType = selectedFoodType === 'all' || food.foodType === selectedFoodType
      return matchesSearch && matchesType
    })
  }, [foodItems, searchQuery, selectedFoodType])

  const handleNavigate = (food: Food) => {
    goToMap({
      mapId: toMapId('food', food.id),
      coordinates: food.coordinates,
      name: food.name,
      description: food.specialty,
      category: 'food',
      image: food.image_url || food.image,
    })
  }

  const handleOpenDetails = (food: Food) => {
    navigate(toDetailPath('food', food.id))
  }

  const handleExplored = (food: Food) => {
    if (!user) return
    explorationService.markExplored(user.id, `food:${food.id}`, food.name, 'food')
    setExploredTick((n) => n + 1)
  }

  return (
    <div className="food-page">
      <div className="food-container">
        <div className="food-header">
          <div className="collection-hero-copy">
            <p className="page-kicker">02 / Taste the city</p>
            <h1>Local food</h1>
            <p>Vadodara and Gujarati flavours worth a detour</p>
          </div>
          <div className="collection-hero-stat">
            <strong>{loading ? '...' : filteredFood.length.toString().padStart(2, '0')}</strong>
            <span>places to eat</span>
          </div>
        </div>

        <div className="food-controls">
          <div className="search-bar page-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search food, neighbourhood, specialty…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="food-type-filters">
            <span className="filter-label">Browse by mood</span>
            {foodTypes.map((type) => (
              <button
                key={type}
                className={`type-filter ${selectedFoodType === type ? 'active' : ''}`}
                onClick={() => setSelectedFoodType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading authentic food spots...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p>Unable to load food spots: {error}</p>
          </div>
        ) : filteredFood.length === 0 ? (
          <div className="empty-state">
            <p>{foodItems.length === 0 ? 'No food items found.' : 'No matches. Try another search.'}</p>
          </div>
        ) : (
          <div className="food-grid">
            {filteredFood.map((food) => {
              const explored = user ? explorationService.isExplored(user.id, `food:${food.id}`) : false
              const displayImage = food.image_url || food.image
              return (
                <article
                  key={`${food.id}-${exploredTick}`}
                  className="food-card card"
                  role="link"
                  tabIndex={0}
                  onClick={() => handleOpenDetails(food)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') handleOpenDetails(food)
                  }}
                >
                  <SmartImage src={displayImage} alt={food.name} className="food-image" />
                  <div className="food-content">
                    <div className="food-header-row">
                      <h3 className="food-name">{food.name}</h3>
                      <span className="badge badge-food">{food.foodType}</span>
                    </div>
                    <p className="food-specialty">{food.specialty}</p>

                    <div className="food-details">
                      <div className="food-detail"><MapPin size={14} /> {food.location}</div>
                      <div className="food-detail"><Route size={14} /> {food.distance}</div>
                      <div className="food-detail"><Wallet size={14} /> {food.priceRange}</div>
                      <div className="food-detail"><Clock size={14} /> {food.openingHours}</div>
                    </div>

                    {food.whyAINARecommends && (
                      <div className="food-recommendation">
                        <Sparkles size={14} />
                        <p>{food.whyAINARecommends}</p>
                      </div>
                    )}

                    <div className="food-actions">
                      <button className="btn btn-secondary" onClick={(event) => { event.stopPropagation(); handleExplored(food) }} disabled={explored}>
                        <Check size={15} /> {explored ? 'Explored' : "I've explored this"}
                      </button>
                      <button className="btn btn-primary" onClick={(event) => { event.stopPropagation(); handleNavigate(food) }}>
                        <Navigation size={15} /> Navigate
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
