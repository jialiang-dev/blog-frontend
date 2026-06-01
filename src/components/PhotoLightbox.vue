<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { usePhotos } from '../composables/usePhotos.js'

const props = defineProps({
  photoId: { type: String, required: true },
})
const emit = defineEmits(['close', 'navigate'])

const { getById, getAlbumOfPhoto } = usePhotos()

const photo = computed(() => getById(props.photoId))
const album = computed(() => getAlbumOfPhoto(props.photoId))

const photoIndex = computed(() =>
  album.value ? album.value.photos.findIndex(p => p.id === props.photoId) : -1
)
const hasPrev = computed(() => photoIndex.value > 0)
const hasNext = computed(() =>
  album.value ? photoIndex.value < album.value.photos.length - 1 : false
)

function goPrev() {
  if (!hasPrev.value || !album.value) return
  const prev = album.value.photos[photoIndex.value - 1]
  emit('navigate', prev.id)
}
function goNext() {
  if (!hasNext.value || !album.value) return
  const next = album.value.photos[photoIndex.value + 1]
  emit('navigate', next.id)
}

function onKeydown(e) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

function fmt(date) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <Teleport to="body">
    <div class="lightbox-overlay" @click.self="emit('close')">
      <!-- 关闭按钮 -->
      <button class="close-btn" @click="emit('close')" aria-label="关闭">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <path d="M6 6L18 18M6 18L18 6"/>
        </svg>
      </button>

      <!-- 前/后 -->
      <button v-if="hasPrev" class="nav-btn nav-prev" @click.stop="goPrev" aria-label="上一张">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button v-if="hasNext" class="nav-btn nav-next" @click.stop="goNext" aria-label="下一张">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      <div v-if="photo" class="lightbox-body" @click.stop>
        <!-- 图片 -->
        <div class="image-area">
          <img :src="photo.image" :alt="photo.title" />
        </div>

        <!-- 信息 -->
        <div class="info-area">
          <h2 class="lb-title">{{ photo.title }}</h2>
          <div class="lb-meta">
            <span>{{ fmt(photo.date) }}</span>
            <span class="sep">·</span>
            <span>{{ photo.camera }}</span>
            <span class="sep">·</span>
            <span>{{ photo.lens }}</span>
          </div>
          <p class="lb-quote">{{ photo.quote }}</p>
          <div v-if="album" class="lb-counter">
            {{ photoIndex + 1 }} / {{ album.photos.length }}
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: overlay-in 0.25s ease;
}
@keyframes overlay-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ── 关闭按钮 ── */
.close-btn {
  position: fixed;
  top: 20px; right: 20px;
  z-index: 1010;
  width: 40px; height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.15);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.close-btn:hover { background: rgba(255,255,255,0.25); }

/* ── 前/后按钮 ── */
.nav-btn {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1010;
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.1);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.nav-btn:hover { background: rgba(255,255,255,0.2); }
.nav-prev { left: 20px; }
.nav-next { right: 20px; }

/* ── 内容 ── */
.lightbox-body {
  display: flex;
  gap: 40px;
  max-width: 1100px;
  width: 100%;
  max-height: 85vh;
  align-items: center;
  animation: body-in 0.3s ease 0.05s both;
}
@keyframes body-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── 图片 ── */
.image-area {
  flex: 1.2;
  min-width: 0;
}
.image-area img {
  width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: 10px;
}

/* ── 信息 ── */
.info-area {
  flex: 0 0 280px;
  color: rgba(255,255,255,0.9);
}
.lb-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 12px;
  color: #fff;
  letter-spacing: -0.01em;
}
.lb-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.5);
  margin-bottom: 20px;
}
.sep { color: rgba(255,255,255,0.2); }
.lb-quote {
  font-size: 0.95rem;
  line-height: 1.8;
  color: rgba(255,255,255,0.65);
  margin: 0 0 24px;
}
.lb-counter {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.3);
  font-family: "JetBrains Mono", monospace;
  letter-spacing: 0.06em;
}

/* ── 响应式 ── */
@media (max-width: 768px) {
  .lightbox-body {
    flex-direction: column;
    gap: 24px;
    max-height: 90vh;
  }
  .image-area { flex: none; }
  .image-area img { max-height: 45vh; }
  .info-area { flex: none; width: 100%; }
  .lb-title { font-size: 1.3rem; }
  .nav-btn { display: none; }
  .lightbox-overlay { padding: 16px; }
}
</style>
