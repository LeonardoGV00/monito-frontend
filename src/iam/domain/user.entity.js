export class UserEntity {
  constructor(raw = {}) {
    this.id = raw.id || ''
    this.username = raw.username || ''
    this.email = raw.email || ''
    this.rol = raw.rol || 'cliente'
    this.telefono = raw.telefono || ''
    this.picture = raw.picture || ''
    this.followers = Number(raw.followers || 0)
    this.fechaRegistro = raw.fechaRegistro || null
  }

  get initials() {
    const value = this.username.trim()
    if (!value) return 'MN'
    const parts = value.split(/\s+/).filter(Boolean)
    const first = parts[0]?.[0] || 'M'
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : value[1] || 'N'
    return `${first}${second}`.toUpperCase()
  }
}
