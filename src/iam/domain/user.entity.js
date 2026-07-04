import { pickValue, pickId } from '../../shared/utils/normalize.js'

export class UserEntity {
  constructor(raw = {}) {
    this.id = pickId(raw)
    this.username = pickValue(raw, ['username', 'Username'], '')
    this.email = pickValue(raw, ['email', 'Email'], '')
    this.rol = pickValue(raw, ['rol', 'Rol'], 'cliente')
    this.telefono = pickValue(raw, ['telefono', 'Telefono'], '')
    this.picture = pickValue(raw, ['picture', 'Picture'], '')
    this.followers = Number(pickValue(raw, ['followers', 'Followers'], 0) || 0)
    this.fechaRegistro = pickValue(raw, ['fechaRegistro', 'FechaRegistro'], null)
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
