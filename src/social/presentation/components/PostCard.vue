<script setup>
import { computed, ref } from 'vue'
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
const publicationDraft = ref({
  titulo: props.publication.titulo,
  descripcion: props.publication.descripcion,
  productoRelacionadoId: props.publication.productoRelacionadoId,
  mediaUrl: props.publication.multimedia?.[0]?.url || ''
})

const mainMedia = computed(() => props.publication.multimedia?.[0] || null)

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

function startEditPublication() {
  publicationDraft.value = {
    titulo: props.publication.titulo,
    descripcion: props.publication.descripcion,
    productoRelacionadoId: props.publication.productoRelacionadoId,
    mediaUrl: props.publication.multimedia?.[0]?.url || ''
  }
  editingPublication.value = true
}

function cancelEditPublication() {
  editingPublication.value = false
}

function savePublication() {
  emit('edit', {
    publicationId: props.publication.id,
    payload: {
      requesterUserId: props.currentUser?.id || '',
      autorId: props.publication.autorId,
      productoRelacionadoId: publicationDraft.value.productoRelacionadoId,
      titulo: publicationDraft.value.titulo,
      descripcion: publicationDraft.value.descripcion,
      multimedia: publicationDraft.value.mediaUrl
        ? [{ tipo: 'imagen', url: publicationDraft.value.mediaUrl, formato: 'image/*' }]
        : []
    }
  })
  editingPublication.value = false
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
        <button class="icon-btn" title="Editar publicación" @click="startEditPublication">
          <i class="pi pi-pencil"></i>
        </button>
        <button class="icon-btn danger" title="Eliminar publicación" @click="emit('delete', publication.id)">
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
        Imagen (enlace o base64)
        <input v-model="publicationDraft.mediaUrl" type="text" />
      </label>
      <div class="btn-row">
        <button class="primary-btn" @click="savePublication">Guardar</button>
        <button class="ghost-btn" @click="cancelEditPublication">Cancelar</button>
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
        <button class="secondary-btn" @click="emit('like', publication.id)">
          <i class="pi pi-heart"></i>
          Me gusta · {{ publication.likes }}
        </button>

        <button class="secondary-btn" @click="commentsOpen = !commentsOpen">
          <i class="pi pi-comments"></i>
          Ver comentarios ({{ publication.comentarios?.length || 0 }})
        </button>

        <button
          v-if="author && currentUser && author.id !== currentUser.id"
          class="secondary-btn"
          @click="emit('follow', author.id)"
        >
          <i class="pi pi-user-plus"></i>
          Seguir
        </button>
      </div>

      <div v-if="commentsOpen" class="post-card-comments">
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
}

.post-card-title {
  margin: 0;
}

.post-card-text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: #eff6ff;
}

.post-card-product {
  align-items: center;
  flex-wrap: wrap;
}

.post-card-interaction-row {
  align-items: center;
  flex-wrap: wrap;
}

.post-card-comments {
  padding-top: 0.5rem;
}

.post-card-editor {
  display: grid;
  gap: 0.9rem;
}

.post-card-editor label {
  display: grid;
  gap: 0.45rem;
}

.full-width-control {
  width: 100%;
}
</style>
