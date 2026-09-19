import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminDialog } from '@/components/admin/AdminDialog'
import { adminService } from '@/services/admin.service'
import type { AdminCategory, DialogState } from '@/types/admin.types'
import './AdminCategoriesPage.css'

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialog, setDialog] = useState<DialogState>({ isOpen: false, type: null, data: null })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const data = adminService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = (category: AdminCategory) => {
    setDialog({ isOpen: true, type: 'view', data: category })
  }

  const handleAdd = () => {
    setDialog({ isOpen: true, type: 'create', data: null })
  }

  const columns = [
    { 
      key: 'name', 
      label: 'Name',
      render: (value: string, row: AdminCategory) => (
        <div className="category-name-cell">
          <span className="category-icon">{row.icon}</span>
          <span>{value}</span>
        </div>
      )
    },
    { key: 'description', label: 'Description' },
    { key: 'placeCount', label: 'Places' },
    { key: 'status', label: 'Status' },
  ]

  return (
    <AdminLayout title="Categories Management">
      <div className="admin-categories-page">
        <div className="page-controls">
          <AdminButton icon="➕" onClick={handleAdd}>
            Add Category
          </AdminButton>
        </div>

        <AdminTable
          columns={columns}
          data={categories}
          onRowClick={handleRowClick}
          loading={loading}
          emptyMessage="No categories found"
        />

        {dialog.isOpen && (
          <AdminDialog
            isOpen={dialog.isOpen}
            onClose={() => setDialog({ isOpen: false, type: null, data: null })}
            title={dialog.type === 'create' ? 'Add Category' : 'Category Details'}
            size="md"
          >
            <div className="dialog-content">
              <div className="category-form">
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" defaultValue={dialog.data?.name || ''} />
                </div>
                <div className="form-group">
                  <label>Icon</label>
                  <input type="text" defaultValue={dialog.data?.icon || ''} placeholder="🏛️" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows={2} defaultValue={dialog.data?.description || ''} />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input type="color" defaultValue={dialog.data?.color || '#B43A26'} />
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
