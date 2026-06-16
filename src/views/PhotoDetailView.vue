<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { usePhotos } from '../composables/usePhotos.js'

const route = useRoute()
const router = useRouter()
const { photos, getById } = usePhotos()

const photo = computed(() => getById(route.params.id))

const title = computed(() => photo.value?.title
  ? `${photo.value.title} - 摄影 - Alvin Shan`
  : '摄影 - Alvin Shan')
const description = computed(() => photo.value?.description || 'Alvin Shan 的摄影作品')

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: computed(() => `https://jialiang.dev/photography/${route.params.id}`) },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ],
})

const currentIndex = computed(() =>
  photos.value.findIndex(p => p.id === route.params.id)
)
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < photos.value.length - 1)

function goPrev() {
  if (hasPrev.value) {
    router.push(`/photography/${photos.value[currentIndex.value - 1].id}`)
  }
}
function goNext() {
  if (hasNext.value) {
    router.push(`/photography/${photos.value[currentIndex.value + 1].id}`)
  }
}

function fmt(date) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <div class="page">
    <!-- 不存在 -->
    <div v-if="!photo" class="not-found">
      <h2>照片不存在</h2>
    </div>

    <template v-else>
      <!-- 顶部导航 -->
      <header class="top">
        <router-link to="/photography" class="back">← 摄影</router-link>
        <span class="counter">{{ currentIndex + 1 }} / {{ photos.length }}</span>
      </header>

      <!-- 前/后浏览 -->
      <button v-if="hasPrev" class="nav-btn nav-prev" @click="goPrev" aria-label="上一张">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button v-if="hasNext" class="nav-btn nav-next" @click="goNext" aria-label="下一张">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      <!-- 文字区 -->
      <section class="text-block">
        <h1 class="title">{{ photo.title }}</h1>

        <div class="meta">
          <span>{{ fmt(photo.date) }}</span>
          <span class="sep">·</span>
          <span>{{ photo.camera }}</span>
          <span class="sep">·</span>
          <span>{{ photo.lens }}</span>
        </div>

        <p class="quote">{{ photo.quote }}</p>
      </section>

      <!-- 大图 -->
      <div class="image-wrap">
        <img :src="photo.image" :alt="photo.title" />
      </div>

      <!-- 底部 -->
      <footer class="bottom">
        <router-link to="/photography" class="back">← 返回摄影</router-link>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: "PingFang SC", -apple-system, "Noto Serif SC", sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── 顶栏 ── */
.top {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 50;
  padding: 20px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.back {
  font-size: 0.88rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}
.back:hover { color: var(--text-primary); }
.counter {
  font-size: 0.8rem;
  color: var(--text-light);
  font-family: "JetBrains Mono", monospace;
  letter-spacing: 0.04em;
}

/* ── 前后浏览按钮 ── */
.nav-btn {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
  width: 44px; height: 44px;
  border-radius: 50%;
  border: 1px solid var(--border-card);
  background: var(--bg-nav-btn);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}
.nav-btn:hover {
  background: var(--bg-card);
  color: var(--text-primary);
  box-shadow: 0 2px 12px var(--shadow-card);
}
.nav-prev { left: 20px; }
.nav-next { right: 20px; }

/* ── 文字区 ── */
.text-block {
  max-width: 640px;
  margin: 0 auto;
  padding: 120px 24px 56px;
  text-align: center;
}
.title {
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  font-weight: 700;
  letter-spacing: -0.015em;
  margin: 0 0 16px;
  color: var(--text-heading);
}
.meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.88rem;
  color: var(--text-light);
  letter-spacing: 0.02em;
  margin-bottom: 36px;
}
.sep { color: var(--border-light); }

.quote {
  font-size: 1.08rem;
  line-height: 1.9;
  color: var(--text-secondary);
  max-width: 480px;
  margin: 0 auto;
  font-family: "Noto Serif SC", "PingFang SC", Georgia, serif;
}

/* ── 图片 ── */
.image-wrap {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px 40px;
}
.image-wrap img {
  width: 100%;
  border-radius: 12px;
  display: block;
}

/* ── 底栏 ── */
.bottom {
  text-align: center;
  padding: 32px 24px 80px;
}

/* ── not found ── */
.not-found {
  padding: 200px 24px;
  text-align: center;
  color: var(--text-light);
}

@media (max-width: 640px) {
  .text-block { padding: 100px 20px 40px; }
  .image-wrap { padding: 0 16px 32px; }
  .image-wrap img { border-radius: 8px; }
}
</style>
