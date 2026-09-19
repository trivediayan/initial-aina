import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminSearchBar } from '@/components/admin/AdminSearchBar'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminDialog } from '@/components/admin/AdminDialog'
import { adminService } from '@/services/admin.service'
import type { AdminHiddenGem, FilterState, PaginationState, DialogState } from '@/types/admin.types'
import './AdminHiddenGemsPage.css'

export function AdminHiddenGemsPage() {
  const [gems, setGems] = useState<AdminHiddenGem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterState>({ search: '' })
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, total: 0 })
  const [dialog, setDialog] = useState<DialogState>({ isOpen: false, type: null, data: null })

  useEffect(() => {
    loadGems()
  }, [filter, pagination.page])

  const loadGems = async () => {
    setLoading(true)
    try {
      const result = adminService.getHiddenGems(filter, pagination)
      setGems(result.data)
      setPagination(prev => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('Failed to load hidden gems:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setFilter({ ...filter, search: value })
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page })
  }

  const handleRowClick = (gem: AdminHiddenGem) => {
    setDialog({ isOpen: true, type: 'view', data: gem })
  }

  const handleAdd = () => {
    setDialog({ isOpen: true, type: 'create', data: null })
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'explorationTime', label: 'Exploration Time' },
    { key: 'bestTime', label: 'Best Time' },
    { key: 'status', label: 'Status' },
  ]

  return (
    <AdminLayout title="Hidden Gems Management">
      <div className="admin-hidden-gems-page">
        <div className="page-controls">
          <AdminSearchBar
            value={filter.search}
            onChange={handleSearch}
            placeholder="Search hidden gems..."
          />
          <AdminButton icon="➕" onClick={handleAdd}>
            Add Hidden Gem
          </AdminButton>
        </div>

        <AdminTable
          columns={columns}
          data={gems}
          onRowClick={handleRowClick}
          loading={loading}
          emptyMessage="No hidden gems found"
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
            title={dialog.type === 'create' ? 'Add Hidden Gem' : 'Hidden Gem Details'}
            size="md"
          >
            <div className="dialog-content">
              <div className="gem-form">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" defaultValue={dialog.data?.name || ''} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows={3} defaultValue={dialog.data?.description || ''} />
                </div>
                <div className="form-group">
                  <label>Cultural Information</label>
                  <textarea rows={2} defaultValue={dialog.data?.culturalInformation || ''} />
                </div>
                <div className="dialog-actions">
                  <AdminButton variant="ghost" onClick={() => setDialog({ isOpen: false, type: null, data: null })}>
                    Cancel
                  </AdminButton>
                  <AdminButton onClick={() => setDialog({ isOpen: false, type: null, data: null })}>
                    Save
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
