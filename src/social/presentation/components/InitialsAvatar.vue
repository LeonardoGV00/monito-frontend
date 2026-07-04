<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },
  picture: { type: String, default: '' },
  size: { type: Number, default: 56 }
})

const initials = computed(() => {
  const normalized = (props.name || '').trim().replace(/\s+/g, ' ')
  if (!normalized) return 'MN'
  const compact = normalized.replace(/[^\p{L}\p{N}]/gu, '')
  return (compact.slice(0, 2) || 'MN').toUpperCase()
})

const sizeClass = computed(() => {
  const allowed = new Set([38, 40, 44, 48, 56, 96])
  const safeSize = allowed.has(props.size) ? props.size : 56
  return `avatar-size-${safeSize}`
})
</script>

<template>
  <div class="initials-avatar" :class="sizeClass">
    <img v-if="picture" :src="picture" :alt="name" />
    <span v-else>{{ initials }}</span>
  </div>
</template>

<style scoped>
.initials-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  overflow: hidden;
  background: #2d3a4d;
  border: 1px solid #42546d;
  color: white;
  font-weight: 800;
  letter-spacing: 0.04em;
  flex: 0 0 auto;
}

.avatar-size-38 { width: 38px; height: 38px; }
.avatar-size-40 { width: 40px; height: 40px; }
.avatar-size-44 { width: 44px; height: 44px; }
.avatar-size-48 { width: 48px; height: 48px; }
.avatar-size-56 { width: 56px; height: 56px; }
.avatar-size-96 { width: 96px; height: 96px; }

.initials-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
