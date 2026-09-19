import { useEffect, useState, type CSSProperties } from 'react'
import {
  Landmark, Utensils, Gem, Flame, Palette, Trophy, MapPin, Building2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { explorationService } from '@/services/exploration.service'
import { userService } from '@/services/user.service'
import { mapService } from '@/services/map.service'
import { useNavigate } from 'react-router-dom'
import type { AchievementProgress, Badge } from '@/types/exploration.types'
import './ProfilePage.css'

const ICON_MAP = {
  MapPin,
  Landmark,
  UtensilsCrossed: Utensils,
  Gem,
  Flame,
  Palette,
  Trophy,
  Building2,
} as const

function AchievementIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name as keyof typeof ICON_MAP] ?? MapPin
  return <Icon size={size} strokeWidth={1.7} />
}

export function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(explorationService.getStats(user?.id || ''))
  const [achievements, setAchievements] = useState<AchievementProgress[]>([])
  const [badges, setBadges] = useState<Badge[]>([])

  useEffect(() => {
    if (!user) return
    void explorationService.syncFromRemote(user.id).then(() => {
      setStats(explorationService.getStats(user.id))
      setAchievements(explorationService.getAchievements(user.id))
      setBadges(explorationService.getBadges(user.id))
    })
    setStats(explorationService.getStats(user.id))
    setAchievements(explorationService.getAchievements(user.id))
    setBadges(explorationService.getBadges(user.id))
  }, [user])

  const recommendations = userService.getNextRecommendations()
  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const statCards = [
    { label: 'Places explored', value: stats.total, icon: MapPin },
    { label: 'Heritage', value: stats.heritage, icon: Landmark },
    { label: 'Food', value: stats.food, icon: Utensils },
    { label: 'Hidden gems', value: stats.hidden, icon: Gem },
    { label: 'Spiritual', value: stats.spiritual, icon: Flame },
    { label: 'Art', value: stats.art, icon: Palette },
  ]

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">{initials}</div>
            <span className="profile-avatar-status" />
          </div>
          <div className="profile-info">
            <p className="profile-kicker">Your personal atlas</p>
            <h1>{user?.full_name || 'Traveller'}</h1>
            <p>{user?.email}</p>
            <p className="join-date">Your Vadodara journey</p>
          </div>
          <span className="profile-header-label">AINA explorer</span>
        </div>

        <section className="profile-section">
          <h2>Travel statistics</h2>
          <div className="stats-grid">
            {statCards.map((card, index) => (
              <div key={card.label} className="stat-card" style={{ animationDelay: `${index * 40}ms` }}>
                <div className="stat-icon"><card.icon size={18} strokeWidth={1.7} /></div>
                <div className="stat-number">{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <div className="badges-heading">
            <div>
              <p className="section-kicker">Your collection</p>
              <h2>Badges</h2>
            </div>
            <span className="badges-count">{badges.length.toString().padStart(2, '0')} earned</span>
          </div>
          {badges.length === 0 ? (
            <div className="badges-empty">
              <div className="badges-empty-orbit"><Trophy size={22} /></div>
              <p>Explore places to unlock your first badge.</p>
            </div>
          ) : (
            <div className="badges-gallery">
              {badges.map((badge, index) => (
                <div
                  key={badge.id}
                  className="user-badge"
                  style={{ '--badge-color': badge.color, '--badge-bg': badge.bg, animationDelay: `${index * 90}ms` } as CSSProperties}
                >
                  <div className="badge-spark badge-spark-one" />
                  <div className="badge-spark badge-spark-two" />
                  <div className="badge-medallion"><AchievementIcon name={badge.icon} size={25} /></div>
                  <div className="badge-copy"><span className="badge-earned">Earned</span><strong>{badge.title}</strong><small>Milestone unlocked</small></div>
                  <div className="badge-arrow">↗</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="profile-section">
          <h2>Achievements</h2>
          <div className="achievements-grid">
            {achievements.map((item) => (
              <div
                key={item.def.id}
                className={`achievement-card ${item.isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon" style={{ color: item.def.badgeColor, background: item.def.badgeBg }}>
                  <AchievementIcon name={item.def.icon} size={22} />
                </div>
                <div className="achievement-info">
                  <h3>{item.def.title}</h3>
                  <p>{item.def.description}</p>
                  <div className="achievement-progress">
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${(item.current / item.def.required) * 100}%` }}
                      />
                    </div>
                    <span>{item.current} / {item.def.required}</span>
                  </div>
                  <span className="achievement-status">
                    {item.isUnlocked ? 'Achievement unlocked' : 'In progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <h2>Where next?</h2>
          <div className="recommendations-grid">
            {recommendations.map((rec) => {
              const place = mapService.getPlaceById(rec.placeId)
              if (!place) return null
              return (
                <div key={rec.placeId} className="recommendation-card card">
                  <div className="rec-content">
                    <h3>{place.name}</h3>
                    <p className="rec-reason">{rec.reason}</p>
                    <button className="btn btn-primary" onClick={() => navigate(`/place/${place.id}`)}>
                      Explore
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
