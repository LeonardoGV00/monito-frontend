import { reactive } from 'vue'

const STORAGE_KEY = 'monitonet.session.user'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const sessionStore = reactive({
  currentUser: typeof window !== 'undefined' ? readStoredUser() : null,
  setCurrentUser(user) {
    this.currentUser = user
    if (typeof window !== 'undefined') {
      writeStoredUser(user)
    }
  },
  clear() {
    this.currentUser = null
    if (typeof window !== 'undefined') {
      writeStoredUser(null)
    }
  }
})
