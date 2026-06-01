<script setup>
import { ref, computed } from 'vue'
import { usePhotos } from '../composables/usePhotos.js'
import PhotoLightbox from '../components/PhotoLightbox.vue'

const { getFeatured, getAlbums, getAlbumOfPhoto } = usePhotos()

const featured = computed(() => getFeatured())
const albums = computed(() => getAlbums())

// ── Lightbox 状态 ──
const activePhotoId = ref(null)

function openLightbox(photoId) {
  activePhotoId.value = photoId
}
function closeLightbox() {
  activePhotoId.value = null
}
function navigateLightbox(photoId) {
  activePhotoId.value = photoId
}

// ── 相册展开 ──
const expandedAlbum = ref(null)
function toggleAlbum(albumId) {
  expandedAlbum.value = expandedAlbum.value === albumId ? null : albumId
}
</script>

<template>
  <div class="photos-page">

    <!-- 顶部返回 -->
    <header class="topbar">
      <router-link to="/" class="back-link">← 返回</router-link>
    </header>

    <!-- Hero -->
    <section class="hero">
      <p class="eyebrow">PHOTOGRAPHY</p>
      <h1>Some moments<br>deserve to stay.</h1>
      <p class="subtitle">有些瞬间值得被留下。</p>
      <div class="scroll-tip">↓ Scroll</div>
    </section>

    <!-- Featured -->
    <section class="featured">
      <div
        v-for="(photo, i) in featured"
        :key="photo.id"
        class="photo-block"
        :class="{ reverse: i % 2 === 1 }"
        @click="openLightbox(photo.id)"
      >
        <img :src="photo.image" :alt="photo.title" />
        <div class="info">
          <h2>{{ photo.title }}</h2>
          <p>{{ getAlbumOfPhoto(photo.id)?.title || '' }}</p>
        </div>
      </div>
    </section>

    <!-- Albums -->
    <section class="albums-section">
      <div class="albums-header">
        <h2>Albums</h2>
        <p>按主题整理的作品集。</p>
      </div>

      <div class="albums-grid">
        <div
          v-for="album in albums"
          :key="album.id"
          class="album-card"
          :class="{ expanded: expandedAlbum === album.id }"
        >
          <!-- 相册封面 -->
          <div class="album-cover" @click="toggleAlbum(album.id)">
            <img :src="album.cover" :alt="album.title" />
            <div class="album-cover-text">
              <h3>{{ album.title }}</h3>
              <span>{{ album.description }} — {{ album.photos.length }} 张</span>
            </div>
          </div>

          <!-- 展开的照片网格 -->
          <div v-if="expandedAlbum === album.id" class="album-photos">
            <div
              v-for="photo in album.photos"
              :key="photo.id"
              class="album-photo-item"
              @click="openLightbox(photo.id)"
            >
              <img :src="photo.image" :alt="photo.title" loading="lazy" />
              <span class="ap-name">{{ photo.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Lightbox -->
    <PhotoLightbox
      v-if="activePhotoId"
      :photo-id="activePhotoId"
      @close="closeLightbox"
      @navigate="navigateLightbox"
    />
  </div>
</template>

<style scoped>
.photos-page {
  background: #f7f7f5;
  color: #1a1a1a;
}

/* ── 顶栏 ── */
.topbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  padding: 20px 28px;
}
.back-link {
  font-size: 0.88rem;
  color: #78716c;
  text-decoration: none;
  transition: color 0.2s;
}
.back-link:hover { color: #1a1a1a; }

/* ── HERO ── */
.hero {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 20px;
}
.eyebrow { letter-spacing: 0.3em; font-size: 12px; color: #888; margin-bottom: 24px; }
.hero h1 { font-size: 82px; line-height: 1.1; font-weight: 700; margin-bottom: 30px; }
.subtitle { color: #666; font-size: 18px; }
.scroll-tip { position: absolute; bottom: 50px; color: #999; font-size: 14px; }

/* ── FEATURED ── */
.featured { padding: 120px 10%; }
.photo-block {
  display: flex; align-items: center; gap: 80px;
  margin-bottom: 180px; cursor: pointer;
}
.photo-block.reverse { flex-direction: row-reverse; }
.photo-block img {
  width: 55%;
  height: auto;
  border-radius: 24px;
  transition: transform 0.4s;
}
.photo-block img:hover { transform: scale(1.01); }
.info { flex: 1; }
.info h2 { font-size: 48px; margin-bottom: 12px; }
.info p { color: #666; font-size: 18px; }

/* ── ALBUMS ── */
.albums-section { padding: 60px 10% 150px; }
.albums-header { margin-bottom: 48px; }
.albums-header h2 { font-size: 48px; margin-bottom: 10px; }
.albums-header p { color: #666; font-size: 17px; }

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

/* 相册卡片 */
.album-card {
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  transition: box-shadow 0.3s;
}
.album-card.expanded {
  grid-column: 1 / -1;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);
}

.album-cover {
  position: relative;
  cursor: pointer;
  overflow: hidden;
}
.album-cover img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  transition: transform 0.4s;
}
.album-card.expanded .album-cover img { height: 200px; }
.album-cover:hover img { transform: scale(1.03); }
.album-cover-text {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 32px 24px;
  background: linear-gradient(transparent, rgba(0,0,0,0.55));
  color: #fff;
}
.album-cover-text h3 {
  font-size: 1.4rem; font-weight: 650;
  margin: 0 0 4px;
}
.album-cover-text span {
  font-size: 0.85rem;
  opacity: 0.75;
}

/* 展开的照片网格 */
.album-photos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  padding: 20px 24px 24px;
  animation: expand-in 0.3s ease;
}
@keyframes expand-in {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.album-photo-item {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.25s;
}
.album-photo-item:hover { transform: translateY(-3px); }
.album-photo-item img {
  width: 100%; height: 180px;
  object-fit: cover;
  display: block;
}
.ap-name {
  display: block;
  padding: 8px 4px 4px;
  font-size: 0.82rem;
  color: #78716c;
}

/* ── MOBILE ── */
@media (max-width: 900px) {
  .hero h1 { font-size: 48px; }
  .photo-block, .photo-block.reverse { flex-direction: column; }
  .photo-block img { width: 100%; }
  .info { width: 100%; }
  .info h2 { font-size: 32px; }
  .albums-grid { grid-template-columns: 1fr; }
}
</style>
