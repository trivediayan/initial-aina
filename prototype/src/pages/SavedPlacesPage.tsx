import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Bookmark, BookmarkMinus, Eye, Navigation, Sparkles } from 'lucide-react'
import { userService } from '@/services/user.service'
import { mapService } from '@/services/map.service'
import { useInternalNavigate } from '@/hooks/useInternalNavigate'
import { toMapId } from '@/services/catalog.service'
import { SmartImage } from '@/components/ui/SmartImage'
import type { SavedPlace } from '@/types/dashboard.types'
import './SavedPlacesPage.css'

export function SavedPlacesPage() {
  const navigate = useNavigate()
  const goToMap = useInternalNavigate()
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([])

  useEffect(() => {
    setSavedPlaces(userService.getSavedPlaces())
  }, [])

  const handleUnsave = (placeId: string) => {
    userService.unsavePlace(placeId)
    setSavedPlaces(userService.getSavedPlaces())
  }

  const places = savedPlaces
    .map((sp) => mapService.getPlaceById(sp.placeId))
    .filter((place): place is NonNullable<typeof place> => place !== undefined)
  const featuredPlace = places[0]
  const otherPlaces = places.slice(1)

  return (
    <div className="saved-places-page">
      <div className="saved-places-container">
        <div className="page-header">
          <div>
            <p className="page-kicker">02 / Your collection</p>
            <h1>Saved places</h1>
            <p>Keep a shortlist for later</p>
          </div>
          <span className="page-header-count">{places.length.toString().padStart(2, '0')} saved</span>
        </div>

        {places.length === 0 ? (
          <div className="empty-state">
            <h3>Nothing saved yet</h3>
            <p>Save a place from its detail page to see it here.</p>
          </div>
        ) : (
          <>
            <div className="saved-collection-intro">
              <div className="saved-collection-medallion"><Bookmark size={23} /></div>
              <div>
                <span className="saved-collection-kicker"><Sparkles size={13} /> Your shortlist</span>
                <h2>Places waiting for your next day out.</h2>
                <p>Keep the spark alive. These are the corners of Vadodara you chose not to forget.</p>
              </div>
              <button type="button" onClick={() => navigate('/dashboard')}>Find another place <ArrowRight size={15} /></button>
            </div>

            {featuredPlace && (
              <section className="saved-featured-card">
                <SmartImage src={featuredPlace.image} alt={featuredPlace.name} className="saved-featured-image" />
                <div className="saved-featured-content">
                  <span className="saved-featured-kicker">Saved first / {featuredPlace.category}</span>
                  <h2>{featuredPlace.name}</h2>
                  <p>{featuredPlace.description}</p>
                  <div className="saved-featured-actions">
                    <button className="saved-primary-action" onClick={() => navigate(`/place/${featuredPlace.id}`)}>Open place <ArrowUpRight size={15} /></button>
                    <button className="saved-quiet-action" onClick={() => handleUnsave(featuredPlace.id)}><BookmarkMinus size={14} /> Remove</button>
                  </div>
                </div>
              </section>
            )}

            {otherPlaces.length > 0 && <div className="saved-list-heading"><div><span className="page-kicker">Keep the list alive</span><h2>More places to return to</h2></div><span>{otherPlaces.length.toString().padStart(2, '0')} saved</span></div>}

          <div className="places-grid saved-places-grid">
            {otherPlaces.map((place, index) => (
              <article key={place.id} className="place-card card" onClick={() => navigate(`/place/${place.id}`)}>
                <div className="saved-card-image-wrap"><SmartImage src={place.image} alt={place.name} className="place-image" /><span className="saved-card-number">{String(index + 2).padStart(2, '0')}</span><span className="saved-card-bookmark"><Bookmark size={14} fill="currentColor" /></span></div>
                <div className="place-content">
                  <h3 className="place-name">{place.name}</h3>
                  <p className={`place-category place-category-${place.category}`}>{place.category}</p>
                  <p className="place-description">{place.description}</p>
                  <div className="place-actions">
                    <button className="btn btn-ghost" onClick={(event) => { event.stopPropagation(); handleUnsave(place.id) }}>
                      <BookmarkMinus size={15} /> Unsave
                    </button>
                    <button className="btn btn-secondary" onClick={(event) => { event.stopPropagation(); navigate(`/place/${place.id}`) }}>
                      <Eye size={15} /> Details
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={(event) => { event.stopPropagation(); goToMap({
                        mapId: toMapId('place', place.id),
                        coordinates: place.coordinates,
                        name: place.name,
                        description: place.description,
                        category: place.layer === 'spiritual' ? 'spiritual' : place.layer === 'art' ? 'art' : place.layer === 'hidden_gems' ? 'hidden' : 'heritage',
                        image: place.image_url || place.image,
                      })}}
                    >
                      <Navigation size={15} /> Navigate
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  )
}
