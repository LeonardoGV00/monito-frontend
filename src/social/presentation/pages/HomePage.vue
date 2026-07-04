<script setup>
import { computed, onMounted, ref } from 'vue'
import { authStore } from '../../../iam/application/auth.store'
import { socialStore } from '../../application/social.store'
import PostCard from '../components/PostCard.vue'
import PostComposerDialog from '../components/PostComposerDialog.vue'

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

.surface-panel-error {
  border-color: #7c2d2d;
  background: #4a1f1f;
  color: #ffd7da;
}
</style>
