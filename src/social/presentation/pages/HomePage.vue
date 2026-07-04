<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../../../iam/application/auth.store'
import { socialStore } from '../../application/social.store'
import PostCard from '../components/PostCard.vue'
import PostComposerDialog from '../components/PostComposerDialog.vue'

const router = useRouter()
const composerVisible = ref(false)

const publications = computed(() => socialStore.getFilteredPublications())
const currentUser = computed(() => authStore.currentUser)
const isAdmin = computed(() => authStore.currentUser?.rol === 'admin')

async function ensureData() {
  if (!socialStore.users.length || !socialStore.publications.length || !socialStore.products.length) {
    await socialStore.loadEverything()
  }
}

async function handleCreatePublication(payload) {
  await socialStore.createPublication(payload)
}

async function handleEditPublication({ publicationId, payload }) {
  await socialStore.updatePublication(publicationId, payload)
}

async function handleDeletePublication(publicationId) {
  if (!authStore.currentUser) return
  await socialStore.deletePublication(publicationId, authStore.currentUser.id)
}

async function handleLike(publicationId) {
  if (!authStore.currentUser) return
  await socialStore.likePublication(publicationId, authStore.currentUser.id)
}

async function handleFollow(userId) {
  if (!authStore.currentUser) return
  await socialStore.followUser(userId, authStore.currentUser.id)
}

async function handleAddComment({ publicationId, comentario }) {
  if (!authStore.currentUser) return
  await socialStore.addComment(publicationId, authStore.currentUser.id, comentario)
}

async function handleUpdateComment({ publicationId, commentId, comentario }) {
  if (!authStore.currentUser) return
  await socialStore.updateComment(publicationId, commentId, authStore.currentUser.id, comentario)
}

async function handleDeleteComment({ publicationId, commentId }) {
  if (!authStore.currentUser) return
  await socialStore.deleteComment(publicationId, commentId, authStore.currentUser.id)
}

function openProfile(userId) {
  router.push(`/profile/user/${userId}`)
}

onMounted(ensureData)
</script>

<template>
  <section class="home-page">
    <div class="surface-panel home-page-toolbar">
      <div>
        <h2 class="section-title">Publicaciones</h2>
        <p class="muted">
          {{ publications.length }} resultado(s)
          <span v-if="socialStore.searchQuery"> para "{{ socialStore.searchQuery }}"</span>
        </p>
      </div>

      <button type="button" class="primary-btn" @click="composerVisible = true">
        <i class="pi pi-plus"></i>
        Nueva publicación
      </button>
    </div>

    <PostComposerDialog
      v-model:visible="composerVisible"
      :products="socialStore.products"
      @submit="handleCreatePublication"
    />

    <div v-if="socialStore.error" class="surface-panel surface-panel-error">
      {{ socialStore.error }}
    </div>

    <div v-if="socialStore.loading" class="surface-panel muted">
      Cargando contenido...
    </div>

    <div v-else-if="publications.length === 0" class="surface-panel muted">
      No hay publicaciones que coincidan con la búsqueda.
    </div>

    <PostCard
      v-for="publication in publications"
      :key="publication.id"
      :publication="publication"
      :author="socialStore.getUserById(publication.autorId)"
      :product="socialStore.getProductById(publication.productoRelacionadoId)"
      :products="socialStore.products"
      :current-user="currentUser"
      :is-admin="isAdmin"
      :get-user-by-id="socialStore.getUserById"
      @like="handleLike"
      @follow="handleFollow"
      @edit="handleEditPublication"
      @delete="handleDeletePublication"
      @comment-add="handleAddComment"
      @comment-update="handleUpdateComment"
      @comment-delete="handleDeleteComment"
    />

    <div class="surface-panel home-page-profiles">
      <h3>Perfiles recientes</h3>
      <div class="home-page-profiles-grid">
        <button
          v-for="user in socialStore.users.slice(0, 6)"
          :key="user.id"
          type="button"
          class="home-page-profile-chip"
          @click="openProfile(user.id)"
        >
          {{ user.username }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-page {
  display: grid;
  gap: 1rem;
}

.home-page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.home-page-profiles {
  display: grid;
  gap: 0.75rem;
}

.home-page-profiles-grid {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.home-page-profile-chip {
  border: 1px solid #39485d;
  background: #1f2836;
  color: white;
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.home-page-profile-chip:hover {
  background: #263244;
  border-color: #526680;
}

.surface-panel-error {
  border-color: #7c2d2d;
  background: #4a1f1f;
  color: #ffd7da;
}
</style>
