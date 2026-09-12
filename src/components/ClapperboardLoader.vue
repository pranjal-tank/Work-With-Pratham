<script setup>
defineProps({
  label: { type: String, default: 'Loading…' },
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <span class="clapperboard-loader" :class="{ 'is-compact': compact }" role="status">
    <img
      class="loader-icon"
      src="/clapperboard-loader.svg"
      width="96"
      height="96"
      alt=""
      aria-hidden="true"
    />
    <span>{{ label }}</span>
  </span>
</template>

<style scoped>
.clapperboard-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #c5b294;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
}
.loader-icon {
  width: 96px;
  height: 96px;
  object-fit: contain;
  filter: none;
}
.is-compact {
  gap: 6px;
  font-size: 12px;
}
.is-compact .loader-icon {
  width: 56px;
  height: 56px;
}
</style>
