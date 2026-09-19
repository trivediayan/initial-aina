import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminSearchBar } from '@/components/admin/AdminSearchBar'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminDialog } from '@/components/admin/AdminDialog'
import { adminService } from '@/services/admin.service'
import type { AdminUser, FilterState, PaginationState, DialogState } from '@/types/admin.types'
import './AdminUsersPage.css'
import { useAuth } from '@/contexts/AuthContext'

export function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterState>({ search: '', status: '' })
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, total: 0 })
  const [dialog, setDialog] = useState<DialogState>({ isOpen: false, type: null, data: null })

  useEffect(() => {
    loadUsers()
  }, [filter, pagination.page, user])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const result = await adminService.getUsers(filter, pagination, user || undefined)
      setUsers(result.data)
      setPagination(prev => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setFilter({ ...filter, search: value })
    setPagination({ ...pagination, page: 1 })
  }

  const handleStatusFilter = (status: string) => {
    setFilter({ ...filter, status: status === 'all' ? '' : status })
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page })
  }

  const handleRowClick = (user: AdminUser) => {
    setDialog({ isOpen: true, type: 'view', data: user })
  }

  const columns = [
    { 
      key: 'fullName', 
      label: 'User',
      render: (value: string, row: AdminUser) => (
        <div className="user-cell">
          <div className="user-avatar-small">
            {value.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">{value}</span>
            <span className="user-email">{row.email}</span>
          </div>
        </div>
      )
    },
    { key: 'placesVisited', label: 'Visited' },
    { key: 'savedPlaces', label: 'Saved' },
    { key: 'itineraryCount', label: 'Explored' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <span className={`status-badge ${value}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    { 
      key: 'lastActive', 
      label: 'Last Active',
      render: (value: Date) => {
        const diff = Date.now() - value.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        if (days === 0) return 'Today'
        if (days === 1) return 'Yesterday'
        if (days < 7) return `${days} days ago`
        return value.toLocaleDateString()
      }
    },
  ]

  return (
    <AdminLayout title="Users Management">
      <div className="admin-users-page">
        <div className="page-controls">
          <div className="controls-left">
            <AdminSearchBar
              value={filter.search}
              onChange={handleSearch}
              placeholder="Search users..."
            />
            <div className="status-filters">
              <button
                className={`status-filter ${!filter.status ? 'active' : ''}`}
                onClick={() => handleStatusFilter('all')}
              >
                All
              </button>
              <button
                className={`status-filter ${filter.status === 'active' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('active')}
              >
                Active
              </button>
              <button
                className={`status-filter ${filter.status === 'inactive' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('inactive')}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        <AdminTable
          columns={columns}
          data={users}
          onRowClick={handleRowClick}
          loading={loading}
          emptyMessage="No users found"
        />

        <AdminPagination
          currentPage={pagination.page}
          totalPages={Math.ceil(pagination.total / pagination.pageSize)}
          onPageChange={handlePageChange}
        />

        {dialog.isOpen && (
          <AdminDialog
            isOpen={dialog.isOpen}
            onClose={() => setDialog({ isOpen: false, type: null, data: null })}
            title="User Details"
            size="md"
          >
            <div className="dialog-content">
              <div className="user-details">
                <div className="user-header">
                  <div className="user-avatar-large">
                    {dialog.data?.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-header-info">
                    <h3>{dialog.data?.fullName}</h3>
                    <p>{dialog.data?.email}</p>
                    <span className={`status-badge ${dialog.data?.status}`}>
                      {dialog.data?.status?.charAt(0).toUpperCase() + dialog.data?.status?.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="user-stats">
                  <div className="stat-item">
                    <span className="stat-label">Places Visited</span>
                    <span className="stat-value">{dialog.data?.placesVisited}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Saved Places</span>
                    <span className="stat-value">{dialog.data?.savedPlaces}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Explored</span>
                    <span className="stat-value">{dialog.data?.itineraryCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Joined</span>
                    <span className="stat-value">{dialog.data?.joinedAt.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="dialog-actions">
                  <AdminButton variant="ghost" onClick={() => setDialog({ isOpen: false, type: null, data: null })}>
                    Close
                  </AdminButton>
                  <AdminButton variant="danger">
                    Suspend User
                  </AdminButton>
                </div>
              </div>
            </div>
          </AdminDialog>
        )}
      </div>
    </AdminLayout>
  )
}
