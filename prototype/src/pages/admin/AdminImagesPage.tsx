import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminSearchBar } from '@/components/admin/AdminSearchBar'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminButton } from '@/components/admin/AdminButton'
import { adminService } from '@/services/admin.service'
import type { AdminImage, FilterState, PaginationState } from '@/types/admin.types'
import './AdminImagesPage.css'

export function AdminImagesPage() {
  const [images, setImages] = useState<AdminImage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterState>({ search: '' })
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 12, total: 0 })

  useEffect(() => {
    loadImages()
  }, [filter, pagination.page])

  const loadImages = async () => {
    setLoading(true)
    try {
      const result = adminService.getImages(filter, pagination)
      setImages(result.data)
      setPagination(prev => ({ ...prev, total: result.total }))
    } catch (error) {
      console.error('Failed to load images:', error)
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

  const columns = [
    { 
      key: 'url', 
      label: 'Image',
      render: (value: string) => (
        <div className="image-thumbnail">
          <img src={value} alt="Place" />
        </div>
      )
    },
    { key: 'placeName', label: 'Place' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
  ]

  return (
    <AdminLayout title="Images Management">
      <div className="admin-images-page">
        <div className="page-controls">
          <AdminSearchBar
            value={filter.search}
            onChange={handleSearch}
            placeholder="Search images by place name..."
          />
          <AdminButton icon="📤">
            Upload Image
          </AdminButton>
        </div>

        <AdminTable
          columns={columns}
          data={images}
          loading={loading}
          emptyMessage="No images found"
        />

        <AdminPagination
          currentPage={pagination.page}
          totalPages={Math.ceil(pagination.total / pagination.pageSize)}
          onPageChange={handlePageChange}
        />
      </div>
    </AdminLayout>
  )
}
