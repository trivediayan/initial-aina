/** Vadodara (Baroda) map defaults. Other cities can be added later. */
export const CITY_PRESETS = {
  vadodara: {
    id: 'vadodara',
    name: 'Vadodara',
    center: [22.3072, 73.1812] as [number, number],
    zoom: 13,
    minZoom: 11,
    maxZoom: 18,
    /** Includes Champaner / Dabhoi nearby, not the whole world */
    maxBounds: [
      [21.95, 72.85],
      [22.70, 73.75],
    ] as [[number, number], [number, number]],
  },
} as const

export const ACTIVE_CITY = CITY_PRESETS.vadodara

export const CATEGORY_MARKER_COLORS: Record<string, string> = {
  heritage: '#9A4A32',
  architecture: '#3B5A9A',
  spiritual: '#6B3A78',
  art: '#2F5F99',
  food: '#B7770D',
  hidden: '#2F6B52',
}
