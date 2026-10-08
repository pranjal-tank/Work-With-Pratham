<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowUpRight, Clapperboard, Play } from 'lucide-vue-next'
import { getThumbnail, resolveMedia } from '../utils/media'
import LoadingIndicator from './LoadingIndicator.vue'

const props = defineProps({
  project: { type: Object, required: true },
  index: { type: Number, default: 0 },
})
defineEmits(['open'])
const thumbnail = computed(() => getThumbnail(props.project))
const imageLoading = ref(true)
const imageFailed = ref(false)
watch(thumbnail, () => {
  imageLoading.value = true
  imageFailed.value = false
})

function onImageError(event) {
  const image = event.target
  const media = resolveMedia(props.project)
  if (media?.thumbnailUrl && image.src === media.thumbnailUrl) {
    image.src = media.fallbackThumbnailUrl
  } else if (!image.dataset.fallback) {
    image.dataset.fallback = 'true'
    image.src = '/images/hero.jpg'
  } else {
    imageLoading.value = false
    imageFailed.value = true
  }
}

function onImageLoad(event) {
  const image = event.target
  // YouTube may return a small placeholder when the full-size thumbnail is unavailable.
  if (image.src === resolveMedia(props.project)?.thumbnailUrl && image.naturalWidth <= 120) {
    onImageError(event)
    return
  }
  imageLoading.value = false
}
</script>

<template>
  <article class="project-card" :class="{ 'reel-card': project.mediaType === 'instagram' }">
    <button
      class="project-button group w-full text-left"
      :aria-label="`Watch ${project.title}, ${project.role}`"
      @click="$emit('open', project)"
    >
      <div class="project-image" :aria-busy="imageLoading">
        <img
          :key="thumbnail"
          :src="thumbnail"
          :class="{ 'is-loading': imageLoading, 'is-failed': imageFailed }"
          :alt="`${project.title} — ${project.format || 'Video'} poster`"
          :width="project.mediaType === 'instagram' ? 540 : 960"
          :height="project.mediaType === 'instagram' ? 960 : 540"
          loading="lazy"
          decoding="async"
          @load="onImageLoad"
          @error="onImageError"
        />
        <div v-if="imageLoading" class="project-loading">
          <LoadingIndicator label="Loading preview…" compact />
        </div>
        <div v-else-if="imageFailed" class="project-loading preview-unavailable">
          <Clapperboard :size="32" aria-hidden="true" />
          <span>Preview unavailable</span>
        </div>
        <div class="image-shade"></div>
        <span v-if="project.client" class="client-badge">{{ project.client }}</span>
        <Clapperboard v-if="project.mediaType === 'instagram'" class="reel-indicator" :size="19" />
        <span class="card-play"><Play :size="19" fill="currentColor" :stroke-width="1" /></span>
        <span class="image-bottom"
          ><span v-if="project.mediaType === 'instagram' || project.format" class="image-format">{{
            project.mediaType === 'instagram' ? 'Watch reel' : project.format
          }}</span
          ><span class="frame-number">{{ String(index + 1).padStart(2, '0') }}</span></span
        >
      </div>
      <div class="project-caption">
        <div>
          <h3>{{ project.title }}</h3>
          <p>
            {{ project.role
            }}<template v-if="project.format"> <span>·</span> {{ project.format }}</template>
          </p>
        </div>
        <ArrowUpRight :size="20" class="project-arrow" />
      </div>
    </button>
  </article>
</template>
