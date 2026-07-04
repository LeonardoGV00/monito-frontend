<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { authStore } from '../../../iam/application/auth.store'
import { fileToDataUrl } from '../../../shared/infrastructure/file-utils'

const props = defineProps({
  visible: { type: Boolean, default: false },
  products: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:visible', 'submit'])

const fileInput = ref(null)

const form = reactive({
  productoRelacionadoId: '',
  titulo: '',
  descripcion: '',
  mediaUrl: '',
  mediaDataUrl: ''
})

const selectedProductOptions = computed(() => props.products.map(product => ({
  label: `${product.nombre} — ${product.categoria}`,
  value: product.id
})))

const usingLocalFile = computed(() => Boolean(form.mediaDataUrl))
const usingLink = computed(() => Boolean(form.mediaUrl.trim()))

function resetForm() {
  form.productoRelacionadoId = props.products[0]?.id || ''
  form.titulo = ''
  form.descripcion = ''
  form.mediaUrl = ''
  form.mediaDataUrl = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

watch(
  () => props.visible,
  visible => {
    if (visible) {
      resetForm()
    }
  }
)

function clearFileInput() {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function onMediaLinkInput() {
  if (form.mediaUrl.trim()) {
    form.mediaDataUrl = ''
    clearFileInput()
  }
}

async function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) {
    form.mediaDataUrl = ''
    return
  }

  form.mediaDataUrl = await fileToDataUrl(file)
  form.mediaUrl = ''
  clearFileInput()
}

function submit() {
  if (!authStore.currentUser) return
  if (!form.productoRelacionadoId || !form.titulo.trim() || !form.descripcion.trim()) return

  const mediaUrl = form.mediaDataUrl || form.mediaUrl.trim()
  const multimedia = mediaUrl
    ? [{ tipo: 'imagen', url: mediaUrl, formato: 'image/*' }]
    : []

  emit('submit', {
    autorId: authStore.currentUser.id,
    productoRelacionadoId: form.productoRelacionadoId,
    titulo: form.titulo.trim(),
    descripcion: form.descripcion.trim(),
    multimedia
  })
  emit('update:visible', false)
}
</script>

<template>
  <pv-dialog
    :visible="visible"
    modal
    class="post-composer-dialog"
    header="Crear publicación"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="form-grid">
      <label>
        Producto relacionado
        <pv-dropdown
          v-model="form.productoRelacionadoId"
          :options="selectedProductOptions"
          option-label="label"
          option-value="value"
          placeholder="Selecciona un producto"
          class="full-width-control"
        />
      </label>

      <label>
        Título
        <input v-model="form.titulo" type="text" placeholder="Escribe el título de la publicación" />
      </label>

      <label>
        Descripción
        <textarea v-model="form.descripcion" placeholder="Cuéntale a la comunidad sobre el producto"></textarea>
      </label>

      <label>
        Imagen opcional
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          :disabled="usingLink"
          @change="handleFileChange"
        />
      </label>

      <label>
        Enlace de imagen opcional
        <input
          v-model="form.mediaUrl"
          type="text"
          placeholder="https://..."
          :disabled="usingLocalFile"
          @input="onMediaLinkInput"
        />
      </label>

      <small v-if="usingLocalFile || usingLink">
        Solo puedes usar una fuente de imagen por publicación.
      </small>

      <div class="btn-row btn-row-end">
        <button type="button" class="ghost-btn" @click="$emit('update:visible', false)">Cancelar</button>
        <button type="button" class="primary-btn" @click="submit">Publicar</button>
      </div>
    </div>
  </pv-dialog>
</template>

<style scoped>
.post-composer-dialog {
  width: min(760px, 96vw);
}

.btn-row-end {
  justify-content: flex-end;
}

.full-width-control {
  width: 100%;
}
</style>
