<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authStore } from '../../application/auth.store'
import { iamApi } from '../../infrastructure/iam-api'
import { socialStore } from '../../../social/application/social.store'
import { fileToDataUrl } from '../../../shared/infrastructure/file-utils'
import InitialsAvatar from '../../../social/presentation/components/InitialsAvatar.vue'
import PostCard from '../../../social/presentation/components/PostCard.vue'

const route = useRoute()
const router = useRouter()

const profile = ref(null)
const state = reactive({
  loading: false,
  error: '',
  saving: false,
  following: false
})

const form = reactive({
  username: '',
  email: '',
  telefono: '',
  picture: ''
})

const isOwnProfile = computed(() => authStore.currentUser?.id === profile.value?.id)
const isAdmin = computed(() => authStore.currentUser?.rol === 'admin')
const publications = computed(() => socialStore.getPublicationsForUser(route.params.id))

function syncForm(user) {
  if (!user) return
  form.username = user.username || ''
  form.email = user.email || ''
  form.telefono = user.telefono || ''
  form.picture = user.picture || ''
}

async function loadProfile() {
  state.loading = true
  state.error = ''
  try {
    if (!socialStore.users.length || !socialStore.publications.length) {
      await socialStore.loadEverything()
    }

    const localUser = socialStore.getUserById(route.params.id)
    if (localUser) {
      profile.value = localUser
    } else {
      const response = await iamApi.getUserById(route.params.id)
      profile.value = response.data
    }

    syncForm(profile.value)
  } catch (error) {
    state.error = error?.response?.data?.message || 'No fue posible cargar el perfil.'
  } finally {
    state.loading = false
  }
}

async function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  form.picture = await fileToDataUrl(file)
}

async function saveProfile() {
  state.saving = true
  state.error = ''
  try {
    const updated = await authStore.updateProfile(profile.value.id, {
      requesterUserId: authStore.currentUser.id,
      username: form.username.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      picture: form.picture
    })
    profile.value = updated
    await socialStore.loadEverything()
  } catch {
    state.error = authStore.error || 'No fue posible actualizar el perfil.'
  } finally {
    state.saving = false
  }
}

async function followProfile() {
  state.following = true
  try {
    await authStore.followUser(profile.value.id)
    await socialStore.loadEverything()
  } finally {
    state.following = false
  }
}

watch(() => route.params.id, loadProfile, { immediate: true })
</script>

<template>
  <section class="surface-panel profile-page">
    <div v-if="state.error" class="error-banner">{{ state.error }}</div>

    <div v-if="profile" class="profile-page-grid">
      <div class="profile-page-summary">
        <InitialsAvatar :name="profile.username" :picture="profile.picture" :size="96" />
        <div>
          <h2>{{ profile.username }}</h2>
          <p class="muted">{{ profile.email }}</p>
          <p class="muted">{{ profile.telefono || 'Sin teléfono registrado' }}</p>
          <div class="btn-row btn-row-top-space">
            <span class="pill">{{ profile.rol }}</span>
            <span class="pill">{{ profile.followers }} seguidores</span>
            <button
              v-if="!isOwnProfile"
              class="secondary-btn"
              :disabled="state.following"
              @click="followProfile"
            >
              Seguir
            </button>
          </div>
        </div>
      </div>

      <div v-if="isOwnProfile || isAdmin" class="profile-page-editor">
        <h3>Editar perfil</h3>

        <div class="form-grid">
          <label>
            Nombre de usuario
            <input v-model="form.username" type="text" />
          </label>

          <label>
            Correo electrónico
            <input v-model="form.email" type="email" />
          </label>

          <label>
            Teléfono
            <input v-model="form.telefono" type="text" />
          </label>

          <label>
            Foto de perfil
            <input type="file" accept="image/*" @change="handleFileChange" />
          </label>

          <label>
            O pega un enlace de imagen
            <input v-model="form.picture" type="text" />
          </label>

          <div class="btn-row">
            <button class="primary-btn" :disabled="state.saving" @click="saveProfile">
              {{ state.saving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
            <button class="ghost-btn" @click="router.push('/home')">Volver al inicio</button>
          </div>
        </div>
      </div>

      <div class="profile-page-feed">
        <h3>Publicaciones de este usuario</h3>
        <div v-if="publications.length === 0" class="muted">Aún no hay publicaciones.</div>
        <PostCard
          v-for="publication in publications"
          :key="publication.id"
          :publication="publication"
          :author="profile"
          :product="socialStore.getProductById(publication.productoRelacionadoId)"
          :current-user="authStore.currentUser"
          :is-admin="isAdmin"
          :get-user-by-id="socialStore.getUserById"
          @like="socialStore.likePublication(publication.id, authStore.currentUser.id)"
          @follow="socialStore.followUser($event, authStore.currentUser.id)"
          @edit="async ({ publicationId, payload }) => { await socialStore.updatePublication(publicationId, payload); await socialStore.loadEverything() }"
          @delete="async publicationId => { await socialStore.deletePublication(publicationId, authStore.currentUser.id); await socialStore.loadEverything() }"
          @comment-add="async ({ publicationId, comentario }) => { await socialStore.addComment(publicationId, authStore.currentUser.id, comentario); await socialStore.loadEverything() }"
          @comment-update="async ({ publicationId, commentId, comentario }) => { await socialStore.updateComment(publicationId, commentId, authStore.currentUser.id, comentario); await socialStore.loadEverything() }"
          @comment-delete="async ({ publicationId, commentId }) => { await socialStore.deleteComment(publicationId, commentId, authStore.currentUser.id); await socialStore.loadEverything() }"
        />
      </div>
    </div>

    <div v-else class="muted">Cargando perfil...</div>
  </section>
</template>

<style scoped>
.profile-page {
  display: grid;
  gap: 1.25rem;
}

.profile-page-grid {
  display: grid;
  gap: 1.25rem;
}

.profile-page-summary {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.profile-page-editor,
.profile-page-feed {
  display: grid;
  gap: 1rem;
}

.error-banner {
  padding: 0.9rem 1rem;
  border-radius: 16px;
  background: rgba(239, 68, 68, 0.15);
  color: #fecaca;
}

.btn-row-top-space {
  margin-top: 1rem;
}
</style>
