import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, Bookmark, BookmarkCheck, Check, Navigation, MapPin, Clock, Sun, Utensils, ArrowUpRight, Sparkles } from 'lucide-react'
import { mapService } from '@/services/map.service'
import { foodService } from '@/services/food.service'
import { hiddenGemsService } from '@/services/hiddenGems.service'
import { userService } from '@/services/user.service'
import { explorationService } from '@/services/exploration.service'
import { useAuth } from '@/contexts/AuthContext'
import { useInternalNavigate } from '@/hooks/useInternalNavigate'
import { toDetailPath, toMapId } from '@/services/catalog.service'
import { SmartImage } from '@/components/ui/SmartImage'
import './PlaceDetailPage.css'

export function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const goToMap = useInternalNavigate()
  const [saved, setSaved] = useState(false)
  const [explored, setExplored] = useState(false)

  const decodedId = decodeURIComponent(id || '')
  const detailMatch = decodedId.match(/^(place|food|gem)-(.+)$/)
  const detailKind = detailMatch?.[1] || 'place'
  const sourceId = detailMatch?.[2] || decodedId
  const place = detailKind === 'place' ? mapService.getPlaceById(sourceId) : undefined
  const food = detailKind === 'food' ? foodService.getFoodById(sourceId) : undefined
  const gem = detailKind === 'gem' ? hiddenGemsService.getHiddenGemById(sourceId) : undefined
  const detail = place || food || gem
  const detailName = place?.name || food?.name || gem?.name || ''
  const detailDescription = place?.description || food?.specialty || gem?.description || ''
  const detailImage = place?.image || food?.image || gem?.image
  const detailCategory = place?.category || (food ? 'food' : 'hidden')
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

  if (!detail || !detailCoordinates) {
    return (
      <div className="place-detail-error">
        <h2>Place not found</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Go back</button>
      </div>
    )
  }

  const handleNavigate = () => {
    goToMap({
      mapId: toMapId(detailKind as 'place' | 'food' | 'gem', sourceId),
      coordinates: detailCoordinates,
      name: detailName,
      description: detailDescription,
      category: detailCategory === 'all' ? 'heritage' : detailCategory,
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
                <SmartImage src={foodPage.image} alt={foodPage.name} className="food-experience-image" />
                <span className="food-image-stamp"><Sparkles size={14} /> Ayna pick</span>
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
                <div className="food-experience-note">
                  <Sparkles size={17} />
                  <span>{foodPage.whyAINARecommends}</span>
                </div>
              </div>
            </section>

            <section className="food-fact-strip" aria-label="Food details">
              <div><MapPin size={17} /><span><small>Neighbourhood</small>{foodPage.location}</span></div>
              <div><Navigation size={17} /><span><small>Distance</small>{foodPage.distance}</span></div>
              <div><span className="food-fact-symbol">₹</span><span><small>Typical spend</small>{foodPage.priceRange}</span></div>
              <div><Clock size={17} /><span><small>Open today</small>{foodPage.openingHours}</span></div>
            </section>

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
                    <SmartImage src={item.image} alt={item.name} className="food-more-image" />
                    <span className="food-more-copy"><small>{item.foodType}</small><strong>{item.name}</strong><em>{item.location}</em></span>
                    <ArrowUpRight size={17} />
                  </button>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    )
  }

  if (detailKind !== 'food') {
    const discoveryTitle = place?.architecture || gem?.culturalInformation || place?.culturalSignificance || 'A closer look at this place'
    const discoveryStory = place?.history || gem?.culturalInformation || 'A place worth slowing down for, with details that reward a closer look.'
    const discoveryFacts = place
      ? [
        { label: 'Category', value: place.category },
        { label: 'Time to explore', value: place.estimatedExplorationTime || 'Plan an hour' },
        { label: 'Best time', value: place.bestTime || 'Anytime' },
        { label: 'Rating', value: `${place.rating.toFixed(1)} / 5` },
      ]
      : [
        { label: 'Type', value: 'Hidden gem' },
        { label: 'Distance', value: gem?.distance || 'Nearby' },
        { label: 'Time to explore', value: gem?.explorationTime || 'Plan an hour' },
        { label: 'Best time', value: gem?.bestTime || 'Anytime' },
      ]
    const discoveryCards = place
      ? nearbyPlaces.slice(0, 3).map((item) => ({ id: item.id, name: item.name, type: item.category, image: item.image }))
      : nearbyGems.filter((item) => item.id !== gem?.id).slice(0, 3).map((item) => ({ id: item.id, name: item.name, type: 'Hidden gem', image: item.image }))

    return (
      <div className={`food-experience-page discovery-category-page detail-category-${detailCategory}`}>
        <div className="food-experience-shell">
          <div className="food-experience-nav">
            <button className="food-back-link" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Back to explore
            </button>
            <span className="food-breadcrumb"><Sparkles size={15} /> Ayna field guide</span>
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
                  <span>{gem?.whyHidden || place?.culturalSignificance || 'A thoughtful stop for curious explorers.'}</span>
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
                <p>{place?.architecture || gem?.whyHidden || 'Look beyond the obvious. The best details are often easy to miss.'}</p>
              </div>
            </section>

            {place?.thingsToSee && place.thingsToSee.length > 0 && (
              <section className="discovery-things-section">
                <p className="food-section-kicker">Make time for these</p>
                <div className="discovery-things-grid">
                  {place.thingsToSee.slice(0, 4).map((thing, index) => <div key={thing}><span>0{index + 1}</span><strong>{thing}</strong></div>)}
                </div>
              </section>
            )}

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
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className={`place-detail-page detail-kind-${detailKind} detail-category-${detailCategory} ${detailKind === 'food' ? 'food-detail-page' : ''}`}>
      <div className="place-detail-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="place-hero">
          <SmartImage src={detailImage} alt={detailName} className="hero-image" />
          <div className="hero-overlay">
            <div className="hero-content">
              <span className={`badge badge-${detailCategory}`}>{detailCategory}</span>
              <h1 className="place-name">{detailName}</h1>
              {place && <p className="place-rating">{place.rating.toFixed(1)} rating</p>}
            </div>
          </div>
        </div>

        <div className="place-content">
          <div className="place-actions">
            {place && (
              <button className={`btn ${saved ? 'btn-primary' : 'btn-secondary'}`} onClick={handleSave}>
                {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {saved ? 'Saved' : 'Save'}
              </button>
            )}
            <button className={`btn ${explored ? 'btn-primary' : 'btn-secondary'}`} onClick={handleExplored} disabled={explored}>
              <Check size={16} />
              {explored ? 'Explored' : "I've explored this"}
            </button>
            <button className="btn btn-primary" onClick={handleNavigate}>
              <Navigation size={16} /> Navigate
            </button>
          </div>

          <section className="place-section">
            <h2>About</h2>
            <p className="place-description">{detailDescription}</p>
          </section>

          {place?.history && (
            <section className="place-section">
              <h2>History</h2>
              <p>{place.history}</p>
            </section>
          )}

          {food && (
            <section className="place-section">
              <h2>What to expect</h2>
              <p>{food.whyAINARecommends}</p>
            </section>
          )}

          {gem && (
            <>
              <section className="place-section">
                <h2>Cultural story</h2>
                <p>{gem.culturalInformation}</p>
              </section>
              <section className="place-section">
                <h2>Why it stays hidden</h2>
                <p>{gem.whyHidden}</p>
              </section>
            </>
          )}

          {place?.architecture && (
            <section className="place-section">
              <h2>Architecture</h2>
              <p>{place.architecture}</p>
            </section>
          )}

          {place?.culturalSignificance && (
            <section className="place-section">
              <h2>Cultural significance</h2>
              <p>{place.culturalSignificance}</p>
            </section>
          )}

          {place?.thingsToSee && place.thingsToSee.length > 0 && (
            <section className="place-section">
              <h2>Things to see</h2>
              <ul className="things-to-see">
                {place.thingsToSee.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
          )}

          <section className="place-section">
            <h2>Visit information</h2>
            <div className="visit-info">
              {(place?.address || food?.location || gem?.distance) && <div className="info-item"><MapPin size={15} /> {place?.address || food?.location || `${gem?.distance} from the city centre`}</div>}
              {food?.distance && <div className="info-item"><Navigation size={15} /> {food.distance} from the city centre</div>}
              {food?.priceRange && <div className="info-item"><span className="info-item-label">Price</span> {food.priceRange}</div>}
              {(place?.openingHours || food?.openingHours) && <div className="info-item"><Clock size={15} /> Opening & closing: {place?.openingHours || food?.openingHours}</div>}
              {(place?.estimatedExplorationTime || gem?.explorationTime) && <div className="info-item"><Clock size={15} /> Time to explore: {place?.estimatedExplorationTime || gem?.explorationTime}</div>}
              {(place?.bestTime || gem?.bestTime) && <div className="info-item"><Sun size={15} /> Best time: {place?.bestTime || gem?.bestTime}</div>}
            </div>
          </section>

          {nearbyPlaces.length > 0 && (
            <section className="place-section">
              <h2>Nearby places</h2>
              <div className="nearby-grid">
                {nearbyPlaces.map((nearby) => (
                  <button key={nearby.id} className="nearby-card" onClick={() => navigate(`/place/${nearby.id}`)}>
                    <SmartImage src={nearby.image} alt={nearby.name} className="nearby-image" />
                    <div className="nearby-info">
                      <h3>{nearby.name}</h3>
                      <p>{nearby.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {nearbyFood.length > 0 && (
            <section className="place-section">
              <h2>Nearby food</h2>
              <div className="nearby-grid">
                {nearbyFood.map((food) => (
                  <button key={food.id} className="nearby-card" onClick={() => navigate(toDetailPath('food', food.id))}>
                    <SmartImage src={food.image} alt={food.name} className="nearby-image" />
                    <div className="nearby-info">
                      <h3>{food.name}</h3>
                      <p>{food.foodType}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {nearbyGems.length > 0 && (
            <section className="place-section">
              <h2>Hidden gems nearby</h2>
              <div className="nearby-grid">
                {nearbyGems.map((gem) => (
                  <button key={gem.id} className="nearby-card" onClick={() => navigate(toDetailPath('gem', gem.id))}>
                    <SmartImage src={gem.image} alt={gem.name} className="nearby-image" />
                    <div className="nearby-info">
                      <h3>{gem.name}</h3>
                      <p>{gem.distance}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
