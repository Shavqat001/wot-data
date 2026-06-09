const cache = new Map()
const TTL = 5 * 60 * 1000 // 5 minutes

export function getCache(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > TTL) { cache.delete(key); return null }
  return entry.data
}

export function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() })
}

export function clearCache() { cache.clear() }
