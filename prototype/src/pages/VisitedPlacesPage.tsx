import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Compass, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { explorationService } from '@/services/exploration.service'
import { mapService } from '@/services/map.service'
import { foodService } from '@/services/food.service'
import { hiddenGemsService } from '@/services/hiddenGems.service'
import { SmartImage } from '@/components/ui/SmartImage'
import type { ExplorationRecord } from '@/types/exploration.types'
import './VisitedPlacesPage.css'

function resolveImage(record: ExplorationRecord): string | undefined {
  if (record.placeId.startsWith('food:')) {
    return foodService.getFoodById(record.placeId.replace('food:', ''))?.image
  }
  if (record.placeId.startsWith('gem:')) {
    return hiddenGemsService.getHiddenGemById(record.placeId.replace('gem:', ''))?.image
  }
  return mapService.getPlaceById(record.placeId)?.image
}

export function VisitedPlacesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [records, setRecords] = useState<ExplorationRecord[]>([])

  useEffect(() => {
    if (!user) return
    void explorationService.syncFromRemote(user.id).then(() => {
      setRecords(explorationService.getAllExplored(user.id))
    })
    setRecords(explorationService.getAllExplored(user.id))
  }, [user])

  const stats = user ? explorationService.getStats(user.id) : null
  const latestRecord = records[0]
  const olderRecords = records.slice(1)

  return (
    <div className="visited-places-page">
      <div className="visited-places-container">
        <div className="page-header">
          <div>
            <p className="page-kicker">04 / Your field notes</p>
            <h1>Explored places</h1>
            <p>Places you have marked as explored</p>
          </div>
          <span className="page-header-count">{records.length.toString().padStart(2, '0')} explored</span>
        </div>

        <div className="visited-intro-card">
          <div className="visited-intro-icon"><Compass size={22} /></div>
          <div>
            <span className="visited-intro-kicker"><Sparkles size={13} /> Your city, remembered</span>
            <h2>Every stop becomes part of your story.</h2>
            <p>Keep wandering. Your next favourite memory is probably one turn away.</p>
          </div>
          <button type="button" onClick={() => navigate('/dashboard')}>Explore again <ArrowRight size={15} /></button>
        </div>

        {records.length === 0 ? (
          <div className="empty-state">
            <h3>No explorations yet</h3>
            <p>Use “I've explored this” on a place, food spot, or hidden gem.</p>
          </div>
        ) : (
          <>
            {stats && (
              <div className="stats-summary">
                <div className="stat-card"><div className="stat-number">{stats.total}</div><div className="stat-label">Total</div></div>
                <div className="stat-card"><div className="stat-number">{stats.heritage}</div><div className="stat-label">Heritage</div></div>
                <div className="stat-card"><div className="stat-number">{stats.food}</div><div className="stat-label">Food</div></div>
                <div className="stat-card"><div className="stat-number">{stats.hidden}</div><div className="stat-label">Hidden gems</div></div>
              </div>
            )}

            {latestRecord && (
              <section className="memory-feature">
                <div className="memory-feature-image">
                  <SmartImage src={resolveImage(latestRecord)} alt={latestRecord.placeName} className="place-image" />
                  <span className="memory-feature-badge"><Sparkles size={13} /> Latest memory</span>
                  <span className="memory-feature-index">01</span>
                </div>
                <div className="memory-feature-content">
                  <span className="memory-feature-kicker">Your most recent stop</span>
                  <h2>{latestRecord.placeName}</h2>
                  <p className="memory-feature-meta">{latestRecord.category} <span /> {new Date(latestRecord.exploredAt).toLocaleDateString()}</p>
                  <p className="memory-feature-copy">You made it here. Let this be the beginning of the next route.</p>
                  {!latestRecord.placeId.includes(':') && (
                    <button className="memory-feature-action" onClick={() => navigate(`/place/${latestRecord.placeId}`)}>
                      Revisit this place <ArrowUpRight size={15} />
                    </button>
                  )}
                </div>
              </section>
            )}

            {olderRecords.length > 0 && <div className="memory-section-heading">
              <div><span className="page-kicker">The trail so far</span><h2>Other memories</h2></div>
              <span>{olderRecords.length.toString().padStart(2, '0')} stops</span>
            </div>}

            <div className="places-list memory-grid">
              {olderRecords.map((item, index) => (
                <article
                  key={item.placeId}
                  className="visited-card card"
                  onClick={() => !item.placeId.includes(':') && navigate(`/place/${item.placeId}`)}
                >
                  <div className="visited-image-wrap">
                    <SmartImage src={resolveImage(item)} alt={item.placeName} className="place-image" />
                    <span className="visited-memory-number">{String(index + 2).padStart(2, '0')}</span>
                    <span className="visited-memory-label">Explored</span>
                  </div>
                  <div className="place-content">
                    <div className="place-header">
                      <h3 className="place-name">{item.placeName}</h3>
                      <span className="visit-date">{new Date(item.exploredAt).toLocaleDateString()}</span>
                    </div>
                    <p className="place-category">{item.category}</p>
                    {!item.placeId.includes(':') && (
                      <button className="btn btn-secondary" onClick={(event) => { event.stopPropagation(); navigate(`/place/${item.placeId}`) }}>
                        View details <ArrowUpRight size={14} />
                      </button>
                    )}
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
