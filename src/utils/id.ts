export function createId(prefix: string) {
  const randomPart = crypto.getRandomValues(new Uint32Array(2)).join('')
  return `${prefix}_${Date.now().toString(36)}_${randomPart}`
}
