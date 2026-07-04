<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, default: '' },
  picture: { type: String, default: '' },
  size: { type: Number, default: 56 }
})

const initials = computed(() => {
  const normalized = (props.name || '').trim()
  if (!normalized) return 'MN'
  const parts = normalized.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] || 'M'
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : normalized[1] || 'N'
  return `${first}${second}`.toUpperCase()
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
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.35), rgba(34, 197, 94, 0.25));
  border: 1px solid rgba(148, 163, 184, 0.22);
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
