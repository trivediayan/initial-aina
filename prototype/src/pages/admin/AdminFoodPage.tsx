import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminSearchBar } from '@/components/admin/AdminSearchBar'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminDialog } from '@/components/admin/AdminDialog'
import { adminService } from '@/services/admin.service'
import type { AdminFood, FilterState, PaginationState, DialogState } from '@/types/admin.types'
import './AdminFoodPage.css'

export function AdminFoodPage() {
  const [food, setFood] = useState<AdminFood[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterState>({ search: '' })
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, total: 0 })
  const [dialog, setDialog] = useState<DialogState>({ isOpen: false, type: null, data: null })

  useEffect(() => {
    loadFood()
  }, [filter, pagination.page])

  const loadFood = async () => {
    setLoading(true)
    try {
      const result = adminService.getFoodItems(filter, pagination)
      setFood(result.data)
      setPagination(prev => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('Failed to load food:', error)
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

  const handleRowClick = (item: AdminFood) => {
    setDialog({ isOpen: true, type: 'view', data: item })
  }

  const handleAdd = () => {
    setDialog({ isOpen: true, type: 'create', data: null })
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'foodType', label: 'Food Type' },
    { key: 'location', label: 'Location' },
    { key: 'priceRange', label: 'Price Range' },
    { key: 'status', label: 'Status' },
  ]

  return (
    <AdminLayout title="Food Management">
      <div className="admin-food-page">
        <div className="page-controls">
          <AdminSearchBar
            value={filter.search}
            onChange={handleSearch}
            placeholder="Search food items..."
          />
          <AdminButton icon="➕" onClick={handleAdd}>
            Add Food Item
          </AdminButton>
        </div>

        <AdminTable
          columns={columns}
          data={food}
          onRowClick={handleRowClick}
          loading={loading}
          emptyMessage="No food items found"
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
            title={dialog.type === 'create' ? 'Add Food Item' : 'Food Details'}
            size="md"
          >
            <div className="dialog-content">
              <div className="food-form">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" defaultValue={dialog.data?.name || ''} />
                </div>
                <div className="form-group">
                  <label>Food Type</label>
                  <input type="text" defaultValue={dialog.data?.foodType || ''} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" defaultValue={dialog.data?.location || ''} />
                </div>
                <div className="form-group">
                  <label>Price Range</label>
                  <input type="text" defaultValue={dialog.data?.priceRange || ''} />
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
