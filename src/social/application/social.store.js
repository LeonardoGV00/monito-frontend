import { reactive } from 'vue'
import { pickValue, pickId } from '../../shared/utils/normalize.js'
import { socialApi } from '../infrastructure/social-api'
import { iamApi } from '../../iam/infrastructure/iam-api'
import { PublicationEntity } from '../domain/publication.entity'
import { ProductEntity } from '../domain/product.entity'
import { CommentEntity } from '../domain/comment.entity'

function normalizeUser(raw = {}) {
  return {
    id: pickId(raw),
    username: pickValue(raw, ['username', 'Username'], ''),
    email: pickValue(raw, ['email', 'Email'], ''),
    rol: pickValue(raw, ['rol', 'Rol'], 'cliente'),
    telefono: pickValue(raw, ['telefono', 'Telefono'], ''),
    picture: pickValue(raw, ['picture', 'Picture'], ''),
    followers: Number(pickValue(raw, ['followers', 'Followers'], 0) || 0),
    followersBase: Number(pickValue(raw, ['followers', 'Followers'], 0) || 0),
    fechaRegistro: pickValue(raw, ['fechaRegistro', 'FechaRegistro'], null)
  }
}

function normalizePublication(raw = {}) {
  const publication = new PublicationEntity(raw)
  publication.likes = Number(pickValue(raw, ['likes', 'Likes'], 0) || 0)
  publication.likesBase = Number(pickValue(raw, ['likes', 'Likes'], 0) || 0)
  publication.multimedia = (pickValue(raw, ['multimedia', 'Multimedia'], []) || []).map(item => ({
    tipo: pickValue(item, ['tipo', 'Tipo'], 'imagen'),
    url: pickValue(item, ['url', 'Url'], ''),
    formato: pickValue(item, ['formato', 'Formato'], '')
  }))
  publication.comentarios = (pickValue(raw, ['comentarios', 'Comentarios'], []) || []).map(item => new CommentEntity(item))
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
    ...(publication.comentarios || []).map(comment => comment.comentario)
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(query.toLowerCase())
}

function interactionStorageKey(userId) {
  return `monitonet.social.interactions.${userId || 'guest'}.v2`
}

function normalizeIdArray(value) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

function normalizeNumberMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, amount]) => [String(key), Number(amount || 0)])
      .filter(([, amount]) => Number.isFinite(amount) && amount !== 0)
  )
}

function readInteractionState(userId) {
  if (typeof window === 'undefined' || !userId) {
    return {
      likedPublicationIds: [],
      likedPublicationServerIds: [],
      publicationLikeOffsets: {},
      followedUserIds: [],
      followedUserServerIds: [],
      userFollowerOffsets: {}
    }
  }

  try {
    const raw = localStorage.getItem(interactionStorageKey(userId))
    if (!raw) {
      return {
        likedPublicationIds: [],
        likedPublicationServerIds: [],
        publicationLikeOffsets: {},
        followedUserIds: [],
        followedUserServerIds: [],
        userFollowerOffsets: {}
      }
    }

    const parsed = JSON.parse(raw)
    return {
      likedPublicationIds: normalizeIdArray(parsed?.likedPublicationIds),
      likedPublicationServerIds: normalizeIdArray(parsed?.likedPublicationServerIds),
      publicationLikeOffsets: normalizeNumberMap(parsed?.publicationLikeOffsets),
      followedUserIds: normalizeIdArray(parsed?.followedUserIds),
      followedUserServerIds: normalizeIdArray(parsed?.followedUserServerIds),
      userFollowerOffsets: normalizeNumberMap(parsed?.userFollowerOffsets)
    }
  } catch {
    return {
      likedPublicationIds: [],
      likedPublicationServerIds: [],
      publicationLikeOffsets: {},
      followedUserIds: [],
      followedUserServerIds: [],
      userFollowerOffsets: {}
    }
  }
}

function writeInteractionState(userId, state) {
  if (typeof window === 'undefined' || !userId) {
    return
  }

  const payload = {
    likedPublicationIds: Array.from(new Set((state.likedPublicationIds || []).map(String))).filter(Boolean),
    likedPublicationServerIds: Array.from(new Set((state.likedPublicationServerIds || []).map(String))).filter(Boolean),
    publicationLikeOffsets: normalizeNumberMap(state.publicationLikeOffsets),
    followedUserIds: Array.from(new Set((state.followedUserIds || []).map(String))).filter(Boolean),
    followedUserServerIds: Array.from(new Set((state.followedUserServerIds || []).map(String))).filter(Boolean),
    userFollowerOffsets: normalizeNumberMap(state.userFollowerOffsets)
  }

  localStorage.setItem(interactionStorageKey(userId), JSON.stringify(payload))
}

function uniquePush(target, value) {
  const normalized = String(value || '').trim()
  if (!normalized) return
  if (!target.includes(normalized)) target.push(normalized)
}

function uniqueRemove(target, value) {
  const normalized = String(value || '').trim()
  if (!normalized) return
  const index = target.indexOf(normalized)
  if (index >= 0) target.splice(index, 1)
}

export const socialStore = reactive({
  publications: [],
  products: [],
  users: [],
  loading: false,
  error: '',
  searchQuery: '',
  interactionUserId: '',
  likedPublicationIds: [],
  likedPublicationServerIds: [],
  publicationLikeOffsets: {},
  followedUserIds: [],
  followedUserServerIds: [],
  userFollowerOffsets: {},

  hydrateInteractions(userId) {
    this.interactionUserId = userId || ''
    const state = readInteractionState(this.interactionUserId)
    this.likedPublicationIds = state.likedPublicationIds
    this.likedPublicationServerIds = state.likedPublicationServerIds
    this.publicationLikeOffsets = state.publicationLikeOffsets
    this.followedUserIds = state.followedUserIds
    this.followedUserServerIds = state.followedUserServerIds
    this.userFollowerOffsets = state.userFollowerOffsets
    this.applyInteractionCounters()
  },

  clearInteractionState() {
    this.interactionUserId = ''
    this.likedPublicationIds = []
    this.likedPublicationServerIds = []
    this.publicationLikeOffsets = {}
    this.followedUserIds = []
    this.followedUserServerIds = []
    this.userFollowerOffsets = {}
    this.restoreBaseCounters()
  },

  persistInteractionState() {
    if (!this.interactionUserId) return
    writeInteractionState(this.interactionUserId, {
      likedPublicationIds: this.likedPublicationIds,
      likedPublicationServerIds: this.likedPublicationServerIds,
      publicationLikeOffsets: this.publicationLikeOffsets,
      followedUserIds: this.followedUserIds,
      followedUserServerIds: this.followedUserServerIds,
      userFollowerOffsets: this.userFollowerOffsets
    })
  },

  applyInteractionCounters() {
    this.publications.forEach(publication => {
      publication.likes = Number(publication.likesBase || 0) + Number(this.publicationLikeOffsets[publication.id] || 0)
    })

    this.users.forEach(user => {
      user.followers = Number(user.followersBase || 0) + Number(this.userFollowerOffsets[user.id] || 0)
    })
  },

  restoreBaseCounters() {
    this.publications.forEach(publication => {
      publication.likes = Number(publication.likesBase || 0)
    })

    this.users.forEach(user => {
      user.followers = Number(user.followersBase || 0)
    })
  },

  isPublicationLiked(publicationId, userId = this.interactionUserId) {
    if (!userId || userId !== this.interactionUserId) {
      const state = readInteractionState(userId)
      return state.likedPublicationIds.includes(String(publicationId))
    }

    return this.likedPublicationIds.includes(String(publicationId))
  },

  isUserFollowed(targetUserId, userId = this.interactionUserId) {
    if (!userId || userId !== this.interactionUserId) {
      const state = readInteractionState(userId)
      return state.followedUserIds.includes(String(targetUserId))
    }

    return this.followedUserIds.includes(String(targetUserId))
  },

  async likePublication(publicationId, userId = this.interactionUserId) {
    if (!userId) return false

    const publication = this.getPublicationById(publicationId)
    if (!publication) return false

    const alreadyLiked = this.isPublicationLiked(publicationId, userId)

    if (alreadyLiked) {
      uniqueRemove(this.likedPublicationIds, publicationId)
      publication.likes = Math.max(0, Number(publication.likes || 0) - 1)
      this.publicationLikeOffsets[String(publicationId)] = -1
      this.persistInteractionState()
      return false
    }

    uniquePush(this.likedPublicationIds, publicationId)
    publication.likes = Number(publication.likes || 0) + 1
    this.publicationLikeOffsets[String(publicationId)] = 0
    this.persistInteractionState()

    try {
      await socialApi.likePublication(publicationId, { userId })
    } catch (error) {
      uniqueRemove(this.likedPublicationIds, publicationId)
      publication.likes = Math.max(0, Number(publication.likes || 0) - 1)
      this.publicationLikeOffsets[String(publicationId)] = -1
      this.persistInteractionState()
      throw error
    }

    return true
  },

  async followUser(targetUserId, followerUserId = this.interactionUserId) {
    if (!followerUserId) return false

    const user = this.getUserById(targetUserId)
    if (!user) return false

    const alreadyFollowing = this.isUserFollowed(targetUserId, followerUserId)

    if (alreadyFollowing) {
      uniqueRemove(this.followedUserIds, targetUserId)
      user.followers = Math.max(0, Number(user.followers || 0) - 1)
      this.userFollowerOffsets[String(targetUserId)] = -1
      this.persistInteractionState()
      return false
    }

    uniquePush(this.followedUserIds, targetUserId)
    user.followers = Number(user.followers || 0) + 1
    this.userFollowerOffsets[String(targetUserId)] = 0
    this.persistInteractionState()

    try {
      await iamApi.followUser(targetUserId, followerUserId)
    } catch (error) {
      uniqueRemove(this.followedUserIds, targetUserId)
      user.followers = Math.max(0, Number(user.followers || 0) - 1)
      this.userFollowerOffsets[String(targetUserId)] = -1
      this.persistInteractionState()
      throw error
    }

    return true
  },

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
      this.applyInteractionCounters()
    } catch (error) {
      this.error = error?.response?.data?.message || 'No fue posible cargar el contenido.'
      throw error
    } finally {
      this.loading = false
    }
  },

  getUserById(userId) {
    const users = Array.isArray(this?.users) ? this.users : []
    return users.find(user => user.id === userId) || null
  },

  getProductById(productId) {
    const products = Array.isArray(this?.products) ? this.products : []
    return products.find(product => product.id === productId) || null
  },

  getPublicationById(publicationId) {
    const publications = Array.isArray(this?.publications) ? this.publications : []
    return publications.find(publication => publication.id === publicationId) || null
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
    this.applyInteractionCounters()
    return normalized
  },

  replacePublication(publicationId, rawPublication) {
    const normalized = normalizePublication(rawPublication)
    const index = this.publications.findIndex(item => item.id === publicationId)
    if (index >= 0) {
      this.publications.splice(index, 1, normalized)
    }
    this.applyInteractionCounters()
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

  async addComment(publicationId, userId, comentario) {
    const response = await socialApi.addComment(publicationId, { userId, comentario })
    const publication = this.getPublicationById(publicationId)
    if (publication) {
      publication.comentarios.unshift({
        id: pickId(response.data, `tmp-${Date.now()}`),
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
  }
})
