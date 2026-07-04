<script setup>
import { reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { authStore } from '../../application/auth.store'

const router = useRouter()

const form = reactive({
  login: '',
  password: ''
})

const state = reactive({
  loading: false,
  error: ''
})

async function handleSubmit() {
  state.loading = true
  state.error = ''
  try {
    await authStore.signIn(form.login.trim(), form.password)
    await router.push('/home')
  } catch (error) {
    state.error = authStore.error || 'Revisa tus credenciales.'
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
          <h1>Moñito</h1>
          <p class="muted">Ingresa a la red social del negocio</p>
        </div>
      </div>

      <div v-if="state.error" class="error-banner">{{ state.error }}</div>

      <div class="form-grid">
        <label>
          Usuario o correo
          <input v-model="form.login" type="text" placeholder="usuario@correo.com" />
        </label>

        <label>
          Contraseña
          <input v-model="form.password" type="password" placeholder="Tu contraseña" />
        </label>

        <button class="primary-btn" :disabled="state.loading" @click="handleSubmit">
          {{ state.loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </div>

      <p class="auth-card-footer">
        ¿No tienes una cuenta? <RouterLink to="/register">Regístrate</RouterLink>
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
  width: min(520px, 100%);
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
