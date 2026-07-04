<script setup>
import { computed, reactive, ref } from 'vue'
import { socialStore } from '../../application/social.store'
import { fileToDataUrl } from '../../../shared/infrastructure/file-utils'
import InitialsAvatar from './InitialsAvatar.vue'
import CommentThread from './CommentThread.vue'

const props = defineProps({
  publication: { type: Object, required: true },
  author: { type: Object, default: null },
  product: { type: Object, default: null },
  products: { type: Array, default: () => [] },
  currentUser: { type: Object, default: null },
  isAdmin: { type: Boolean, default: false },
  getUserById: { type: Function, default: () => null }
})

const emit = defineEmits(['like', 'follow', 'edit', 'delete', 'comment-add', 'comment-update', 'comment-delete'])

const commentsOpen = ref(false)
const editingPublication = ref(false)
const editFileInput = ref(null)

const publicationDraft = reactive({
  titulo: '',
  descripcion: '',
  productoRelacionadoId: '',
  mediaUrl: '',
  mediaDataUrl: ''
})

const mainMedia = computed(() => props.publication.multimedia?.[0] || null)
const isLiked = computed(() => Boolean(props.currentUser && socialStore.isPublicationLiked(props.publication.id, props.currentUser.id)))
const isFollowingAuthor = computed(() => Boolean(
  props.author &&
  props.currentUser &&
  props.author.id !== props.currentUser.id &&
  socialStore.isUserFollowed(props.author.id, props.currentUser.id)
))

const productOptions = computed(() => props.products.map(product => ({
  label: `${product.nombre} — ${product.categoria}`,
  value: product.id
})))

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function canManagePublication() {
  if (!props.currentUser) return false
  return props.isAdmin || props.currentUser.id === props.publication.autorId
}

function resetDraft() {
  publicationDraft.titulo = props.publication.titulo
  publicationDraft.descripcion = props.publication.descripcion
  publicationDraft.productoRelacionadoId = props.publication.productoRelacionadoId
  publicationDraft.mediaUrl = props.publication.multimedia?.[0]?.url || ''
  publicationDraft.mediaDataUrl = ''
  if (editFileInput.value) {
    editFileInput.value.value = ''
  }
}

function startEditPublication() {
  resetDraft()
  editingPublication.value = true
}

function cancelEditPublication() {
  editingPublication.value = false
}

function clearEditFileInput() {
  if (editFileInput.value) {
    editFileInput.value.value = ''
  }
}

async function handleEditFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) {
    publicationDraft.mediaDataUrl = ''
    return
  }

  publicationDraft.mediaDataUrl = await fileToDataUrl(file)
  publicationDraft.mediaUrl = ''
  clearEditFileInput()
}

function onEditMediaLinkInput() {
  if (publicationDraft.mediaUrl.trim()) {
    publicationDraft.mediaDataUrl = ''
    clearEditFileInput()
  }
}

function savePublication() {
  const mediaUrl = publicationDraft.mediaDataUrl || publicationDraft.mediaUrl.trim()
  emit('edit', {
    publicationId: props.publication.id,
    payload: {
      requesterUserId: props.currentUser?.id || '',
      autorId: props.publication.autorId,
      productoRelacionadoId: publicationDraft.productoRelacionadoId,
      titulo: publicationDraft.titulo,
      descripcion: publicationDraft.descripcion,
      multimedia: mediaUrl
        ? [{ tipo: 'imagen', url: mediaUrl, formato: 'image/*' }]
        : []
    }
  })
  editingPublication.value = false
}

function toggleComments() {
  commentsOpen.value = !commentsOpen.value
}

function handleLikeClick() {
  emit('like', props.publication.id)
}

function handleFollowClick() {
  emit('follow', props.author.id)
}

function handleCommentAdd(text) {
  emit('comment-add', { publicationId: props.publication.id, comentario: text })
}

function handleCommentUpdate(payload) {
  emit('comment-update', { publicationId: props.publication.id, ...payload })
}

function handleCommentDelete(commentId) {
  emit('comment-delete', { publicationId: props.publication.id, commentId })
}
</script>

<template>
  <article class="surface-card post-card">
    <div class="post-card-header">
      <div class="post-card-author">
        <InitialsAvatar
          :name="author?.username || 'Usuario eliminado'"
          :picture="author?.picture || ''"
          :size="48"
        />
        <div class="post-card-author-meta">
          <div class="post-card-author-line">
            <strong>{{ author?.username || 'Usuario eliminado' }}</strong>
            <span v-if="author?.rol === 'admin'" class="pill">admin</span>
          </div>
          <div class="muted">
            {{ formatDate(publication.fechaPublicacion) }}
            <span v-if="publication.editada || publication.fechaEdicion"> · editado</span>
          </div>
        </div>
      </div>

      <div v-if="canManagePublication()" class="post-card-actions">
        <button type="button" class="icon-btn" title="Editar publicación" @click="startEditPublication">
          <i class="pi pi-pencil"></i>
        </button>
        <button type="button" class="icon-btn danger" title="Eliminar publicación" @click="emit('delete', publication.id)">
          <i class="pi pi-trash"></i>
        </button>
      </div>
    </div>

    <div v-if="editingPublication" class="post-card-editor">
      <label>
        Producto relacionado
        <pv-dropdown
          v-model="publicationDraft.productoRelacionadoId"
          :options="productOptions"
          option-label="label"
          option-value="value"
          placeholder="Selecciona un producto"
          class="full-width-control"
        />
      </label>

      <label>
        Título
        <input v-model="publicationDraft.titulo" type="text" />
      </label>

      <label>
        Descripción
        <textarea v-model="publicationDraft.descripcion"></textarea>
      </label>

      <label>
        Imagen opcional
        <input
          ref="editFileInput"
          type="file"
          accept="image/*"
          :disabled="Boolean(publicationDraft.mediaUrl.trim())"
          @change="handleEditFileChange"
        />
      </label>

      <label>
        Enlace de imagen opcional
        <input
          v-model="publicationDraft.mediaUrl"
          type="text"
          placeholder="https://..."
          :disabled="Boolean(publicationDraft.mediaDataUrl)"
          @input="onEditMediaLinkInput"
        />
      </label>

      <small v-if="publicationDraft.mediaDataUrl || publicationDraft.mediaUrl.trim()">
        Solo puedes usar una fuente de imagen.
      </small>

      <div class="btn-row">
        <button type="button" class="primary-btn" @click="savePublication">Guardar</button>
        <button type="button" class="ghost-btn" @click="cancelEditPublication">Cancelar</button>
      </div>
    </div>

    <template v-else>
      <div v-if="mainMedia?.url" class="post-card-media">
        <img :src="mainMedia.url" :alt="publication.titulo" />
      </div>

      <h3 class="post-card-title">{{ publication.titulo }}</h3>
      <p class="post-card-text">{{ publication.descripcion }}</p>

      <div v-if="product" class="post-card-product">
        <span class="pill">Producto relacionado</span>
        <strong>{{ product.nombre }}</strong>
        <span class="muted">{{ product.categoria }}</span>
      </div>

      <div class="post-card-interaction-row">
        <button
          type="button"
          class="secondary-btn"
          :class="{ 'action-toggle-liked': isLiked }"
          :aria-pressed="isLiked"
          :disabled="!currentUser"
          @click="handleLikeClick"
        >
          <i class="pi pi-heart"></i>
          {{ isLiked ? `Quitar me gusta · ${publication.likes}` : `Me gusta · ${publication.likes}` }}
        </button>

        <button type="button" class="secondary-btn" :aria-expanded="commentsOpen" @click="toggleComments">
          <i class="pi pi-comments"></i>
          {{ commentsOpen ? 'Ocultar comentarios' : 'Ver comentarios' }} ({{ publication.comentarios?.length || 0 }})
        </button>

        <button
          v-if="author && currentUser && author.id !== currentUser.id"
          type="button"
          class="secondary-btn"
          :class="{ 'action-toggle-following': isFollowingAuthor }"
          :aria-pressed="isFollowingAuthor"
          :disabled="!currentUser"
          @click="handleFollowClick"
        >
          <i class="pi pi-user-plus"></i>
          {{ isFollowingAuthor ? 'Dejar de seguir' : 'Seguir' }}
        </button>
      </div>

      <div v-show="commentsOpen" class="post-card-comments">
        <CommentThread
          :publication="publication"
          :comments="publication.comentarios || []"
          :current-user="currentUser"
          :get-user-by-id="getUserById"
          :can-manage-publication="canManagePublication()"
          :can-edit-publication="canManagePublication()"
          @add="handleCommentAdd"
          @update="handleCommentUpdate"
          @delete="handleCommentDelete"
        />
      </div>
    </template>
  </article>
</template>

<style scoped>
.post-card {
  display: grid;
  gap: 1rem;
  padding: 1.1rem;
}

.post-card-header,
.post-card-author,
.post-card-author-line,
.post-card-interaction-row,
.post-card-product {
  display: flex;
  gap: 0.8rem;
}

.post-card-header {
  justify-content: space-between;
  align-items: flex-start;
}

.post-card-author {
  align-items: center;
}

.post-card-author-meta {
  display: grid;
  gap: 0.2rem;
}

.post-card-author-line {
  align-items: center;
}

.post-card-actions {
  display: flex;
  gap: 0.25rem;
}

.post-card-media img {
  width: 100%;
  border-radius: 18px;
  display: block;
  max-height: 420px;
  object-fit: cover;
  border: 1px solid #39485d;
}

.post-card-title {
  margin: 0;
}

.post-card-text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: #f3efe9;
}

.post-card-product {
  align-items: center;
  flex-wrap: wrap;
}

.post-card-interaction-row {
  flex-wrap: wrap;
}

.post-card-comments {
  margin-top: 0.35rem;
}

.post-card-editor {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 20px;
  border: 1px solid #314155;
  background: #141b26;
}

.post-card-editor label {
  display: grid;
  gap: 0.45rem;
  color: #e5edf7;
}

.post-card-editor .btn-row {
  justify-content: flex-end;
}

.full-width-control {
  width: 100%;
}

.secondary-btn.action-toggle-liked,
.secondary-btn.action-toggle-following {
  border-color: transparent;
}
</style>
