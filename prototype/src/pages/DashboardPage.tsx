import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Compass, Layers3, MapPinned, Sparkles } from 'lucide-react'
import { Map } from '@/components/dashboard/Map'
import { getMapItems, toDetailPath, type MapItem } from '@/services/catalog.service'
import { mapService } from '@/services/map.service'
import { foodService } from '@/services/food.service'
import { useMap } from '@/contexts/MapContext'
import type { PlaceCategory } from '@/types/dashboard.types'
import './DashboardPage.css'

const categoryOptions: { id: PlaceCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'heritage', label: 'Heritage' },
  { id: 'spiritual', label: 'Spiritual' },
  { id: 'art', label: 'Art' },
  { id: 'food', label: 'Food' },
  { id: 'hidden', label: 'Hidden Gems' },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { navigateToPlace } = useMap()

  const [recommendationPlaces, setRecommendationPlaces] = useState<MapItem[]>([])

  useEffect(() => {
    void mapService.fetchAllPlaces()
    void foodService.fetchFood()
  }, [])

  useEffect(() => {
    const syncRecommendations = () => {
      const baseItems = getMapItems(selectedCategory)
      const query = searchQuery.trim().toLowerCase()

      const filtered = query
        ? baseItems.filter((item) => {
            const haystack = `${item.name} ${item.description} ${item.category}`.toLowerCase()
            return haystack.includes(query)
          })
        : baseItems

      setRecommendationPlaces(filtered.slice(0, 10))
    }

    syncRecommendations()
    window.addEventListener('ayna:places-updated', syncRecommendations)
    window.addEventListener('ayna:food-updated', syncRecommendations)
    return () => {
      window.removeEventListener('ayna:places-updated', syncRecommendations)
      window.removeEventListener('ayna:food-updated', syncRecommendations)
    }
  }, [selectedCategory, searchQuery])

  const featuredPlace = recommendationPlaces[0]
  const nearbyPlaces = recommendationPlaces.slice(1, 5)

  const focusPlace = (place: MapItem) => {
    navigateToPlace({
      mapId: place.mapId,
      coordinates: place.coordinates,
      name: place.name,
      description: place.description,
      category: place.category,
      image: place.image,
    })
  }

  const openDetails = (place: MapItem) => {
    navigate(toDetailPath(place.kind, place.sourceId))
  }

  return (
    <section className="dashboard-map-shell">
      <div className="explore-header">
        <div className="explore-heading-block">
          <p className="eyebrow"><span className="eyebrow-mark" /> Vadodara / City atlas</p>
          <div className="explore-title-line">
            <h1>Find your way through the city.</h1>
            <span className="explore-live-badge"><span /> Live map</span>
          </div>
          <p className="explore-subtitle">
            A living map of landmark streets, local flavors, and places worth slowing down for.
          </p>
        </div>
        <div className="explore-header-meta" aria-label="Explore map summary">
          <div className="explore-stat">
            <strong>{recommendationPlaces.length.toString().padStart(2, '0')}</strong>
            <span>places in view</span>
          </div>
          <div className="explore-header-icon" aria-hidden="true">
            <Compass size={22} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className="explore-invitation">
        <div className="invitation-mark"><Sparkles size={17} /></div>
        <div className="invitation-copy">
          <span>Today in Vadodara</span>
          <strong>Take the long way home.</strong>
          <p>Pick one place, follow your curiosity, and let the city fill in the rest.</p>
        </div>
        <button type="button" className="invitation-action" onClick={() => featuredPlace && openDetails(featuredPlace)}>
          Start wandering <ArrowRight size={16} />
        </button>
      </div>

      <div className="explore-map-panel">
        <div className="map-panel-bar">
          <div className="map-panel-title">
            <MapPinned size={16} strokeWidth={1.8} />
            <span>Vadodara field guide</span>
          </div>
          <div className="map-panel-context">
            <span className="map-panel-dot" />
            {selectedCategory === 'all' ? 'All places' : selectedCategory}
          </div>
        </div>
        <Map
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
        <div className="map-panel-footer">
          <span><Layers3 size={14} /> Explore by layer</span>
          <span>Drag the map to wander <ArrowUpRight size={14} /></span>
        </div>
      </div>

      <div className="explore-layer-row">
        <div className="layer-row-heading">
          <span className="layer-index">01</span>
          <div>
            <p>Choose a layer</p>
            <span>Shape the map around your mood</span>
          </div>
        </div>
        <div className="category-selector-card" role="tablist" aria-label="Map categories">
          {categoryOptions.map((category) => (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === category.id}
              className={`category-selector-button ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="explore-recommendations">
        <div className="recommendation-header">
          <div className="recommendation-heading">
            <span className="layer-index">02</span>
            <div>
              <p className="section-kicker">Curated nearby</p>
              <h2>Places to put on your route</h2>
            </div>
          </div>
          <span className="recommendation-context">
            {selectedCategory === 'all' ? 'All layers' : selectedCategory}
          </span>
        </div>

        {recommendationPlaces.length === 0 ? (
          <div className="empty-recommendations">
            <p>No places match this search. Try another category or keyword.</p>
          </div>
        ) : (
          <div className="recommendation-layout">
            {featuredPlace && (
              <article className="featured-place-card">
                <div
                  className="featured-place-image"
                  style={{ backgroundImage: `url(${featuredPlace.image})` }}
                >
                  <div className="featured-place-overlay">
                    <span className="recommendation-tag">Editor&apos;s pick</span>
                    {featuredPlace.rating && <span className="featured-rating">★ {featuredPlace.rating.toFixed(1)}</span>}
                  </div>
                </div>
                <div className="featured-place-body">
                  <div>
                    <span className="featured-route-note">Your first stop</span>
                    <span className="place-category-label">{featuredPlace.category}</span>
                    <h3>{featuredPlace.name}</h3>
                    <p>{featuredPlace.description}</p>
                  </div>
                  <button type="button" className="map-focus-button" onClick={() => focusPlace(featuredPlace)}>
                    <MapPinned size={15} />
                    Show on map
                  </button>
                  <button type="button" className="details-link-button" onClick={() => openDetails(featuredPlace)}>
                    Full details <ArrowUpRight size={14} />
                  </button>
                </div>
              </article>
            )}

            <div className="nearby-place-list">
              <div className="nearby-list-heading">
                <span>More to explore</span>
                <span>{nearbyPlaces.length.toString().padStart(2, '0')} results</span>
              </div>
              {nearbyPlaces.map((place) => (
                <button
                  key={place.mapId}
                  type="button"
                  className="nearby-place-item"
                  onClick={() => openDetails(place)}
                >
                  <span
                    className="nearby-place-image"
                    style={{ backgroundImage: `url(${place.image})` }}
                    aria-hidden="true"
                  />
                  <span className="nearby-place-copy">
                    <span className="place-category-label">{place.category}</span>
                    <strong>{place.name}</strong>
                    <span>{place.description}</span>
                  </span>
                  <ArrowUpRight className="nearby-place-arrow" size={17} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
