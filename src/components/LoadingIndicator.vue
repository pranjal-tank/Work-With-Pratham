<script setup>
defineProps({
  label: { type: String, default: 'Loading…' },
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <span class="loading-indicator" :class="{ 'is-compact': compact }" role="status">
    <span class="spinner" aria-hidden="true"></span>
    <span>{{ label }}</span>
  </span>
</template>

<style scoped>
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #67e8f9;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 2px solid rgba(103, 232, 249, 0.25);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.is-compact {
  gap: 6px;
  font-size: 12px;
}
.is-compact .spinner {
  width: 32px;
  height: 32px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .spinner { animation-duration: 2s; }
}
</style>
