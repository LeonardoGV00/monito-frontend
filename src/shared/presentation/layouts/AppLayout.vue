<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authStore } from '../../../iam/application/auth.store'
import { socialStore } from '../../../social/application/social.store'

const router = useRouter()
const route = useRoute()

const searchQuery = computed({
  get: () => socialStore.searchQuery,
  set: value => {
    socialStore.searchQuery = value
  }
})

const canSearch = computed(() => route.name === 'home')

function getInitials(name = '') {
  const normalized = `${name}`.trim().replace(/\s+/g, ' ')
  if (!normalized) return 'MN'
  const compact = normalized.replace(/[^\p{L}\p{N}]/gu, '')
  return (compact.slice(0, 2) || 'MN').toUpperCase()
}

async function handleLogout() {
  await authStore.signOut()
  socialStore.clearInteractionState()
  await router.push('/login')
}

watch(
  () => authStore.currentUser?.id,
  userId => {
    if (userId) {
      socialStore.hydrateInteractions(userId)
    } else {
      socialStore.clearInteractionState()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="app-shell">
    <header class="app-topbar">
      <div class="app-topbar-brand">
        <div class="app-topbar-logo">M</div>
        <div>
          <div class="app-topbar-title">Moñito</div>
          <div class="app-topbar-subtitle">Red social del negocio</div>
        </div>
      </div>

      <div v-if="canSearch" class="app-topbar-search">
        <span class="search-box">
          <i class="pi pi-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar publicaciones por usuario, texto o comentario"
          />
        </span>
      </div>

      <div class="app-topbar-actions">
        <div v-if="authStore.currentUser" class="app-topbar-user">
          <div class="app-topbar-avatar">
            <img
              v-if="authStore.currentUser.picture"
              :src="authStore.currentUser.picture"
              :alt="authStore.currentUser.username"
            />
            <span v-else>{{ getInitials(authStore.currentUser.username) }}</span>
          </div>
          <div class="app-topbar-user-meta">
            <strong>{{ authStore.currentUser.username }}</strong>
            <span>@{{ authStore.currentUser.rol }}</span>
          </div>
        </div>

        <button type="button" class="secondary-btn" @click="handleLogout">
          <i class="pi pi-sign-out"></i>
          Cerrar sesión
        </button>
      </div>
    </header>

    <main class="page-container">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-topbar {
  width: min(1120px, calc(100% - 1.5rem));
  margin: 1rem auto 0;
  padding: 0.9rem 1rem;
  border-radius: 24px;
  background: #171e29;
  border: 1px solid var(--surface-border);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.22);
  display: grid;
  gap: 1rem;
  grid-template-columns: auto 1fr auto;
  align-items: center;
}

.app-topbar-brand,
.app-topbar-actions,
.app-topbar-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.app-topbar-logo,
.app-topbar-avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: #d97706;
  color: white;
  font-weight: 900;
  flex: 0 0 auto;
  overflow: hidden;
  border: 1px solid #f59e0b;
}

.app-topbar-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-topbar-title {
  font-weight: 800;
  font-size: 1.2rem;
}

.app-topbar-subtitle {
  color: var(--text-soft);
  font-size: 0.85rem;
}

.app-topbar-search {
  min-width: 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 1rem;
  border-radius: 16px;
  border: 1px solid var(--surface-border);
  background: var(--surface-2);
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.search-box:hover {
  border-color: #4b5f79;
}

.search-box i {
  color: var(--text-soft);
}

.search-box input {
  border: none;
  background: transparent;
  padding: 0;
  outline: none;
  color: white;
}

.app-topbar-user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.app-topbar-user-meta span {
  color: var(--text-soft);
  font-size: 0.82rem;
}

.app-topbar-actions {
  justify-self: end;
}

@media (max-width: 900px) {
  .app-topbar {
    grid-template-columns: 1fr;
  }

  .app-topbar-actions {
    justify-self: start;
    flex-wrap: wrap;
  }
}
</style>
