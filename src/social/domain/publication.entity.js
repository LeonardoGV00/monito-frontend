export class PublicationEntity {
  constructor(raw = {}) {
    this.id = raw.id || ''
    this.autorId = raw.autorId || ''
    this.productoRelacionadoId = raw.productoRelacionadoId || ''
    this.titulo = raw.titulo || ''
    this.descripcion = raw.descripcion || ''
    this.multimedia = Array.isArray(raw.multimedia) ? raw.multimedia : []
    this.likes = Number(raw.likes || 0)
    this.comentarios = Array.isArray(raw.comentarios) ? raw.comentarios : []
    this.fechaPublicacion = raw.fechaPublicacion || null
    this.editada = Boolean(raw.editada || false)
    this.fechaEdicion = raw.fechaEdicion || null
  }
}
