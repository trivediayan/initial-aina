import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { adminService } from '@/services/admin.service'
import type { AdminStats } from '@/types/admin.types'
import './AdminDashboardPage.css'
import { useAuth } from '@/contexts/AuthContext'

export function AdminDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = adminService.getStats(user || undefined)
        setStats(data)
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [user])

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="admin-dashboard-loading">
          <div className="loading-spinner" />
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    )
  }

  if (!stats) {
    return (
      <AdminLayout title="Dashboard">
        <div className="admin-dashboard-error">
          <p>Failed to load dashboard data</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h2>Welcome to AINA Admin</h2>
          <p>Overview of your cultural discovery platform</p>
        </div>

        <div className="stats-grid">
          <AdminStatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            color="primary"
          />
          <AdminStatCard
            title="Total Places"
            value={stats.totalPlaces}
            icon="🏛️"
            color="secondary"
          />
          <AdminStatCard
            title="Heritage Places"
            value={stats.heritagePlaces}
            icon="🏰"
            color="gold"
          />
          <AdminStatCard
            title="Food Places"
            value={stats.foodPlaces}
            icon="🍛"
            color="default"
          />
          <AdminStatCard
            title="Hidden Gems"
            value={stats.hiddenGems}
            icon="💎"
            color="primary"
          />
          <AdminStatCard
            title="Total Visits"
            value={stats.totalVisits}
            icon="📍"
            color="secondary"
          />
          <AdminStatCard
            title="Popular Places"
            value={stats.popularPlaces}
            icon="⭐"
            color="gold"
          />
          <AdminStatCard
            title="Saved Places"
            value={stats.savedPlaces}
            icon="❤️"
            color="default"
          />
          <AdminStatCard
            title="Chatbot Questions"
            value={stats.chatbotQuestions}
            icon="💬"
            color="primary"
          />
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button className="quick-action-button">
                <span className="action-icon">➕</span>
                <span className="action-label">Add New Place</span>
              </button>
              <button className="quick-action-button">
                <span className="action-icon">🍛</span>
                <span className="action-label">Add Food Item</span>
              </button>
              <button className="quick-action-button">
                <span className="action-icon">💎</span>
                <span className="action-label">Add Hidden Gem</span>
              </button>
              <button className="quick-action-button">
                <span className="action-icon">👥</span>
                <span className="action-label">Manage Users</span>
              </button>
            </div>
          </div>

          <div className="dashboard-section">
            <h3>Recent Activity</h3>
            <div className="activity-list empty-activity-list">
              <p>No activity recorded yet.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
