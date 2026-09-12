<script setup>
import { computed, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ProjectCard from './ProjectCard.vue'

const props = defineProps({ projects: { type: Array, required: true } })
defineEmits(['open'])
const films = computed(() => props.projects.filter((project) => project.mediaType === 'youtube'))
const reels = computed(() => props.projects.filter((project) => project.mediaType === 'instagram'))
const reelTrack = ref(null)
const hasOverflow = ref(false)
const canScrollBack = ref(false)
const canScrollForward = ref(false)

function updateScrollState() {
  const track = reelTrack.value
  const maxScroll = track ? track.scrollWidth - track.clientWidth : 0
  hasOverflow.value = maxScroll > 2
  canScrollBack.value = hasOverflow.value && track.scrollLeft > 2
  canScrollForward.value = hasOverflow.value && track.scrollLeft < maxScroll - 2
}

function scrollReels(direction) {
  const track = reelTrack.value
  if (!track) return
  const cardWidth = track.firstElementChild?.getBoundingClientRect().width || track.clientWidth
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0
  track.scrollBy({
    left: direction * (cardWidth + gap),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
}

watch(
  reelTrack,
  (track, previous, onCleanup) => {
    updateScrollState()
    if (!track) return
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(track)
    onCleanup(() => observer.disconnect())
  },
  { flush: 'post' },
)
watch(reels, updateScrollState, { flush: 'post' })
</script>

<template>
  <div v-if="films.length" class="film-grid">
    <ProjectCard
      v-for="(project, index) in films"
      :key="project.id"
      :project="project"
      :index="index"
      @open="$emit('open', $event)"
    />
  </div>
  <div v-if="reels.length" class="reels-section">
    <div class="reel-heading">
      <div class="reel-heading-copy">
        <span v-if="hasOverflow" class="reel-scroll-hint"
          >Scroll to explore {{ reels.length }} reels</span
        >
      </div>
      <div v-if="hasOverflow" class="reel-scroll-controls">
        <button
          class="reel-scroll-button"
          aria-label="Previous reels"
          :disabled="!canScrollBack"
          @click="scrollReels(-1)"
        >
          <ChevronLeft :size="22" aria-hidden="true" />
        </button>
        <button
          class="reel-scroll-button"
          aria-label="Next reels"
          :disabled="!canScrollForward"
          @click="scrollReels(1)"
        >
          <ChevronRight :size="22" aria-hidden="true" />
        </button>
      </div>
    </div>
    <div
      ref="reelTrack"
      class="reel-grid"
      role="region"
      aria-label="Vertical edits"
      tabindex="0"
      @scroll.passive="updateScrollState"
    >
      <ProjectCard
        v-for="(project, index) in reels"
        :key="project.id"
        :project="project"
        :index="index"
        @open="$emit('open', $event)"
      />
    </div>
  </div>
</template>
