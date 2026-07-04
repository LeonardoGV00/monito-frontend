import { reactive } from 'vue'
import { socialApi } from '../infrastructure/social-api'
import { iamApi } from '../../iam/infrastructure/iam-api'
import { PublicationEntity } from '../domain/publication.entity'
import { ProductEntity } from '../domain/product.entity'
import { CommentEntity } from '../domain/comment.entity'

function normalizeUser(raw = {}) {
  return {
    id: raw.id || '',
    username: raw.username || '',
    email: raw.email || '',
    rol: raw.rol || 'cliente',
    telefono: raw.telefono || '',
    picture: raw.picture || '',
    followers: Number(raw.followers || 0),
    fechaRegistro: raw.fechaRegistro || null
  }
}

function normalizePublication(raw = {}) {
  const publication = new PublicationEntity(raw)
  publication.multimedia = (raw.multimedia || []).map(item => ({
    tipo: item?.tipo || 'imagen',
    url: item?.url || '',
    formato: item?.formato || ''
  }))
  publication.comentarios = (raw.comentarios || []).map(item => ({
    ...new CommentEntity(item)
  }))
  return publication
}

function normalizeProduct(raw = {}) {
  return new ProductEntity(raw)
}

function matchPublication(publication, author, product, query) {
  if (!query) return true
  const haystack = [
    author?.username,
    publication.titulo,
    publication.descripcion,
    product?.nombre,
    product?.categoria,
    ...(publication.comentarios || []).map(comment => comment.comentario),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(query.toLowerCase())
}

export const socialStore = reactive({
  publications: [],
  products: [],
  users: [],
  loading: false,
  error: '',
  searchQuery: '',
  async loadEverything() {
    this.loading = true
    this.error = ''
    try {
      const [pubs, products, users] = await Promise.all([
        socialApi.getPublications(),
        socialApi.getProducts(),
        iamApi.getUsers()
      ])
      this.publications = (pubs.data || []).map(normalizePublication)
      this.products = (products.data || []).map(normalizeProduct)
      this.users = (users.data || []).map(normalizeUser)
    } catch (error) {
      this.error = error?.response?.data?.message || 'No fue posible cargar el contenido.'
      throw error
    } finally {
      this.loading = false
    }
  },
  getUserById(userId) {
    return this.users.find(user => user.id === userId) || null
  },
  getProductById(productId) {
    return this.products.find(product => product.id === productId) || null
  },
  getPublicationById(publicationId) {
    return this.publications.find(publication => publication.id === publicationId) || null
  },
  getPublicationsForUser(userId) {
    return this.publications
      .filter(publication => publication.autorId === userId)
      .sort((a, b) => new Date(b.fechaPublicacion || 0) - new Date(a.fechaPublicacion || 0))
  },
  getFilteredPublications(query = this.searchQuery) {
    const normalizedQuery = (query || '').trim().toLowerCase()
    return [...this.publications]
      .sort((a, b) => new Date(b.fechaPublicacion || 0) - new Date(a.fechaPublicacion || 0))
      .filter(publication => {
        const author = this.getUserById(publication.autorId)
        const product = this.getProductById(publication.productoRelacionadoId)
        return matchPublication(publication, author, product, normalizedQuery)
      })
  },
  upsertPublication(rawPublication) {
    const normalized = normalizePublication(rawPublication)
    const index = this.publications.findIndex(item => item.id === normalized.id)
    if (index >= 0) {
      this.publications.splice(index, 1, normalized)
    } else {
      this.publications.unshift(normalized)
    }
    return normalized
  },
  replacePublication(publicationId, rawPublication) {
    const normalized = normalizePublication(rawPublication)
    const index = this.publications.findIndex(item => item.id === publicationId)
    if (index >= 0) {
      this.publications.splice(index, 1, normalized)
    }
    return normalized
  },
  removePublication(publicationId) {
    this.publications = this.publications.filter(item => item.id !== publicationId)
  },
  async createPublication(payload) {
    const response = await socialApi.createPublication(payload)
    return this.upsertPublication(response.data)
  },
  async updatePublication(publicationId, payload) {
    const response = await socialApi.updatePublication(publicationId, payload)
    const updated = response.data.publication || response.data
    return this.replacePublication(publicationId, updated)
  },
  async deletePublication(publicationId, requesterUserId) {
    await socialApi.deletePublication(publicationId, requesterUserId)
    this.removePublication(publicationId)
  },
  async likePublication(publicationId, userId) {
    await socialApi.likePublication(publicationId, { userId })
    const publication = this.getPublicationById(publicationId)
    if (publication) publication.likes += 1
  },
  async addComment(publicationId, userId, comentario) {
    const response = await socialApi.addComment(publicationId, { userId, comentario })
    const publication = this.getPublicationById(publicationId)
    if (publication) {
      publication.comentarios.unshift({
        id: response.data.commentId || response.data.id || `tmp-${Date.now()}`,
        usuarioId: userId,
        comentario,
        fecha: new Date().toISOString(),
        respuestas: [],
        editada: false,
        fechaEdicion: null
      })
    }
    return response.data
  },
  async updateComment(publicationId, commentId, userId, comentario) {
    const response = await socialApi.updateComment(publicationId, commentId, { userId, comentario })
    const publication = this.getPublicationById(publicationId)
    const updated = response.data.comment || response.data
    if (publication) {
      const index = publication.comentarios.findIndex(item => item.id === commentId)
      if (index >= 0) {
        publication.comentarios.splice(index, 1, {
          ...publication.comentarios[index],
          ...updated
        })
      }
    }
    return updated
  },
  async deleteComment(publicationId, commentId, requesterUserId) {
    await socialApi.deleteComment(publicationId, commentId, requesterUserId)
    const publication = this.getPublicationById(publicationId)
    if (publication) {
      publication.comentarios = publication.comentarios.filter(item => item.id !== commentId)
    }
  },
  async followUser(targetUserId, followerUserId) {
    await iamApi.followUser(targetUserId, followerUserId)
    const user = this.getUserById(targetUserId)
    if (user) user.followers += 1
  }
})
