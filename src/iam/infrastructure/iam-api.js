import { http } from '../../shared/infrastructure/http'

export const iamApi = {
  signIn(payload) {
    return http.post('/auth/sign-in', payload)
  },
  signUp(payload) {
    return http.post('/auth/sign-up', payload)
  },
  signOut() {
    return http.post('/auth/sign-out')
  },
  getUsers() {
    return http.get('/users')
  },
  getUserById(id) {
    return http.get(`/users/${id}`)
  },
  updateUser(id, payload) {
    return http.put(`/users/${id}`, payload)
  },
  followUser(targetUserId, followerUserId) {
    return http.post(`/users/${targetUserId}/follow`, { followerUserId })
  }
}
