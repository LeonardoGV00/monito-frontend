import { http } from '../../shared/infrastructure/http'

export const socialApi = {
  getPublications() {
    return http.get('/publications')
  },
  getPublicationById(id) {
    return http.get(`/publications/${id}`)
  },
  createPublication(payload) {
    return http.post('/publications', payload)
  },
  updatePublication(id, payload) {
    return http.put(`/publications/${id}`, payload)
  },
  deletePublication(id, requesterUserId) {
    return http.delete(`/publications/${id}`, { params: { requesterUserId } })
  },
  likePublication(id, payload) {
    return http.post(`/publications/${id}/like`, payload)
  },
  addComment(publicationId, payload) {
    return http.post(`/publications/${publicationId}/comments`, payload)
  },
  updateComment(publicationId, commentId, payload) {
    return http.put(`/publications/${publicationId}/comments/${commentId}`, payload)
  },
  deleteComment(publicationId, commentId, requesterUserId) {
    return http.delete(`/publications/${publicationId}/comments/${commentId}`, { params: { requesterUserId } })
  },
  getProducts() {
    return http.get('/products')
  }
}
