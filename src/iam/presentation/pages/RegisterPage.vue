<script setup>
import { reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { authStore } from '../../application/auth.store'
import { fileToDataUrl } from '../../../shared/infrastructure/file-utils'

const router = useRouter()

const form = reactive({
  username: '',
  email: '',
  password: '',
  telefono: '',
  picture: ''
})

const state = reactive({
  loading: false,
  error: ''
})

async function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  form.picture = await fileToDataUrl(file)
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
      picture: form.picture
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

      <div v-if="state.error" class="error-banner">{{ state.error }}</div>

      <div class="form-grid">
        <label>
          Nombre de usuario
          <input v-model="form.username" type="text" placeholder="tu_usuario" />
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
          <input v-model="form.telefono" type="text" placeholder="+51 ..." />
        </label>

        <label>
          Foto de perfil opcional
          <input type="file" accept="image/*" @change="handleFileChange" />
        </label>

        <label>
          O pega un enlace de imagen
          <input v-model="form.picture" type="text" placeholder="https://..." />
        </label>

        <button class="primary-btn" :disabled="state.loading" @click="handleSubmit">
          {{ state.loading ? 'Creando...' : 'Registrarme' }}
        </button>
      </div>

      <p class="auth-card-footer">
        ¿Ya tienes una cuenta? <RouterLink to="/login">Inicia sesión</RouterLink>
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
  background: linear-gradient(135deg, #60a5fa, #22c55e);
  font-weight: 900;
}

.auth-card h1 {
  margin: 0;
}

.auth-card p {
  margin: 0.2rem 0 0;
}

.error-banner {
  padding: 0.9rem 1rem;
  border-radius: 16px;
  background: rgba(239, 68, 68, 0.15);
  color: #fecaca;
}

.auth-card-footer {
  text-align: center;
}
</style>
