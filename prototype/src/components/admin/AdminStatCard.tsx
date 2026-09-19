import './AdminStatCard.css'

interface AdminStatCardProps {
  title: string
  value: string | number
  icon: string
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'primary' | 'secondary' | 'gold' | 'default'
}

export function AdminStatCard({ title, value, icon, trend, color = 'default' }: AdminStatCardProps) {
  return (
    <div className={`admin-stat-card ${color}`}>
      <div className="stat-icon-wrapper">
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
        {trend && (
          <div className={`stat-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            <span className="trend-icon">{trend.isPositive ? '↑' : '↓'}</span>
            <span className="trend-value">{Math.abs(trend.value)}%</span>
            <span className="trend-label">from last month</span>
          </div>
        )}
      </div>
    </div>
  )
}
