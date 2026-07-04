import { reactive } from 'vue'
import { iamApi } from '../infrastructure/iam-api'
import { sessionStore } from '../../shared/application/session.store'

function normalizeUser(user) {
  if (!user) return null
  return {
    id: user.id || '',
    username: user.username || '',
    email: user.email || '',
    rol: user.rol || 'cliente',
    telefono: user.telefono || '',
    picture: user.picture || '',
    followers: Number(user.followers || 0),
    fechaRegistro: user.fechaRegistro || null
  }
}

export const authStore = reactive({
  currentUser: sessionStore.currentUser,
  loading: false,
  error: '',
  setSession(user) {
    this.currentUser = normalizeUser(user)
    sessionStore.setCurrentUser(this.currentUser)
  },
  hydrate() {
    this.currentUser = sessionStore.currentUser
  },
  async signIn(login, password) {
    this.loading = true
    this.error = ''
    try {
      const response = await iamApi.signIn({ login, password })
      this.setSession(response.data.user)
      return this.currentUser
    } catch (error) {
      this.error = error?.response?.data?.message || 'No fue posible iniciar sesión.'
      throw error
    } finally {
      this.loading = false
    }
  },
  async signUp(payload) {
    this.loading = true
    this.error = ''
    try {
      const response = await iamApi.signUp(payload)
      this.setSession(response.data)
      return this.currentUser
    } catch (error) {
      this.error = error?.response?.data?.message || 'No fue posible registrar la cuenta.'
      throw error
    } finally {
      this.loading = false
    }
  },
  async signOut() {
    try {
      await iamApi.signOut()
    } catch {
      // Se limpia la sesión local incluso si el backend no responde.
    } finally {
      this.currentUser = null
      sessionStore.clear()
    }
  },
  async updateProfile(userId, payload) {
    this.loading = true
    this.error = ''
    try {
      const response = await iamApi.updateUser(userId, payload)
      const updated = normalizeUser(response.data.user || response.data)
      if (updated) {
        this.setSession(updated)
      }
      return updated
    } catch (error) {
      this.error = error?.response?.data?.message || 'No fue posible actualizar el perfil.'
      throw error
    } finally {
      this.loading = false
    }
  },
  async followUser(targetUserId) {
    if (!this.currentUser) return false
    await iamApi.followUser(targetUserId, this.currentUser.id)
    return true
  }
})
