export function splitTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function joinTags(tags: string[]) {
  return tags.join(', ')
}

export function compactPath(path: string, maxLength = 62) {
  if (path.length <= maxLength) {
    return path
  }

  const separator = path.includes('\\') ? '\\' : '/'
  const parts = path.split(separator).filter(Boolean)
  if (parts.length <= 2) {
    return `...${path.slice(-(maxLength - 3))}`
  }

  const end = parts.slice(-2).join(separator)
  const start = path.startsWith(separator) ? separator : parts[0]
  return `${start}${separator}...${separator}${end}`
}
