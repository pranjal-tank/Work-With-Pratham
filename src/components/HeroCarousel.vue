<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { heroSlideInterval, heroSlides } from '../data/heroSlides'

const props = defineProps({ suspended: { type: Boolean, default: false } })
const emit = defineEmits(['change', 'ready'])
const carousel = ref(null)
const activeIndex = ref(0)
const requestedIndex = ref(0)
const requestedSlides = ref(new Set([0]))
const loadedSlides = new Set()
const paused = ref(false)
const reducedMotion = ref(false)
const visible = ref(true)
const pageVisible = ref(true)
const controlsHovered = ref(false)
let timer
let observer
let motionPreference

function scheduleNext() {
  clearTimeout(timer)
  if (
    paused.value ||
    reducedMotion.value ||
    !visible.value ||
    !pageVisible.value ||
    controlsHovered.value ||
    props.suspended ||
    !loadedSlides.has(activeIndex.value)
  )
    return
  timer = setTimeout(
    () => selectSlide((activeIndex.value + 1) % heroSlides.length),
    heroSlideInterval,
  )
}

function selectSlide(index, manual = false) {
  if (manual) paused.value = true
  clearTimeout(timer)
  requestedIndex.value = (index + heroSlides.length) % heroSlides.length
  requestedSlides.value.add(requestedIndex.value)
  if (loadedSlides.has(requestedIndex.value)) {
    activeIndex.value = requestedIndex.value
    emit('change', activeIndex.value)
    requestedSlides.value.add((activeIndex.value + 1) % heroSlides.length)
    scheduleNext()
  }
}

function onLoad(index) {
  if (index === 0 && !loadedSlides.has(0)) emit('ready')
  loadedSlides.add(index)
  if (index === requestedIndex.value) selectSlide(index)
}

function onError(event, index) {
  if (!event.target.dataset.fallback && heroSlides[index].src !== heroSlides[0].src) {
    event.target.dataset.fallback = 'true'
    event.target.src = heroSlides[0].src
  } else {
    onLoad(index)
  }
}

function syncVisibility() {
  pageVisible.value = !document.hidden
}

function syncMotionPreference() {
  reducedMotion.value = motionPreference.matches
}

watch(
  [paused, reducedMotion, visible, pageVisible, controlsHovered, () => props.suspended],
  scheduleNext,
)

onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncMotionPreference()
  syncVisibility()
  motionPreference.addEventListener('change', syncMotionPreference)
  document.addEventListener('visibilitychange', syncVisibility)
  observer = new IntersectionObserver(
    ([entry]) => {
      visible.value = entry.isIntersecting
    },
    { threshold: 0.1 },
  )
  observer.observe(carousel.value)
})

onBeforeUnmount(() => {
  clearTimeout(timer)
  observer?.disconnect()
  motionPreference?.removeEventListener('change', syncMotionPreference)
  document.removeEventListener('visibilitychange', syncVisibility)
})
</script>

<template>
  <div
    ref="carousel"
    class="hero-carousel"
    role="group"
    aria-roledescription="carousel"
    aria-label="Selected cinematography"
  >
    <div class="hero-backdrop">
      <template v-for="(slide, index) in heroSlides" :key="slide.id">
        <img
          v-if="requestedSlides.has(index)"
          class="hero-landscape hero-slide"
          :class="{ 'is-active': activeIndex === index }"
          :src="slide.src"
          :alt="slide.alt"
          :aria-hidden="activeIndex !== index"
          :style="{ objectPosition: slide.position }"
          width="2000"
          height="1333"
          :fetchpriority="index === 0 ? 'high' : 'low'"
          decoding="async"
          @load="onLoad(index)"
          @error="onError($event, index)"
        />
      </template>
      <div class="hero-vignette"></div>
      <div class="hero-grain"></div>
    </div>
    <div
      class="carousel-controls"
      @mouseenter="controlsHovered = true"
      @mouseleave="controlsHovered = false"
      @focusin="paused = true"
      @keydown.left.prevent="selectSlide(activeIndex - 1, true)"
      @keydown.right.prevent="selectSlide(activeIndex + 1, true)"
    >
      <button
        class="carousel-arrow carousel-arrow-left"
        aria-label="Previous photo"
        @click="selectSlide(activeIndex - 1, true)"
      >
        <ChevronLeft :size="24" />
      </button>
      <button
        class="carousel-arrow carousel-arrow-right"
        aria-label="Next photo"
        @click="selectSlide(activeIndex + 1, true)"
      >
        <ChevronRight :size="24" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.hero-carousel {
  position: absolute;
  inset: 0;
}
.hero-slide {
  opacity: 0;
  transform: scale(1.045);
  transition:
    opacity 1.4s ease-in-out,
    transform 7.4s linear;
}
.hero-slide.is-active {
  opacity: 1;
  transform: scale(1);
}
.carousel-controls {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 1px solid #ffffff20;
  border-radius: 3px;
  background: #05050566;
  backdrop-filter: blur(12px);
  color: #d4d0c6;
  pointer-events: auto;
  transition: color 0.25s;
}
.carousel-arrow-left {
  left: 20px;
}
.carousel-arrow-right {
  right: 20px;
}
.carousel-arrow:hover {
  color: #c5b294;
}
@media (max-width: 760px) {
  .carousel-arrow {
    width: 44px;
    height: 44px;
  }
  .carousel-arrow-left {
    left: 12px;
  }
  .carousel-arrow-right {
    right: 12px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hero-slide {
    transform: none;
    transition: none;
  }
}
</style>
