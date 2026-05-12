import { colorLabels, colorTokens, type ColorToken } from '../types/colors'

export const defaultColorToken: ColorToken = 'slate'

export function resolveColorToken(color?: ColorToken): ColorToken {
  return color && colorTokens.includes(color) ? color : defaultColorToken
}

export function colorClass(color?: ColorToken) {
  return `pd-color-${resolveColorToken(color)}`
}

export function colorLabel(color?: ColorToken) {
  return colorLabels[resolveColorToken(color)]
}
