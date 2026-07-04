export class ProductEntity {
  constructor(raw = {}) {
    this.id = raw.id || ''
    this.nombre = raw.nombre || ''
    this.descripcion = raw.descripcion || ''
    this.categoria = raw.categoria || ''
    this.precio = Number(raw.precio || 0)
    this.stock = Number(raw.stock || 0)
    this.imagen = raw.imagen || ''
  }
}
