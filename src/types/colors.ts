export const colorTokens = [
  'slate',
  'blue',
  'sky',
  'teal',
  'green',
  'amber',
  'orange',
  'red',
  'rose',
  'purple',
  'violet',
] as const

export type ColorToken = (typeof colorTokens)[number]

export const colorLabels: Record<ColorToken, string> = {
  slate: 'Slate',
  blue: 'Blue',
  sky: 'Sky',
  teal: 'Teal',
  green: 'Green',
  amber: 'Amber',
  orange: 'Orange',
  red: 'Red',
  rose: 'Rose',
  purple: 'Purple',
  violet: 'Violet',
}
