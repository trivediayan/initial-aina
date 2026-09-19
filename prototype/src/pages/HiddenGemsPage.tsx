import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Sun, Navigation, Check, Compass } from 'lucide-react'
import { hiddenGemsService } from '@/services/hiddenGems.service'
import { explorationService } from '@/services/exploration.service'
import { useAuth } from '@/contexts/AuthContext'
import { useInternalNavigate } from '@/hooks/useInternalNavigate'
import { toDetailPath, toMapId } from '@/services/catalog.service'
import { SmartImage } from '@/components/ui/SmartImage'
import type { HiddenGem } from '@/types/dashboard.types'
import './HiddenGemsPage.css'

export function HiddenGemsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const goToMap = useInternalNavigate()
  const [gems, setGems] = useState<HiddenGem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const syncGems = () => setGems(hiddenGemsService.getHiddenGems())
    syncGems()
    window.addEventListener('ayna:hidden-gems-updated', syncGems)
    return () => window.removeEventListener('ayna:hidden-gems-updated', syncGems)
  }, [])

  const filteredGems = useMemo(() => gems.filter((gem) =>
    gem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gem.culturalInformation.toLowerCase().includes(searchQuery.toLowerCase()),
  ), [gems, searchQuery])

  const handleNavigate = (gem: HiddenGem) => {
    goToMap({
      mapId: toMapId('gem', gem.id),
      coordinates: gem.coordinates,
      name: gem.name,
      description: gem.description,
      category: 'hidden',
      image: gem.image,
    })
  }

  const handleOpenDetails = (gem: HiddenGem) => {
    navigate(toDetailPath('gem', gem.id))
  }

  const handleExplored = (gem: HiddenGem) => {
    if (!user) return
    explorationService.markExplored(user.id, `gem:${gem.id}`, gem.name, 'hidden')
    setTick((n) => n + 1)
  }

  return (
    <div className="hidden-gems-page">
      <div className="hidden-gems-container">
        <div className="hidden-gems-header">
          <div className="collection-hero-copy">
            <p className="page-kicker">03 / Beyond the obvious</p>
            <h1>Hidden gems</h1>
            <p>Quieter corners of Vadodara most visitors miss</p>
          </div>
          <div className="collection-hero-stat">
            <strong>{filteredGems.length.toString().padStart(2, '0')}</strong>
            <span>quiet places</span>
          </div>
        </div>

        <div className="search-bar page-search">
          <input
            type="search"
            placeholder="Search hidden gems…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="gems-grid">
          {filteredGems.map((gem) => {
            const explored = user ? explorationService.isExplored(user.id, `gem:${gem.id}`) : false
            return (
              <article
                key={`${gem.id}-${tick}`}
                className="gem-card card"
                role="link"
                tabIndex={0}
                onClick={() => handleOpenDetails(gem)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') handleOpenDetails(gem)
                }}
              >
                <SmartImage src={gem.image} alt={gem.name} className="gem-image" />
                <div className="gem-content">
                  <div className="gem-header">
                    <h3 className="gem-name">{gem.name}</h3>
                    <span className="gem-distance">{gem.distance}</span>
                  </div>
                  <p className="gem-description">{gem.description}</p>
                  <div className="gem-section">
                    <h4>Why it stays hidden</h4>
                    <p>{gem.whyHidden}</p>
                  </div>
                  <div className="gem-details">
                    <div className="gem-detail"><Clock size={14} /> {gem.explorationTime}</div>
                    <div className="gem-detail"><Sun size={14} /> {gem.bestTime}</div>
                  </div>
                  <div className="gem-actions">
                    <button className="btn btn-secondary" onClick={(event) => { event.stopPropagation(); handleExplored(gem) }} disabled={explored}>
                      {explored ? <Check size={15} /> : <Compass size={15} />}
                      {explored ? 'Explored' : "I've explored this"}
                    </button>
                    <button className="btn btn-primary" onClick={(event) => { event.stopPropagation(); handleNavigate(gem) }}>
                      <Navigation size={15} /> Navigate
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
