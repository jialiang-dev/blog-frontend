<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePosts } from '../composables/usePosts.js'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'

const route = useRoute()
const router = useRouter()
const { getBySlug } = usePosts()

const post = computed(() => getBySlug(route.params.slug))

function fmt(date) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
}
</script>

<template>
  <div class="page">
    <!-- 不存在 -->
    <div v-if="!post" class="not-found">
      <h2>文章不存在</h2>
      <p>没有找到这篇随笔。</p>
      <router-link to="/essays">← 返回随笔列表</router-link>
    </div>

    <!-- 文章 -->
    <template v-else>
      <header class="article-header">
        <router-link to="/essays" class="back">← 随笔</router-link>
        <h1 class="article-title">{{ post.title }}</h1>
        <div class="article-meta">
          <time>{{ fmt(post.date) }}</time>
          <span v-for="t in post.tags" :key="t" class="article-tag">{{ t }}</span>
        </div>
      </header>

      <MarkdownRenderer :content="post.content" />

      <footer class="article-footer">
        <router-link to="/essays" class="footer-back">← 返回随笔列表</router-link>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 100px 24px 80px;
}

/* ── header ── */
.article-header {
  max-width: 680px;
  margin: 0 auto 48px;
}
.back {
  font-size: 0.85rem;
  color: #a8a29e;
  text-decoration: none;
  transition: color 0.2s;
}
.back:hover { color: #292524; }

.article-title {
  font-family: "PingFang SC", -apple-system, sans-serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 16px 0 12px;
  color: #1c1917;
  line-height: 1.25;
}
.article-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.88rem;
  color: #a8a29e;
}
.article-tag {
  font-size: 0.72rem;
  font-weight: 550;
  color: #78716c;
  background: #f5f5f4;
  padding: 2px 10px;
  border-radius: 6px;
  letter-spacing: 0.03em;
}

/* ── footer ── */
.article-footer {
  max-width: 680px;
  margin: 64px auto 0;
  padding-top: 32px;
  border-top: 1px solid #e7e5e4;
}
.footer-back {
  font-size: 0.9rem;
  color: #a8a29e;
  text-decoration: none;
  transition: color 0.2s;
}
.footer-back:hover { color: #292524; }

/* ── not found ── */
.not-found {
  max-width: 400px;
  margin: 120px auto;
  text-align: center;
  color: #78716c;
}
.not-found h2 { color: #1c1917; margin-bottom: 8px; }
.not-found a { color: #2563eb; text-decoration: none; }
</style>
