import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, Bookmark, BookmarkCheck, Check, Navigation, MapPin, Clock, Utensils, ArrowUpRight, Sparkles } from 'lucide-react'
import { mapService } from '@/services/map.service'
import { foodService } from '@/services/food.service'
import { hiddenGemsService } from '@/services/hiddenGems.service'
import { userService } from '@/services/user.service'
import { explorationService } from '@/services/exploration.service'
import { useAuth } from '@/contexts/AuthContext'
import { useInternalNavigate } from '@/hooks/useInternalNavigate'
import { toDetailPath, toMapId } from '@/services/catalog.service'
import { SmartImage } from '@/components/ui/SmartImage'
import type { Place, Food, HiddenGem } from '@/types/dashboard.types'
import './PlaceDetailPage.css'

export function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const goToMap = useInternalNavigate()
  const [saved, setSaved] = useState(false)
  const [explored, setExplored] = useState(false)
  const [loading, setLoading] = useState(true)

  const [place, setPlace] = useState<Place | undefined>(undefined)
  const [food, setFood] = useState<Food | undefined>(undefined)
  const [gem, setGem] = useState<HiddenGem | undefined>(undefined)

  const decodedId = decodeURIComponent(id || '')
  const detailMatch = decodedId.match(/^(place|food|gem)-(.+)$/)
  const detailKind = detailMatch?.[1] || 'place'
  const sourceId = detailMatch?.[2] || decodedId

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function loadDetail() {
      if (detailKind === 'food') {
        let f = foodService.getFoodById(sourceId)
        if (!f) {
          const fetched = await foodService.fetchFoodById(sourceId)
          if (fetched) f = fetched
          else {
            await foodService.fetchFood()
            f = foodService.getFoodById(sourceId)
          }
        }
        if (!cancelled) {
          setFood(f)
          setLoading(false)
        }
      } else if (detailKind === 'gem') {
        let g = hiddenGemsService.getHiddenGemById(sourceId)
        if (!g) {
          await hiddenGemsService.fetchHiddenGems()
          g = hiddenGemsService.getHiddenGemById(sourceId)
        }
        if (!cancelled) {
          setGem(g)
          setLoading(false)
        }
      } else {
        let p = mapService.getPlaceById(sourceId)
        if (!p) {
          const fetched = await mapService.fetchPlaceById(sourceId)
          if (fetched) p = fetched
          else {
            await mapService.fetchAllPlaces()
            p = mapService.getPlaceById(sourceId)
          }
        }
        if (!cancelled) {
          setPlace(p)
          setLoading(false)
        }
      }
    }

    void loadDetail()

    return () => {
      cancelled = true
    }
  }, [detailKind, sourceId])

  const detail = place || food || gem
  const detailName = place?.name || food?.name || gem?.name || ''
  const detailDescription = place?.description || food?.specialty || gem?.description || ''
  const detailImage = place?.image_url || place?.image || food?.image_url || food?.image || gem?.image_url || gem?.image
  const detailCategory = place?.layer || (food ? 'food' : 'hidden')
  const detailCoordinates = place?.coordinates || food?.coordinates || gem?.coordinates
  const explorationId = detailKind === 'place' ? sourceId : `${detailKind}:${sourceId}`

  useEffect(() => {
    if (!detail) return
    setSaved(detailKind === 'place' && userService.isPlaceSaved(sourceId))
    if (user) setExplored(explorationService.isExplored(user.id, explorationId))
  }, [detail, detailKind, explorationId, sourceId, user])

  const nearbyFood = foodService.getFood().slice(0, 3)
  const nearbyGems = hiddenGemsService.getNearbyHiddenGems()
  const nearbyPlaces = detailKind === 'place' ? mapService.getNearbyPlaces(sourceId) : []

  if (loading) {
    return (
      <div className="place-detail-error">
        <p>Loading details...</p>
      </div>
    )
  }

  if (!detail || !detailCoordinates) {
    return (
      <div className="place-detail-error">
        <h2>Place not found</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Go back</button>
      </div>
    )
  }

  const handleNavigate = () => {
    const mappedCategory =
      detailCategory === 'hidden_gems'
        ? 'hidden'
        : detailCategory === 'food'
          ? 'food'
          : detailCategory === 'spiritual'
            ? 'spiritual'
            : detailCategory === 'art'
              ? 'art'
              : 'heritage'

    goToMap({
      mapId: toMapId(detailKind as 'place' | 'food' | 'gem', sourceId),
      coordinates: detailCoordinates,
      name: detailName,
      description: detailDescription,
      category: mappedCategory,
      image: detailImage,
    })
  }

  const handleSave = () => {
    if (detailKind !== 'place') return
    if (saved) userService.unsavePlace(sourceId)
    else userService.savePlace(sourceId)
    setSaved(!saved)
  }

  const handleExplored = () => {
    if (!user || explored) return
    explorationService.markExplored(user.id, explorationId, detailName, detailCategory)
    if (detailKind === 'place') userService.markPlaceVisited(sourceId)
    setExplored(true)
  }

  if (detailKind === 'food') {
    if (!food || !detailCoordinates) {
      return (
        <div className="place-detail-error">
          <h2>Food spot not found</h2>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>Go back</button>
        </div>
      )
    }

    const foodPage = food
    const otherFood = nearbyFood.filter((item) => item.id !== foodPage.id).slice(0, 3)

    return (
      <div className="food-experience-page">
        <div className="food-experience-shell">
          <div className="food-experience-nav">
            <button className="food-back-link" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Back to local food
            </button>
            <span className="food-breadcrumb"><Utensils size={15} /> Vadodara food guide</span>
          </div>

          <main>
            <section className="food-experience-hero">
              <div className="food-experience-image-wrap">
                <SmartImage src={foodPage.image_url || foodPage.image} alt={foodPage.name} className="food-experience-image" />
                <span className="food-image-stamp"><Sparkles size={14} /> Aina pick</span>
              </div>
              <div className="food-experience-intro">
                <p className="food-experience-kicker">{foodPage.foodType} / {foodPage.location}</p>
                <h1>{foodPage.name}</h1>
                <p className="food-experience-specialty">{foodPage.specialty}</p>
                <div className="food-experience-actions">
                  <button className="btn btn-primary" onClick={handleNavigate}>
                    <Navigation size={16} /> Find this spot
                  </button>
                  <button className="btn btn-secondary" onClick={handleExplored} disabled={explored}>
                    <Check size={16} /> {explored ? 'Explored' : 'Mark explored'}
                  </button>
                </div>
                {foodPage.whyAINARecommends && (
                  <div className="food-experience-note">
                    <Sparkles size={17} />
                    <span>{foodPage.whyAINARecommends}</span>
                  </div>
                )}
              </div>
            </section>

            <section className="food-fact-strip" aria-label="Food details">
              <div><MapPin size={17} /><span><small>Neighbourhood</small>{foodPage.location}</span></div>
              <div><Navigation size={17} /><span><small>Distance</small>{foodPage.distance}</span></div>
              <div><span className="food-fact-symbol">₹</span><span><small>Typical spend</small>{foodPage.priceRange}</span></div>
              <div><Clock size={17} /><span><small>Open today</small>{foodPage.openingHours}</span></div>
            </section>

            {foodPage.whyAINARecommends && (
              <section className="food-story-grid">
                <div className="food-story-main">
                  <p className="food-section-kicker">A small taste of the city</p>
                  <h2>Why this one belongs on your route</h2>
                  <p>{foodPage.whyAINARecommends}</p>
                </div>
                <div className="food-story-aside">
                  <span className="food-aside-mark">01</span>
                  <p>Go hungry. Leave with a better sense of Vadodara.</p>
                </div>
              </section>
            )}

            {otherFood.length > 0 && (
              <section className="food-more-section">
                <div className="food-more-heading">
                  <div>
                    <p className="food-section-kicker">Keep exploring</p>
                    <h2>More local bites</h2>
                  </div>
                  <span>{otherFood.length.toString().padStart(2, '0')} nearby picks</span>
                </div>
                <div className="food-more-grid">
                  {otherFood.map((item) => (
                    <button key={item.id} className="food-more-card" onClick={() => navigate(toDetailPath('food', item.id))}>
                      <SmartImage src={item.image_url || item.image} alt={item.name} className="food-more-image" />
                      <span className="food-more-copy"><small>{item.foodType}</small><strong>{item.name}</strong><em>{item.location}</em></span>
                      <ArrowUpRight size={17} />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    )
  }

  const discoveryTitle = place?.architectural_style || place?.architecture || gem?.culturalInformation || place?.culturalSignificance || 'A closer look at this place'
  const discoveryStory = place?.historical_period || place?.history || place?.description || gem?.culturalInformation || 'A place worth slowing down for, with details that reward a closer look.'
  const discoveryFacts = place
    ? [
      { label: 'Category', value: place.category },
      { label: 'Time to explore', value: place.estimatedExplorationTime || (place.visit_time_minutes ? `${place.visit_time_minutes} mins` : 'Plan an hour') },
      { label: 'Best time', value: place.best_time_to_visit || place.bestTime || 'Anytime' },
      { label: 'Rating', value: `${place.rating.toFixed(1)} / 5` },
    ]
    : [
      { label: 'Type', value: 'Hidden gem' },
      { label: 'Distance', value: gem?.distance || 'Nearby' },
      { label: 'Time to explore', value: gem?.explorationTime || 'Plan an hour' },
      { label: 'Best time', value: gem?.bestTime || 'Anytime' },
    ]
  const discoveryCards = place
    ? nearbyPlaces.slice(0, 3).map((item) => ({ id: item.id, name: item.name, type: item.category, image: item.image_url || item.image }))
    : nearbyGems.filter((item) => item.id !== gem?.id).slice(0, 3).map((item) => ({ id: item.id, name: item.name, type: 'Hidden gem', image: item.image_url || item.image }))

  return (
    <div className={`food-experience-page discovery-category-page detail-category-${detailCategory}`}>
      <div className="food-experience-shell">
        <div className="food-experience-nav">
          <button className="food-back-link" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back to explore
          </button>
          <span className="food-breadcrumb"><Sparkles size={15} /> Aina field guide</span>
        </div>

        <main>
          <section className="food-experience-hero">
            <div className="food-experience-image-wrap">
              <SmartImage src={detailImage} alt={detailName} className="food-experience-image" />
              <span className="food-image-stamp"><Sparkles size={14} /> Worth the detour</span>
            </div>
            <div className="food-experience-intro">
              <p className="food-experience-kicker">{detailCategory} / Vadodara</p>
              <h1>{detailName}</h1>
              <p className="food-experience-specialty">{detailDescription}</p>
              <div className="food-experience-actions">
                <button className="btn btn-primary" onClick={handleNavigate}>
                  <Navigation size={16} /> Find this spot
                </button>
                {place && (
                  <button className={`btn ${saved ? 'btn-primary' : 'btn-secondary'}`} onClick={handleSave}>
                    {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    {saved ? 'Saved' : 'Save place'}
                  </button>
                )}
                <button className="btn btn-secondary" onClick={handleExplored} disabled={explored}>
                  <Check size={16} /> {explored ? 'Explored' : 'Mark explored'}
                </button>
              </div>
              <div className="food-experience-note">
                <Sparkles size={17} />
                <span>{place?.why_interesting || gem?.whyHidden || place?.culturalSignificance || 'A thoughtful stop for curious explorers.'}</span>
              </div>
            </div>
          </section>

          <section className="food-fact-strip" aria-label="Place details">
            {discoveryFacts.map((fact) => (
              <div key={fact.label}><span className="food-fact-symbol">+</span><span><small>{fact.label}</small>{fact.value}</span></div>
            ))}
          </section>

          <section className="food-story-grid">
            <div className="food-story-main">
              <p className="food-section-kicker">A closer look at the city</p>
              <h2>{discoveryTitle}</h2>
              <p>{discoveryStory}</p>
            </div>
            <div className="food-story-aside">
              <span className="food-aside-mark">01</span>
              <p>{place?.why_interesting || place?.architectural_style || gem?.whyHidden || 'Look beyond the obvious. The best details are often easy to miss.'}</p>
            </div>
          </section>

          {place?.best_for && place.best_for.length > 0 && (
            <section className="discovery-things-section">
              <p className="food-section-kicker">Best for</p>
              <div className="discovery-things-grid">
                {place.best_for.slice(0, 4).map((thing, index) => <div key={thing}><span>0{index + 1}</span><strong>{thing}</strong></div>)}
              </div>
            </section>
          )}

          {discoveryCards.length > 0 && (
            <section className="food-more-section">
              <div className="food-more-heading">
                <div>
                  <p className="food-section-kicker">Keep exploring</p>
                  <h2>{place ? 'Nearby places' : 'More hidden corners'}</h2>
                </div>
                <span>{discoveryCards.length.toString().padStart(2, '0')} more picks</span>
              </div>
              <div className="food-more-grid">
                {discoveryCards.map((item) => (
                  <button key={item.id} className="food-more-card" onClick={() => navigate(toDetailPath(place ? 'place' : 'gem', item.id))}>
                    <SmartImage src={item.image} alt={item.name} className="food-more-image" />
                    <span className="food-more-copy"><small>{item.type}</small><strong>{item.name}</strong><em>Explore next</em></span>
                    <ArrowUpRight size={17} />
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
