import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Search,
  LocateFixed,
} from 'lucide-react'
import type { PlaceCategory } from '@/types/dashboard.types'
import { getMapItems, type MapItem } from '@/services/catalog.service'
import { ACTIVE_CITY, CATEGORY_MARKER_COLORS } from '@/constants/geo'
import { useMap } from '@/contexts/MapContext'
import { toDetailPath } from '@/services/catalog.service'
import './Map.css'

interface MapProps {
  selectedCategory: PlaceCategory
  searchQuery: string
  onSearchQueryChange: (query: string) => void
}

function markerHtml(color: string) {
  return `<span class="map-pin" style="--pin-color:${color}"><span class="map-pin-dot"></span></span>`
}

function userMarkerHtml() {
  return `<span class="user-loc"><span class="user-loc-pulse"></span><span class="user-loc-core"></span></span>`
}

function popupHtml(item: MapItem) {
  const image = item.image
    ? `<img src="${item.image}" alt="" class="map-popup-image" />`
    : ''
  const rating = item.rating ? `<span class="popup-rating">${item.rating.toFixed(1)}</span>` : ''
  return `
    <div class="map-popup">
      ${image}
      <div class="map-popup-body">
        <p class="popup-category">${item.category}</p>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        ${rating}
      </div>
    </div>
  `
}

export function Map({
  selectedCategory,
  searchQuery,
  onSearchQueryChange,
}: MapProps) {
  const navigate = useNavigate()
  const { focusedPlace, clearFocusedPlace } = useMap()
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const markerByIdRef = useRef(new globalThis.Map<string, L.Marker>())
  const [items, setItems] = useState<MapItem[]>([])
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    const syncItems = () => setItems(getMapItems(selectedCategory))
    syncItems()
    window.addEventListener('ayna:places-updated', syncItems)
    return () => window.removeEventListener('ayna:places-updated', syncItems)
  }, [selectedCategory])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: ACTIVE_CITY.center,
      zoom: ACTIVE_CITY.zoom,
      minZoom: ACTIVE_CITY.minZoom,
      maxZoom: ACTIVE_CITY.maxZoom,
      maxBounds: ACTIVE_CITY.maxBounds,
      maxBoundsViscosity: 0.85,
      zoomControl: false,
      attributionControl: true,
    })

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: ACTIVE_CITY.maxZoom,
    }).addTo(map)

    markersLayerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markersLayerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = markersLayerRef.current
    if (!map || !layer) return

    const baseItems = getMapItems(selectedCategory)
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const nextItems = normalizedQuery
      ? baseItems.filter((item) => {
          const haystack = `${item.name} ${item.description} ${item.category}`.toLowerCase()
          return haystack.includes(normalizedQuery)
        })
      : baseItems

    setItems(nextItems)

    layer.clearLayers()
    markerByIdRef.current.clear()

    nextItems.forEach((item) => {
      const color = CATEGORY_MARKER_COLORS[item.category] || '#9A4A32'
      const marker = L.marker(item.coordinates, {
        icon: L.divIcon({
          className: 'aayna-marker',
          html: markerHtml(color),
          iconSize: [28, 36],
          iconAnchor: [14, 34],
          popupAnchor: [0, -28],
        }),
      })

      marker.bindPopup(popupHtml(item), { className: 'aayna-popup', maxWidth: 260 })
      marker.on('popupopen', () => {
        const el = marker.getPopup()?.getElement()
        el?.querySelector('.map-popup')?.addEventListener('click', () => {
          navigate(toDetailPath(item.kind, item.sourceId))
        })
      })
      marker.addTo(layer)
      markerByIdRef.current.set(item.mapId, marker)
    })
  }, [selectedCategory, searchQuery, navigate])

  useEffect(() => {
    if (!focusedPlace || !mapRef.current) return
    const map = mapRef.current
    map.setView(focusedPlace.coordinates, 16, { animate: true })
    const existing = markerByIdRef.current.get(focusedPlace.mapId)
    if (existing) {
      existing.openPopup()
    } else {
      const temp = L.marker(focusedPlace.coordinates, {
        icon: L.divIcon({
          className: 'aayna-marker',
          html: markerHtml(CATEGORY_MARKER_COLORS[focusedPlace.category || 'heritage'] || '#9A4A32'),
          iconSize: [28, 36],
          iconAnchor: [14, 34],
        }),
      }).addTo(map)
      temp.bindPopup(`<div class="map-popup"><div class="map-popup-body"><h3>${focusedPlace.name}</h3><p>${focusedPlace.description || ''}</p></div></div>`).openPopup()
    }
    clearFocusedPlace()
  }, [focusedPlace, clearFocusedPlace, items])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Location is not supported in this browser.')
      return
    }
    setLocating(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latlng: [number, number] = [position.coords.latitude, position.coords.longitude]
        const map = mapRef.current
        if (!map) return
        map.setView(latlng, 15, { animate: true })
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(latlng)
        } else {
          userMarkerRef.current = L.marker(latlng, {
            icon: L.divIcon({
              className: 'aayna-user-marker',
              html: userMarkerHtml(),
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            }),
            zIndexOffset: 1000,
          }).addTo(map)
        }
        userMarkerRef.current.bindPopup('You are here').openPopup()
        setLocating(false)
      },
      (error) => {
        setLocating(false)
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Enable it in your browser to see your position.')
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError('Your location is currently unavailable.')
        } else {
          setLocationError('Could not read your location. Try again.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="map-container">
      <div className="map-controls">
        <form onSubmit={handleSearch} className="search-bar">
          <Search size={16} strokeWidth={1.8} className="search-icon" />
          <input
            type="search"
            placeholder="Search Vadodara places..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="search-input"
            aria-label="Search places"
          />
        </form>

        <button
          type="button"
          className="location-button"
          onClick={handleCurrentLocation}
          disabled={locating}
        >
          <LocateFixed size={15} strokeWidth={1.8} />
          {locating ? 'Finding you…' : 'My Location'}
        </button>

        {locationError && (
          <p className="location-error" role="alert">{locationError}</p>
        )}
      </div>

      <div ref={mapContainerRef} className="map" />
    </div>
  )
}
