<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowUpRight, Film, X } from 'lucide-vue-next'
import { getThumbnail, resolveMedia } from '../utils/media'
import LoadingIndicator from './LoadingIndicator.vue'

const props = defineProps({ project: { type: Object, required: true } })
const emit = defineEmits(['close'])
const dialog = ref(null)
const loading = ref(true)
const playerDelayed = ref(false)
let playerTimeout
const media = computed(() => resolveMedia(props.project))
const previousFocus = document.activeElement
const previousOverflow = document.body.style.overflow

onMounted(() => {
  dialog.value.showModal()
  document.body.style.overflow = 'hidden'
  if (media.value) {
    playerTimeout = setTimeout(() => {
      loading.value = false
      playerDelayed.value = true
    }, 15000)
  }
})

onBeforeUnmount(() => {
  clearTimeout(playerTimeout)
  dialog.value?.close()
  document.body.style.overflow = previousOverflow
  previousFocus?.focus({ preventScroll: true })
})

function onPlayerLoad() {
  clearTimeout(playerTimeout)
  loading.value = false
  playerDelayed.value = false
}

function onBackdrop(event) {
  if (event.target === dialog.value) emit('close')
}
</script>

<template>
  <dialog
    ref="dialog"
    class="lightbox"
    aria-labelledby="film-title"
    @cancel.prevent="emit('close')"
    @click="onBackdrop"
  >
    <div class="lightbox-content">
      <div class="lightbox-top">
        <span class="eyebrow">{{
          project.mediaType === 'instagram' ? 'Vertical stories' : 'Now showing'
        }}</span
        ><button class="icon-button" aria-label="Close video" autofocus @click="emit('close')">
          <X :size="23" />
        </button>
      </div>
      <div class="player" :class="{ 'vertical-player': project.mediaType === 'instagram' }">
        <template v-if="media"
          ><div v-if="loading" class="player-loading">
            <LoadingIndicator label="Loading film…" />
          </div>
          <div v-else-if="playerDelayed" class="player-loading player-delayed" role="status">
            This is taking a little longer. You can watch using the link below.
          </div>
          <iframe
            :src="media.embedUrl"
            :title="project.title"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
            @load="onPlayerLoad"
          ></iframe
        ></template>
        <div
          v-else
          class="coming-soon"
          :style="{ backgroundImage: `url(${getThumbnail(project)})` }"
        >
          <div>
            <Film :size="35" :stroke-width="1" /><span class="eyebrow"
              >A story worth waiting for</span
            >
            <h2>Film preview coming soon.</h2>
            <p>A little anticipation. A lot of feeling.</p>
          </div>
        </div>
      </div>
      <div class="lightbox-details">
        <div>
          <h2 id="film-title">{{ project.title }}</h2>
          <p v-if="project.client">{{ project.client }}</p>
        </div>
        <dl>
          <div>
            <dt>Role</dt>
            <dd>{{ project.role }}</dd>
          </div>
          <div v-if="project.format">
            <dt>Format</dt>
            <dd>{{ project.format }}</dd>
          </div>
        </dl>
      </div>
      <a
        v-if="media"
        :href="media.externalUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="player-external"
        >Player unavailable? Watch on
        {{ project.mediaType === 'youtube' ? 'YouTube' : 'Instagram' }} <ArrowUpRight :size="15"
      /></a>
    </div>
  </dialog>
</template>
