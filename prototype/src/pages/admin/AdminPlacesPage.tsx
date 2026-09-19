import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminSearchBar } from '@/components/admin/AdminSearchBar'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminDialog } from '@/components/admin/AdminDialog'
import { adminService } from '@/services/admin.service'
import type { AdminPlace, FilterState, PaginationState, DialogState } from '@/types/admin.types'
import './AdminPlacesPage.css'

export function AdminPlacesPage() {
  const [places, setPlaces] = useState<AdminPlace[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterState>({ search: '', category: 'all' })
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, total: 0 })
  const [dialog, setDialog] = useState<DialogState>({ isOpen: false, type: null, data: null })
  const [form, setForm] = useState<Partial<AdminPlace>>({
    name: '', category: 'heritage', description: '', latitude: 22.3076, longitude: 73.1812,
    rating: 0, status: 'active', images: [],
  })

  const categories = ['all', 'heritage', 'spiritual', 'art', 'food', 'hidden']

  useEffect(() => {
    loadPlaces()
  }, [filter, pagination.page])

  const loadPlaces = async () => {
    setLoading(true)
    try {
      const result = adminService.getPlaces(filter, pagination)
      setPlaces(result.data)
      setPagination(prev => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('Failed to load places:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setFilter({ ...filter, search: value })
    setPagination({ ...pagination, page: 1 })
  }

  const handleCategoryChange = (category: string) => {
    setFilter({ ...filter, category })
    setPagination({ ...pagination, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page })
  }

  const handleRowClick = (place: AdminPlace) => {
    setForm(place)
    setDialog({ isOpen: true, type: 'edit', data: place })
  }

  const handleAdd = () => {
    setForm({
      name: '', category: 'heritage', description: '', latitude: 22.3076, longitude: 73.1812,
      rating: 0, status: 'active', images: [],
    })
    setDialog({ isOpen: true, type: 'create', data: null })
  }

  const closeDialog = () => setDialog({ isOpen: false, type: null, data: null })

  const updateForm = <K extends keyof AdminPlace>(key: K, value: AdminPlace[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!form.name?.trim() || !form.description?.trim()) return

    const payload = {
      name: form.name.trim(),
      category: form.category || 'heritage',
      description: form.description.trim(),
      latitude: Number(form.latitude) || 0,
      longitude: Number(form.longitude) || 0,
      rating: Number(form.rating) || 0,
      status: form.status || 'active',
      images: form.images || [],
      history: form.history,
      culturalSignificance: form.culturalSignificance,
      architecture: form.architecture,
      openingHours: form.openingHours,
      bestTime: form.bestTime,
      estimatedExplorationTime: form.estimatedExplorationTime,
    } as Omit<AdminPlace, 'id' | 'createdAt' | 'updatedAt'>

    try {
      if (dialog.type === 'create') await adminService.createPlace(payload)
      else if (dialog.type === 'edit' && dialog.data?.id) await adminService.updatePlace(dialog.data.id, payload)
      closeDialog()
      await loadPlaces()
    } catch (error) {
      console.error('Failed to save place:', error)
      window.alert(error instanceof Error ? error.message : 'Failed to save place')
    }
  }

  const handleImageUpload = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') updateForm('images', [reader.result])
    }
    reader.readAsDataURL(file)
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'rating', label: 'Rating' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created', render: (value: Date) => new Date(value).toLocaleDateString() },
  ]

  return (
    <AdminLayout title="Places Management">
      <div className="admin-places-page">
        <div className="page-controls">
          <div className="controls-left">
            <AdminSearchBar
              value={filter.search}
              onChange={handleSearch}
              placeholder="Search places..."
            />
            <div className="category-filters">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`category-filter ${filter.category === cat ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <AdminButton icon="➕" onClick={handleAdd}>
            Add Place
          </AdminButton>
        </div>

        <AdminTable
          columns={columns}
          data={places}
          onRowClick={handleRowClick}
          loading={loading}
          emptyMessage="No places found"
        />

        <AdminPagination
          currentPage={pagination.page}
          totalPages={Math.ceil(pagination.total / pagination.pageSize)}
          onPageChange={handlePageChange}
        />

        {dialog.isOpen && (
          <AdminDialog
            isOpen={dialog.isOpen}
            onClose={closeDialog}
            title={dialog.type === 'create' ? 'Add New Place' : dialog.type === 'edit' ? 'Edit Place' : dialog.type === 'delete' ? 'Delete Place' : 'Place Details'}
            size="lg"
          >
            <div className="dialog-content">
              {dialog.type === 'delete' ? (
                <div className="delete-confirmation">
                  <p>Are you sure you want to delete "{dialog.data?.name}"?</p>
                  <div className="dialog-actions">
                    <AdminButton variant="ghost" onClick={closeDialog}>
                      Cancel
                    </AdminButton>
                    <AdminButton variant="danger" onClick={() => {
                      void adminService.deletePlace(dialog.data.id).then(() => {
                        closeDialog()
                        void loadPlaces()
                      }).catch((error: unknown) => {
                        console.error('Failed to delete place:', error)
                        window.alert(error instanceof Error ? error.message : 'Failed to delete place')
                      })
                    }}>
                      Delete
                    </AdminButton>
                  </div>
                </div>
              ) : (
                <div className="place-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Name</label>
                      <input type="text" value={form.name || ''} onChange={(event) => updateForm('name', event.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select value={form.category || 'heritage'} onChange={(event) => updateForm('category', event.target.value)}>
                        {categories.filter(c => c !== 'all').map(cat => (
                          <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label>Description</label>
                      <textarea rows={3} value={form.description || ''} onChange={(event) => updateForm('description', event.target.value)} />
                    </div>
                    <div className="form-group full-width image-upload-group">
                      <label htmlFor="place-image-upload">Place image</label>
                      <div className="image-upload-control">
                        <input
                          id="place-image-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(event) => handleImageUpload(event.target.files?.[0])}
                        />
                        <span>PNG, JPG or WebP up to 2 MB</span>
                      </div>
                      {form.images?.[0] && (
                        <div className="image-upload-preview">
                          <img src={form.images[0]} alt="Selected place preview" />
                          <button type="button" onClick={() => updateForm('images', [])}>Remove image</button>
                        </div>
                      )}
                    </div>
                    <div className="form-group full-width form-section-heading">
                      <span>Place story</span>
                      <small>These details appear on the public detail page.</small>
                    </div>
                    <div className="form-group full-width">
                      <label>History</label>
                      <textarea rows={3} value={form.history || ''} onChange={(event) => updateForm('history', event.target.value)} placeholder="When was this place built? What makes it significant?" />
                    </div>
                    <div className="form-group">
                      <label>Architecture</label>
                      <textarea rows={3} value={form.architecture || ''} onChange={(event) => updateForm('architecture', event.target.value)} placeholder="Describe the style, structure or visual details" />
                    </div>
                    <div className="form-group">
                      <label>Cultural significance</label>
                      <textarea rows={3} value={form.culturalSignificance || ''} onChange={(event) => updateForm('culturalSignificance', event.target.value)} placeholder="Why does this place matter to the city?" />
                    </div>
                    <div className="form-group">
                      <label>Opening hours</label>
                      <input type="text" value={form.openingHours || ''} onChange={(event) => updateForm('openingHours', event.target.value)} placeholder="9:00 AM - 5:00 PM" />
                    </div>
                    <div className="form-group">
                      <label>Best time to visit</label>
                      <input type="text" value={form.bestTime || ''} onChange={(event) => updateForm('bestTime', event.target.value)} placeholder="October to March" />
                    </div>
                    <div className="form-group">
                      <label>Time to explore</label>
                      <input type="text" value={form.estimatedExplorationTime || ''} onChange={(event) => updateForm('estimatedExplorationTime', event.target.value)} placeholder="1-2 hours" />
                    </div>
                    <div className="form-group">
                      <label>Latitude</label>
                      <input type="number" step="any" value={form.latitude ?? ''} onChange={(event) => updateForm('latitude', Number(event.target.value))} />
                    </div>
                    <div className="form-group">
                      <label>Longitude</label>
                      <input type="number" step="any" value={form.longitude ?? ''} onChange={(event) => updateForm('longitude', Number(event.target.value))} />
                    </div>
                    <div className="form-group">
                      <label>Rating</label>
                      <input type="number" step="0.1" min="0" max="5" value={form.rating ?? ''} onChange={(event) => updateForm('rating', Number(event.target.value))} />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select value={form.status || 'active'} onChange={(event) => updateForm('status', event.target.value as AdminPlace['status'])}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>
                  <div className="dialog-actions">
                    <AdminButton variant="ghost" onClick={closeDialog}>
                      Cancel
                    </AdminButton>
                    {dialog.type === 'edit' && (
                      <AdminButton variant="danger" onClick={() => setDialog({ isOpen: true, type: 'delete', data: dialog.data })}>
                        Delete
                      </AdminButton>
                    )}
                    <AdminButton onClick={handleSave} disabled={!form.name?.trim() || !form.description?.trim()}>
                      {dialog.type === 'create' ? 'Create' : 'Save'}
                    </AdminButton>
                  </div>
                </div>
              )}
            </div>
          </AdminDialog>
        )}
      </div>
    </AdminLayout>
  )
}
