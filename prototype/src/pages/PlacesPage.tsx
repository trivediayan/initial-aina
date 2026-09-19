import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, MapPin, Navigation, Search, Check, Sparkles } from 'lucide-react'
import { mapService } from '@/services/map.service'
import { explorationService } from '@/services/exploration.service'
import { useAuth } from '@/contexts/AuthContext'
import { useInternalNavigate } from '@/hooks/useInternalNavigate'
import { toDetailPath, toMapId } from '@/services/catalog.service'
import { SmartImage } from '@/components/ui/SmartImage'
import type { Place } from '@/types/dashboard.types'
import './FoodPage.css'
import './PlacesPage.css'

type PlacesPageProps = {
  category: 'heritage' | 'spiritual' | 'art'
}

const categoryCopy: Record<PlacesPageProps['category'], { title: string; subtitle: string; kicker: string }> = {
  heritage: {
    title: 'Heritage places',
    subtitle: 'Stories, structures, and landmarks that hold Vadodara together',
    kicker: '03 / Read the city',
  },
  spiritual: {
    title: 'Spiritual places',
    subtitle: 'Temples, shrines, and quiet places for reflection',
    kicker: '04 / Find stillness',
  },
  art: {
    title: 'Art places',
    subtitle: 'Museums, galleries, and collections worth making time for',
    kicker: '05 / See more',
  },
}

export function PlacesPage({ category }: PlacesPageProps) {
  const navigate = useNavigate()
  const goToMap = useInternalNavigate()
  const { user } = useAuth()
  const [places, setPlaces] = useState<Place[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [exploredTick, setExploredTick] = useState(0)
  const copy = categoryCopy[category]

  useEffect(() => {
    const syncPlaces = () => setPlaces(mapService.getPlaces(category))
    syncPlaces()
    window.addEventListener('ayna:places-updated', syncPlaces)
    return () => window.removeEventListener('ayna:places-updated', syncPlaces)
  }, [category])

  const filteredPlaces = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return places
    return places.filter((place) =>
      `${place.name} ${place.description} ${place.address ?? ''} ${place.architecture ?? ''}`
        .toLowerCase()
        .includes(query),
    )
  }, [places, searchQuery])

  const handleNavigate = (place: Place) => {
    goToMap({
      mapId: toMapId('place', place.id),
      coordinates: place.coordinates,
      name: place.name,
      description: place.description,
      category: place.category === 'all' ? 'heritage' : place.category,
      image: place.image,
    })
  }

  const handleExplored = (place: Place) => {
    if (!user) return
    explorationService.markExplored(user.id, place.id, place.name, place.category)
    setExploredTick((tick) => tick + 1)
  }

  return (
    <div className="food-page places-page">
      <div className="food-container">
        <div className="food-header">
          <div className="collection-hero-copy">
            <p className="page-kicker">{copy.kicker}</p>
            <h1>{copy.title}</h1>
            <p>{copy.subtitle}</p>
          </div>
          <div className="collection-hero-stat">
            <strong>{filteredPlaces.length.toString().padStart(2, '0')}</strong>
            <span>places to explore</span>
          </div>
        </div>

        <div className="food-controls">
          <div className="search-bar page-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder={`Search ${copy.title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="search-input"
            />
          </div>
          <div className="places-category-note">
            <Sparkles size={15} /> Showing every {category} place from Supabase
          </div>
        </div>

        {filteredPlaces.length === 0 ? (
          <div className="empty-state">
            <p>{places.length === 0 ? 'No places have been added in this category yet.' : 'No matches. Try another search.'}</p>
          </div>
        ) : (
          <div className="food-grid">
            {filteredPlaces.map((place) => {
              const explored = user ? explorationService.isExplored(user.id, place.id) : false
              return (
                <article
                  key={`${place.id}-${exploredTick}`}
                  className="food-card card"
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(toDetailPath('place', place.id))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') navigate(toDetailPath('place', place.id))
                  }}
                >
                  <SmartImage src={place.image} alt={place.name} className="food-image" />
                  <div className="food-content">
                    <div className="food-header-row">
                      <h3 className="food-name">{place.name}</h3>
                      <span className="badge badge-heritage">{category}</span>
                    </div>
                    <p className="food-specialty">{place.description}</p>
                    <div className="food-details">
                      {place.address && <div className="food-detail"><MapPin size={14} /> {place.address}</div>}
                      {place.openingHours && <div className="food-detail"><Clock size={14} /> {place.openingHours}</div>}
                    </div>
                    {place.architecture && (
                      <div className="food-recommendation">
                        <Sparkles size={14} />
                        <p>{place.architecture}</p>
                      </div>
                    )}
                    <div className="food-actions">
                      <button className="btn btn-secondary" onClick={(event) => { event.stopPropagation(); handleExplored(place) }} disabled={explored}>
                        <Check size={15} /> {explored ? 'Explored' : "I've explored this"}
                      </button>
                      <button className="btn btn-primary" onClick={(event) => { event.stopPropagation(); handleNavigate(place) }}>
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
