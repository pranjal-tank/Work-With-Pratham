<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'

defineProps({ label: { type: String, required: true } })
const heading = ref(null)
const text = ref(null)
const camera = ref(null)
const flash = ref(null)
let motion

onMounted(() => {
  motion = gsap.matchMedia()
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.set(text.value, { opacity: 0 })
    const reveal = gsap
      .timeline({ paused: true })
      .set(text.value, { opacity: 0, y: 8 }, 0)
      .fromTo(
        camera.value,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' },
      )
      .fromTo(
        flash.value,
        { opacity: 0, scaleX: 0.15, scaleY: 0.6 },
        { opacity: 1, scaleX: 1, scaleY: 1, duration: 0.16, ease: 'power2.out' },
        0.4,
      )
      .to(flash.value, { opacity: 0, duration: 0.24, ease: 'power2.in' }, 0.72)
      .to(camera.value, { opacity: 0, duration: 0.18 }, 0.96)
      .fromTo(
        text.value,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', clearProps: 'opacity,transform' },
        1.14,
      )
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) {
          observer.disconnect()
          reveal.play()
        }
      },
      { threshold: [0, 0.5], rootMargin: '-8% 0px -8% 0px' },
    )
    observer.observe(heading.value)
    return () => observer.disconnect()
  })
})

onBeforeUnmount(() => motion?.revert())
</script>

<template>
  <span ref="heading" class="camera-category-heading">
    <span ref="text" class="category-label-text">{{ label }}</span>
    <span ref="camera" class="category-camera" aria-hidden="true">
      <svg
        class="cinema-camera-icon"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="16" cy="14" r="10" />
        <circle cx="39" cy="14" r="10" />
        <circle cx="16" cy="14" r="3" />
        <circle cx="39" cy="14" r="3" />
        <rect x="5" y="25" width="41" height="24" rx="4" />
        <path d="m46 32 15-7v24l-15-7M14 34h13M14 40h8M25 49v7m-9 5 9-5 9 5" />
      </svg>
      <span ref="flash" class="category-flash"></span>
    </span>
  </span>
</template>

<style scoped>
.camera-category-heading {
  display: block;
  position: relative;
}
.category-label-text {
  display: block;
}
.category-camera {
  position: absolute;
  inset: 0 auto 0 0;
  display: flex;
  align-items: center;
  color: #c5b294;
  opacity: 0;
  pointer-events: none;
}
.cinema-camera-icon {
  width: 64px;
  height: 64px;
}
.category-flash {
  position: absolute;
  top: calc(50% + 5px);
  left: 61px;
  width: clamp(120px, 15vw, 180px);
  height: 80px;
  margin-top: -40px;
  transform-origin: left center;
  opacity: 0;
}
.category-flash::before {
  content: '';
  position: absolute;
  inset: 0;
  clip-path: polygon(0 44%, 100% 0, 100% 100%, 0 56%);
  background: linear-gradient(90deg, #fffdf5 0%, #ffe5accc 22%, #dec79b55 65%, transparent);
}
.category-flash::after {
  content: '';
  position: absolute;
  left: -5px;
  top: calc(50% - 6px);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fffdf5;
  box-shadow:
    0 0 12px 5px #ffe5accc,
    0 0 28px 10px #dec79b66;
}

@media (prefers-reduced-motion: reduce) {
  .category-label-text {
    opacity: 1 !important;
    transform: none !important;
  }
  .category-camera {
    display: none;
  }
}
</style>
