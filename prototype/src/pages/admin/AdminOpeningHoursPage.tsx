import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminButton } from '@/components/admin/AdminButton'
import { AdminDialog } from '@/components/admin/AdminDialog'
import { adminService } from '@/services/admin.service'
import { mapService } from '@/services/map.service'
import type { OpeningHours, DialogState } from '@/types/admin.types'
import './AdminOpeningHoursPage.css'

export function AdminOpeningHoursPage() {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('')
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([])
  const [loading, setLoading] = useState(false)
  const [dialog, setDialog] = useState<DialogState>({ isOpen: false, type: null, data: null })

  const places = mapService.getPlaces()

  useEffect(() => {
    if (selectedPlaceId) {
      loadOpeningHours()
    }
  }, [selectedPlaceId])

  const loadOpeningHours = async () => {
    setLoading(true)
    try {
      const data = adminService.getOpeningHours(selectedPlaceId)
      setOpeningHours(data)
    } catch (error) {
      console.error('Failed to load opening hours:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceChange = (placeId: string) => {
    setSelectedPlaceId(placeId)
  }

  const handleEdit = (hours: OpeningHours) => {
    setDialog({ isOpen: true, type: 'edit', data: hours })
  }

  const columns = [
    { key: 'day', label: 'Day' },
    { 
      key: 'openTime', 
      label: 'Hours',
      render: (value: string, row: OpeningHours) => (
        <span>
          {row.isClosed ? 'Closed' : `${value} - ${row.closeTime}`}
        </span>
      )
    },
    { key: 'isClosed', label: 'Status', render: (value: boolean) => (
      <span className={`status-badge ${value ? 'closed' : 'open'}`}>
        {value ? 'Closed' : 'Open'}
      </span>
    )},
  ]

  return (
    <AdminLayout title="Opening Hours Management">
      <div className="admin-opening-hours-page">
        <div className="page-controls">
          <div className="place-selector">
            <label>Select Place:</label>
            <select
              value={selectedPlaceId}
              onChange={(e) => handlePlaceChange(e.target.value)}
            >
              <option value="">Choose a place...</option>
              {places.map(place => (
                <option key={place.id} value={place.id}>{place.name}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedPlaceId && (
          <>
            <AdminTable
              columns={columns}
              data={openingHours}
              onRowClick={handleEdit}
              loading={loading}
              emptyMessage="No opening hours found"
            />

            {dialog.isOpen && (
              <AdminDialog
                isOpen={dialog.isOpen}
                onClose={() => setDialog({ isOpen: false, type: null, data: null })}
                title={`Edit ${dialog.data?.day} Hours`}
                size="sm"
              >
                <div className="dialog-content">
                  <div className="hours-form">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={dialog.data?.isClosed || false}
                          onChange={(e) => {
                            const updated = { ...dialog.data, isClosed: e.target.checked }
                            setDialog({ ...dialog, data: updated })
                          }}
                        />
                        Closed on this day
                      </label>
                    </div>
                    {!dialog.data?.isClosed && (
                      <>
                        <div className="form-group">
                          <label>Opening Time</label>
                          <input
                            type="time"
                            defaultValue={dialog.data?.openTime || '09:00'}
                          />
                        </div>
                        <div className="form-group">
                          <label>Closing Time</label>
                          <input
                            type="time"
                            defaultValue={dialog.data?.closeTime || '17:00'}
                          />
                        </div>
                      </>
                    )}
                    <div className="dialog-actions">
                      <AdminButton variant="ghost" onClick={() => setDialog({ isOpen: false, type: null, data: null })}>
                        Cancel
                      </AdminButton>
                      <AdminButton onClick={() => {
                        adminService.updateOpeningHours(dialog.data)
                        setDialog({ isOpen: false, type: null, data: null })
                        loadOpeningHours()
                      }}>
                        Save
                      </AdminButton>
                    </div>
                  </div>
                </div>
              </AdminDialog>
            )}
          </>
        )}

        {!selectedPlaceId && (
          <div className="empty-state">
            <div className="empty-icon">🕐</div>
            <h3>Select a Place</h3>
            <p>Choose a place from the dropdown to manage its opening hours</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
