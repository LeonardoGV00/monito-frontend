export class CommentEntity {
  constructor(raw = {}) {
    this.id = raw.id || ''
    this.usuarioId = raw.usuarioId || ''
    this.comentario = raw.comentario || ''
    this.fecha = raw.fecha || null
    this.respuestas = Array.isArray(raw.respuestas) ? raw.respuestas : []
    this.editada = Boolean(raw.editada || false)
    this.fechaEdicion = raw.fechaEdicion || null
  }
}
