<script setup>
import { ref } from 'vue'
import InitialsAvatar from './InitialsAvatar.vue'

const props = defineProps({
  publication: { type: Object, required: true },
  comments: { type: Array, required: true },
  currentUser: { type: Object, default: null },
  getUserById: { type: Function, default: () => null },
  canManagePublication: { type: Boolean, default: false },
  canEditPublication: { type: Boolean, default: false }
})

const emit = defineEmits(['add', 'update', 'delete'])

const draft = ref('')
const editingCommentId = ref('')
const editingText = ref('')

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

function canManageComment(comment) {
  const current = props.currentUser
  if (!current) return false
  return props.canManagePublication || comment.usuarioId === current.id
}

function startEdit(comment) {
  editingCommentId.value = comment.id
  editingText.value = comment.comentario
}

function cancelEdit() {
  editingCommentId.value = ''
  editingText.value = ''
}

function submitComment() {
  const content = draft.value.trim()
  if (!content) return
  emit('add', content)
  draft.value = ''
}

function saveEdit(comment) {
  const content = editingText.value.trim()
  if (!content) return
  emit('update', { commentId: comment.id, comentario: content })
  cancelEdit()
}
</script>

<template>
  <section class="comment-thread">
    <div class="comment-thread-header">
      <strong>Comentarios</strong>
      <span class="muted">{{ comments.length }} publicación(es)</span>
    </div>

    <div class="comment-thread-composer">
      <InitialsAvatar
        :name="currentUser?.username || 'Moñito'"
        :picture="currentUser?.picture || ''"
        :size="44"
      />
      <div class="comment-thread-composer-body">
        <strong>{{ currentUser?.username || 'Invitado' }}</strong>
        <textarea v-model="draft" placeholder="Escribe un comentario"></textarea>
        <div class="btn-row comment-thread-composer-actions">
          <button type="button" class="primary-btn" @click="submitComment">Comentar</button>
        </div>
      </div>
    </div>

    <div v-if="comments.length === 0" class="comment-thread-empty muted">
      Todavía no hay comentarios.
    </div>

    <article v-for="comment in comments" :key="comment.id" class="comment-item">
      <div class="comment-item-header">
        <InitialsAvatar
          :name="getUserById(comment.usuarioId)?.username || 'Usuario'"
          :picture="getUserById(comment.usuarioId)?.picture || ''"
          :size="38"
        />
        <div class="comment-item-meta">
          <strong>{{ getUserById(comment.usuarioId)?.username || 'Usuario eliminado' }}</strong>
          <span>{{ formatDate(comment.fecha) }}</span>
          <span v-if="comment.editada || comment.fechaEdicion" class="pill">editado</span>
        </div>

        <div v-if="canManageComment(comment)" class="comment-item-actions">
          <button type="button" class="icon-btn" title="Editar comentario" @click="startEdit(comment)">
            <i class="pi pi-pencil"></i>
          </button>
          <button type="button" class="icon-btn danger" title="Eliminar comentario" @click="$emit('delete', comment.id)">
            <i class="pi pi-trash"></i>
          </button>
        </div>
      </div>

      <div v-if="editingCommentId === comment.id" class="comment-item-edit">
        <textarea v-model="editingText"></textarea>
        <div class="btn-row">
          <button type="button" class="primary-btn" @click="saveEdit(comment)">Guardar</button>
          <button type="button" class="ghost-btn" @click="cancelEdit">Cancelar</button>
        </div>
      </div>

      <p v-else class="comment-item-text">{{ comment.comentario }}</p>
    </article>
  </section>
</template>

<style scoped>
.comment-thread {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #314155;
  border-radius: 20px;
  background: #141b26;
}

.comment-thread-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.comment-thread-composer {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.9rem;
  align-items: start;
  padding: 0.95rem;
  border: 1px solid var(--surface-border);
  background: #1a2230;
  border-radius: 18px;
}

.comment-thread-composer-body {
  display: grid;
  gap: 0.7rem;
}

.comment-thread-composer-actions {
  justify-content: flex-end;
}

.comment-item {
  padding: 1rem 0;
  border-top: 1px solid #2f3d50;
}

.comment-item-header {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
}

.comment-item-meta {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
}

.comment-item-meta span {
  color: var(--text-soft);
  font-size: 0.82rem;
}

.comment-item-actions {
  display: flex;
  gap: 0.25rem;
}

.comment-item-actions .danger {
  color: #ffd4d8;
}

.comment-item-text {
  margin: 0.7rem 0 0 3.2rem;
  color: #f3efe9;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-item-edit {
  margin-left: 3.2rem;
  display: grid;
  gap: 0.7rem;
}

.comment-thread-empty {
  padding: 0.75rem 0;
  margin-left: 3.2rem;
}
</style>
