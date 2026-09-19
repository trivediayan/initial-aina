export const AINA_COLORS = {
  background: '#F0E1DF',
  gridLines: '#DECAC7',
  card: '#FAF7F4',
  primary: '#B43A26',
  primaryHover: '#8C241C',
  secondary: '#3E6B5B',
  secondaryHover: '#2B5144',
  gold: '#C99532',
  textMain: '#29201C',
  textSecondary: '#76655D',
  border: '#D5B5AE',
  icon: '#C99532',
} as const

export type AinaColor = (typeof AINA_COLORS)[keyof typeof AINA_COLORS]
