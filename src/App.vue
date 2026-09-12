<script setup>
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import {
  ArrowRight,
  ArrowUpRight,
  Aperture,
  Instagram,
  Mail,
  Menu,
  Phone,
  X,
  Youtube,
} from 'lucide-vue-next'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WorkProjectGrid from './components/WorkProjectGrid.vue'
import HeroCarousel from './components/HeroCarousel.vue'
import ClapperboardLoader from './components/ClapperboardLoader.vue'
import CategoryHeading from './components/CategoryHeading.vue'
import { brandSubsections, categories, projectsData } from './data/projects'
import { getProjectSections } from './utils/projectSections'
import { profile } from './data/profile'

gsap.registerPlugin(ScrollTrigger)

const VideoLightbox = defineAsyncComponent(() => import('./components/VideoLightbox.vue'))
const root = ref(null)
const siteLoading = ref(true)
let siteLoadTimeout

function finishSiteLoading() {
  siteLoading.value = false
  clearTimeout(siteLoadTimeout)
}
const selectedCategory = ref('all')
const selectedProject = ref(null)
const mobileMenuOpen = ref(false)
const headerHidden = ref(false)
const headerScrolled = ref(false)
const currentSection = ref('work')
const workCategories = computed(() =>
  categories
    .filter(
      (category) =>
        category.id !== 'all' &&
        (selectedCategory.value === 'all' || category.id === selectedCategory.value),
    )
    .map((category) => ({
      ...category,
      sections: getProjectSections(projectsData, brandSubsections, category.id),
    }))
    .filter((category) => category.sections.length),
)
const filteredCount = computed(() =>
  workCategories.value.reduce(
    (count, category) =>
      count + category.sections.reduce((total, section) => total + section.projects.length, 0),
    0,
  ),
)
let matchMedia
let sectionObserver
let lastScroll = 0
let scrollFrame = 0

function onScroll() {
  if (scrollFrame) return
  scrollFrame = requestAnimationFrame(() => {
    const currentScroll = window.scrollY
    headerScrolled.value = currentScroll > 40
    if (Math.abs(currentScroll - lastScroll) > 5) {
      headerHidden.value =
        currentScroll > lastScroll &&
        currentScroll > 160 &&
        !mobileMenuOpen.value &&
        !selectedProject.value
      lastScroll = currentScroll
    }
    scrollFrame = 0
  })
}

function navigate() {
  mobileMenuOpen.value = false
  headerHidden.value = false
}

function openProject(project) {
  selectedProject.value = project
  headerHidden.value = false
}

async function filterProjects(category) {
  selectedCategory.value = category
  await nextTick()
  ScrollTrigger.refresh()
}

onMounted(() => {
  if (siteLoading.value) siteLoadTimeout = setTimeout(finishSiteLoading, 8000)
  window.addEventListener('scroll', onScroll, { passive: true })
  matchMedia = gsap.matchMedia()
  matchMedia.add(
    '(prefers-reduced-motion: no-preference)',
    () => {
      gsap.from('.hero-entrance', {
        y: 35,
        autoAlpha: 0,
        stagger: 0.13,
        duration: 1.1,
        ease: 'power3.out',
        delay: 0.1,
      })
      let revealContext
      function refreshReveals() {
        revealContext?.revert()
        revealContext = gsap.context(() => {
          root.value
            .querySelectorAll(
              '.category-heading, .brand-heading, .film-grid .project-card, .reels-section, .reveal-section',
            )
            .forEach((element) => {
              gsap
                .timeline({
                  defaults: { ease: 'none' },
                  scrollTrigger: {
                    trigger: element,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.5,
                    invalidateOnRefresh: true,
                  },
                })
                .fromTo(element, { y: 44, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.28 })
                .to(element, { y: 0, opacity: 1, duration: 0.44 })
                .to(element, { y: -44, opacity: 0.4, duration: 0.28 })
            })
        }, root.value)
        ScrollTrigger.refresh()
      }
      refreshReveals()
      const stopWatching = watch(workCategories, refreshReveals, { flush: 'post' })
      return () => {
        stopWatching()
        revealContext?.revert()
      }
    },
    root.value,
  )
  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) currentSection.value = entry.target.id
      })
    },
    { rootMargin: '-15% 0px -55% 0px' },
  )
  document
    .querySelectorAll('main > section[id]')
    .forEach((section) => sectionObserver.observe(section))
})

onBeforeUnmount(() => {
  clearTimeout(siteLoadTimeout)
  window.removeEventListener('scroll', onScroll)
  cancelAnimationFrame(scrollFrame)
  matchMedia?.revert()
  sectionObserver?.disconnect()
})
</script>

<template>
  <Transition name="site-loader">
    <div v-if="siteLoading" class="site-loader">
      <ClapperboardLoader label="Loading…" />
    </div>
  </Transition>
  <div ref="root" :inert="siteLoading" :aria-busy="siteLoading">
    <a class="skip-link" href="#work">Skip to work</a>
    <header
      class="site-header"
      :class="{
        'is-hidden': headerHidden,
        'is-scrolled': headerScrolled,
        'menu-open': mobileMenuOpen,
      }"
      @focusin="headerHidden = false"
    >
      <a class="wordmark" href="#home" aria-label="Work with Pratham — home" @click="navigate"
        ><Aperture :size="24" :stroke-width="1.4" /><span
          >WORK WITH <strong>PRATHAM</strong></span
        ></a
      >
      <nav class="desktop-nav" aria-label="Main navigation">
        <a href="#work" :class="{ active: currentSection === 'work' }" @click="navigate">Work</a>
        <a href="#about" :class="{ active: currentSection === 'about' }" @click="navigate"
          >About me</a
        >
        <a href="#contact" class="nav-contact" @click="navigate"
          >Let’s collaborate <ArrowUpRight :size="15"
        /></a>
      </nav>
      <button
        class="mobile-toggle icon-button"
        :aria-expanded="mobileMenuOpen"
        aria-controls="mobile-navigation"
        :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <X v-if="mobileMenuOpen" :size="23" /><Menu v-else :size="23" />
      </button>
      <nav
        v-if="mobileMenuOpen"
        id="mobile-navigation"
        class="mobile-nav"
        aria-label="Mobile navigation"
        @keydown.esc="navigate"
      >
        <a href="#work" @click="navigate">Selected work <ArrowUpRight :size="20" /></a
        ><a href="#about" @click="navigate">About me <ArrowUpRight :size="20" /></a
        ><a href="#contact" @click="navigate">Let’s collaborate <ArrowUpRight :size="20" /></a>
      </nav>
    </header>

    <main>
      <section id="home" class="hero">
        <HeroCarousel
          :suspended="!!selectedProject || mobileMenuOpen"
          @ready="finishSiteLoading"
        />
      </section>

      <div class="specialties-strip">
        <div class="page-width">
          <span>Director of Photography</span><span class="strip-star">✳</span
          ><span>Associate DP</span><span class="strip-star">✳</span> 
          <span>Camera Operator</span><span class="strip-star">✳</span>
          <span>1st AC</span><span class="strip-star">✳</span>
          <span>Editor</span>
        </div>
      </div>

      <section id="work" class="work-section page-width">
        <div class="filter-bar" aria-label="Filter projects by category">
          <div class="filter-options">
            <button
              v-for="category in categories"
              :key="category.id"
              :class="{ selected: selectedCategory === category.id }"
              :aria-pressed="selectedCategory === category.id"
              @click="filterProjects(category.id)"
            >
              {{ category.label
              }}<span v-if="selectedCategory === category.id" class="filter-dot"></span>
            </button>
          </div>
          <span class="project-count" aria-live="polite"
            >{{ String(filteredCount).padStart(2, '0') }} projects</span
          >
        </div>
        <section
          v-for="category in workCategories"
          :key="category.id"
          class="work-category"
          :aria-labelledby="`category-heading-${category.id}`"
        >
          <h2 :id="`category-heading-${category.id}`" class="category-heading">
            <CategoryHeading :label="category.label" />
          </h2>
          <section
            v-for="section in category.sections"
            :key="section.title ? `brand-${section.id}` : 'ungrouped'"
            class="work-group"
            :class="{ 'brand-subsection': section.title }"
            :aria-label="section.title || `${category.label} projects`"
          >
            <div v-if="section.title" class="brand-heading">
              <h3>{{ section.title }}</h3>
            </div>
            <WorkProjectGrid :projects="section.projects" @open="openProject" />
          </section>
        </section>
        <div v-if="!filteredCount" class="empty-state">
          New stories are in the making.
          <button @click="filterProjects('all')">Explore all work <ArrowRight :size="15" /></button>
        </div>
      </section>

      <section id="about" class="about-section page-width reveal-section">
        <div class="about-image">
          <img
            src="/images/about.webp"
            alt="Pratham operating a cinema camera on set"
            width="1536"
            height="1024"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div class="about-copy">
          <span class="eyebrow section-kicker"
            ><span class="tiny-cross">+</span> The person behind the lens</span
          >
          <h2>
            A curious <span class="serif-word">eye</span>.<br />An honest
            <span class="serif-word">perspective.</span>
          </h2>
          <p class="about-intro">{{ profile.introduction }}</p>
          <p class="about-description">{{ profile.biography }}</p>
          <a href="#contact" class="text-link"
            >Let’s make something meaningful <ArrowUpRight :size="18"
          /></a>
          <div class="signature">Pratham</div>
        </div>
      </section>

      <section
        id="contact"
        class="contact-section reveal-section"
        aria-labelledby="contact-heading"
      >
        <div class="page-width contact-layout">
          <div class="contact-copy">
            <h2 id="contact-heading">Let’s work <span class="serif-word">together.</span></h2>
          </div>
          <div class="contact-actions">
            <a :href="`mailto:${profile.email}`" class="contact-cta contact-cta-email">
              <Mail :size="18" aria-hidden="true" /> Email me
            </a>
            <a :href="`tel:${profile.phone.replace(/\s/g, '')}`" class="contact-cta">
              <Phone :size="18" aria-hidden="true" /> Call {{ profile.phone }}
            </a>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer page-width">
      <a href="#home" class="footer-brand"
        >WORK WITH PRATHAM<span>© {{ new Date().getFullYear() }}</span></a
      >
      <div class="footer-links">
        <a
          v-if="profile.instagramUrl"
          :href="profile.instagramUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Pratham on Instagram"
          ><Instagram :size="18" /></a
        ><a
          v-if="profile.youtubeUrl"
          :href="profile.youtubeUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Pratham on YouTube"
          ><Youtube :size="19" /></a
        ><a href="#home">Back to top <ArrowUpRight :size="14" /></a>
      </div>
    </footer>
    <VideoLightbox
      v-if="selectedProject"
      :project="selectedProject"
      @close="selectedProject = null"
    />
  </div>
</template>
