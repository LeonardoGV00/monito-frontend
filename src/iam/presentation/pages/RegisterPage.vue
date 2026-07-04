<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { authStore } from '../../application/auth.store'
import { fileToDataUrl } from '../../../shared/infrastructure/file-utils'

const router = useRouter()
const pictureFileInput = ref(null)

const form = reactive({
  username: '',
  email: '',
  password: '',
  telefono: '',
  pictureUrl: '',
  pictureDataUrl: ''
})

const state = reactive({
  loading: false,
  error: ''
})

const usingLocalPicture = computed(() => Boolean(form.pictureDataUrl))
const usingPictureLink = computed(() => Boolean(form.pictureUrl.trim()))

function clearFileInput() {
  if (pictureFileInput.value) {
    pictureFileInput.value.value = ''
  }
}

function onPictureLinkInput() {
  if (form.pictureUrl.trim()) {
    form.pictureDataUrl = ''
    clearFileInput()
  }
}

async function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) {
    form.pictureDataUrl = ''
    return
  }

  form.pictureDataUrl = await fileToDataUrl(file)
  form.pictureUrl = ''
  clearFileInput()
}

async function handleSubmit() {
  state.loading = true
  state.error = ''
  try {
    await authStore.signUp({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      telefono: form.telefono.trim(),
      picture: form.pictureDataUrl || form.pictureUrl.trim()
    })
    await router.push('/home')
  } catch {
    state.error = authStore.error || 'No fue posible crear la cuenta.'
  } finally {
    state.loading = false
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-card surface-panel">
      <div class="auth-card-brand">
        <div class="auth-card-logo">M</div>
        <div>
          <h1>Crear cuenta</h1>
          <p class="muted">Únete a Moñito y comparte publicaciones</p>
        </div>
      </div>

      <div class="auth-card-highlight">
        Completa tus datos para entrar a la red social y mostrar tus productos o reseñas.
      </div>

      <div v-if="state.error" class="error-banner">{{ state.error }}</div>

      <div class="form-grid">
        <label>
          Nombre de usuario
          <input v-model="form.username" type="text" placeholder="ej. ana_torres" />
        </label>

        <label>
          Correo electrónico
          <input v-model="form.email" type="email" placeholder="correo@ejemplo.com" />
        </label>

        <label>
          Contraseña
          <input v-model="form.password" type="password" placeholder="Mínimo 6 caracteres" />
        </label>

        <label>
          Teléfono opcional
          <input v-model="form.telefono" type="text" />
        </label>

        <label>
          Foto de perfil opcional
          <input
            ref="pictureFileInput"
            type="file"
            accept="image/*"
            :disabled="usingPictureLink"
            @change="handleFileChange"
          />
        </label>

        <label>
          O pega un enlace de imagen
          <input
            v-model="form.pictureUrl"
            type="text"
            placeholder="https://..."
            :disabled="usingLocalPicture"
            @input="onPictureLinkInput"
          />
        </label>

        <small v-if="usingLocalPicture || usingPictureLink">
          Solo puedes usar una opción de imagen: archivo local o enlace.
        </small>

        <button type="button" class="primary-btn" :disabled="state.loading" @click="handleSubmit">
          {{ state.loading ? 'Creando...' : 'Registrarme' }}
        </button>
      </div>

      <p class="auth-card-footer">
        ¿Ya tienes una cuenta?
        <RouterLink to="/login" class="auth-link">Inicia sesión</RouterLink>
      </p>
    </div>
  </section>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.auth-card {
  width: min(680px, 100%);
  display: grid;
  gap: 1.25rem;
}

.auth-card-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.auth-card-logo {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: #d97706;
  color: white;
  font-weight: 900;
  border: 1px solid #f59e0b;
}

.auth-card h1 {
  margin: 0;
}

.auth-card p {
  margin: 0.2rem 0 0;
}

.auth-card-highlight {
  padding: 0.9rem 1rem;
  border-radius: 18px;
  border: 1px solid #3d4e65;
  background: #1f2836;
  color: #dbe7f8;
}

.error-banner {
  padding: 0.9rem 1rem;
  border-radius: 16px;
  background: #4a1f1f;
  border: 1px solid #7c2d2d;
  color: #ffd7da;
}

.auth-card-footer {
  text-align: center;
  color: var(--text-soft);
}

small {
  display: block;
  margin-top: -0.3rem;
}
</style>
