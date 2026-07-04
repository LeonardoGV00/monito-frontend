export function pickValue(raw = {}, keys = [], fallback = '') {
  if (!raw || typeof raw !== 'object') return fallback
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null && raw[key] !== '') return raw[key]
  }
  return fallback
}

export function pickId(raw = {}, fallback = '') {
  return String(pickValue(raw, ['id', '_id', 'Id', 'ID'], fallback) || fallback)
}

export function toDateOrNull(value) {
  return value || null
}
