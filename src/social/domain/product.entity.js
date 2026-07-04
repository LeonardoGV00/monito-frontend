import { pickValue, pickId } from '../../shared/utils/normalize.js'

export class ProductEntity {
  constructor(raw = {}) {
    this.id = pickId(raw)
    this.nombre = pickValue(raw, ['nombre', 'Nombre'], '')
    this.descripcion = pickValue(raw, ['descripcion', 'Descripcion'], '')
    this.categoria = pickValue(raw, ['categoria', 'Categoria'], '')
    this.precio = Number(pickValue(raw, ['precio', 'Precio'], 0) || 0)
    this.stock = Number(pickValue(raw, ['stock', 'Stock'], 0) || 0)
    this.imagen = pickValue(raw, ['imagen', 'Imagen'], '')
  }
}
