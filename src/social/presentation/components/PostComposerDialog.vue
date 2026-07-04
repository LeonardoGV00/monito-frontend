<script setup>
import { computed, reactive, watch } from 'vue'
import { authStore } from '../../../iam/application/auth.store'
import { fileToDataUrl } from '../../../shared/infrastructure/file-utils'

const props = defineProps({
  visible: { type: Boolean, default: false },
  products: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:visible', 'submit'])

const form = reactive({
  productoRelacionadoId: '',
  titulo: '',
  descripcion: '',
  mediaUrl: ''
})

const selectedProductOptions = computed(() => props.products.map(product => ({
  label: `${product.nombre} — ${product.categoria}`,
  value: product.id
})))

function resetForm() {
  form.productoRelacionadoId = props.products[0]?.id || ''
  form.titulo = ''
  form.descripcion = ''
  form.mediaUrl = ''
}

watch(
  () => props.visible,
  visible => {
    if (visible) {
      resetForm()
    }
  }
)

async function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  form.mediaUrl = await fileToDataUrl(file)
}

function submit() {
  if (!authStore.currentUser) return
  if (!form.productoRelacionadoId || !form.titulo.trim() || !form.descripcion.trim()) return

  const multimedia = form.mediaUrl
    ? [{ tipo: 'imagen', url: form.mediaUrl, formato: 'image/*' }]
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
        <input type="file" accept="image/*" @change="handleFileChange" />
      </label>

      <label>
        Enlace de imagen opcional
        <input v-model="form.mediaUrl" type="text" placeholder="https://..." />
      </label>

      <div class="btn-row btn-row-end">
        <button class="ghost-btn" @click="$emit('update:visible', false)">Cancelar</button>
        <button class="primary-btn" @click="submit">Publicar</button>
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
