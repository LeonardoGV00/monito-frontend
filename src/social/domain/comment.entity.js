import { pickValue, pickId, toDateOrNull } from '../../shared/utils/normalize.js'

function normalizeReplies(replies) {
  if (!Array.isArray(replies)) return []
  return replies.map(raw => ({
    id: pickId(raw),
    usuarioId: String(pickValue(raw, ['usuarioId', 'UsuarioId'], '')),
    comentario: pickValue(raw, ['comentario', 'Comentario'], ''),
    fecha: toDateOrNull(pickValue(raw, ['fecha', 'Fecha'], null)),
    respuestas: [],
    editada: Boolean(pickValue(raw, ['editada', 'Editada'], false)),
    fechaEdicion: toDateOrNull(pickValue(raw, ['fechaEdicion', 'FechaEdicion'], null))
  }))
}

export class CommentEntity {
  constructor(raw = {}) {
    this.id = pickId(raw)
    this.usuarioId = String(pickValue(raw, ['usuarioId', 'UsuarioId'], ''))
    this.comentario = pickValue(raw, ['comentario', 'Comentario'], '')
    this.fecha = toDateOrNull(pickValue(raw, ['fecha', 'Fecha'], null))
    this.respuestas = normalizeReplies(pickValue(raw, ['respuestas', 'Respuestas'], []))
    this.editada = Boolean(pickValue(raw, ['editada', 'Editada'], false))
    this.fechaEdicion = toDateOrNull(pickValue(raw, ['fechaEdicion', 'FechaEdicion'], null))
  }
}
