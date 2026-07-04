import { pickValue, pickId, toDateOrNull } from '../../shared/utils/normalize.js'

export class PublicationEntity {
  constructor(raw = {}) {
    this.id = pickId(raw)
    this.autorId = String(pickValue(raw, ['autorId', 'AutorId'], ''))
    this.productoRelacionadoId = String(pickValue(raw, ['productoRelacionadoId', 'ProductoRelacionadoId'], ''))
    this.titulo = pickValue(raw, ['titulo', 'Titulo'], '')
    this.descripcion = pickValue(raw, ['descripcion', 'Descripcion'], '')
    this.multimedia = Array.isArray(pickValue(raw, ['multimedia', 'Multimedia'], []))
      ? pickValue(raw, ['multimedia', 'Multimedia'], [])
      : []
    this.likes = Number(pickValue(raw, ['likes', 'Likes'], 0) || 0)
    this.comentarios = Array.isArray(pickValue(raw, ['comentarios', 'Comentarios'], []))
      ? pickValue(raw, ['comentarios', 'Comentarios'], [])
      : []
    this.fechaPublicacion = toDateOrNull(pickValue(raw, ['fechaPublicacion', 'FechaPublicacion'], null))
    this.editada = Boolean(pickValue(raw, ['editada', 'Editada'], false))
    this.fechaEdicion = toDateOrNull(pickValue(raw, ['fechaEdicion', 'FechaEdicion'], null))
  }
}
